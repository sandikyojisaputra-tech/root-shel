import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { spawn } from "child_process";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import https from "https";
import os from "os";
import fs from "fs";
import multer from "multer";
import AdmZip from "adm-zip";
import { execSync } from "child_process";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch (e) {
    // dotenv not required in production
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Environment configuration
const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || "0.0.0.0",
  SERVER_STATUS: (process.env.SERVER_STATUS || "running") as 'running' | 'offline',
  MONITORING_INTERVAL: Number(process.env.MONITORING_INTERVAL) || 1000,
  WS_HEARTBEAT_INTERVAL: Number(process.env.WS_HEARTBEAT_INTERVAL) || 30000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info"
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = req.query.path as string || "/home/workspace/uploads";
    if (uploadPath.includes("..")) {
      return cb(new Error("Access denied"), "");
    }
    // Ensure path is absolute
    if (!path.isAbsolute(uploadPath)) {
      uploadPath = path.join("/home/workspace", uploadPath);
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

const LOG_FILE = path.join(__dirname, "audit-logs.json");
const CONFIG_FILE = path.join(__dirname, "server-config.json");

let serverStatus: 'running' | 'starting' | 'stopping' | 'offline' = 'running';

// Real-time monitoring data
interface SystemStats {
  timestamp: number;
  cpu: number;
  memory: { used: number; total: number; percentage: number };
  disk: { used: number; total: number; percentage: number };
  network: { bytesIn: number; bytesOut: number };
  uptime: number;
}

let systemStats: SystemStats = {
  timestamp: Date.now(),
  cpu: 0,
  memory: { used: 0, total: 0, percentage: 0 },
  disk: { used: 0, total: 0, percentage: 0 },
  network: { bytesIn: 0, bytesOut: 0 },
  uptime: 0
};

// WebSocket clients for broadcasting
let wsClients = new Set<any>();

// Helper function to get system stats
async function getSystemStats(): Promise<SystemStats> {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const loadAvg = os.loadavg();
  
  // Get disk usage
  let diskUsed = 0, diskTotal = 0;
  try {
    const dfOutput = execSync("df -B1 /").toString().split("\n")[1].split(/\s+/);
    diskTotal = parseInt(dfOutput[1]);
    diskUsed = parseInt(dfOutput[2]);
  } catch (e) {
    // Fallback if df fails
    diskTotal = 1000000000000;
    diskUsed = 500000000000;
  }

  return {
    timestamp: Date.now(),
    cpu: Math.round(loadAvg[0] * 100) / 10,
    memory: {
      used: Math.round(usedMem / 1024 / 1024),
      total: Math.round(totalMem / 1024 / 1024),
      percentage: Math.round((usedMem / totalMem) * 100)
    },
    disk: {
      used: Math.round(diskUsed / 1024 / 1024 / 1024),
      total: Math.round(diskTotal / 1024 / 1024 / 1024),
      percentage: Math.round((diskUsed / diskTotal) * 100)
    },
    network: { bytesIn: 0, bytesOut: 0 },
    uptime: Math.round(os.uptime())
  };
}

function logAction(action: string, details: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    user: "root" // Default for now
  };
  
  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      const data = fs.readFileSync(LOG_FILE, "utf8");
      logs = JSON.parse(data);
    }
    logs.unshift(logEntry);
    if (logs.length > 1000) logs = logs.slice(0, 1000);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error("Failed to write audit log", e);
  }
}

async function getPublicIP(): Promise<string> {
  return new Promise((resolve) => {
    const request = https.get("https://api.ipify.org", { timeout: 5000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data.trim()));
    });
    
    request.on("error", () => resolve("127.0.0.1"));
    request.on("timeout", () => {
      request.destroy();
      resolve("127.0.0.1");
    });
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  
  let publicIP = "127.0.0.1";
  
  // Fetch public IP in the background to avoid blocking server startup
  getPublicIP().then(ip => {
    publicIP = ip;
    console.log(`Public IP detected: ${publicIP}`);
  });

  // Ensure workspace directory exists
  const workspaceDir = "/home/workspace";
  if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true });
    console.log("Created 'workspace' directory");
  }

  // Ensure uploads directory exists
  const uploadsDir = path.join(workspaceDir, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Created 'uploads' directory");
  }

  app.use(express.json());

  app.get("/api/status", (req, res) => {
    res.json({ status: serverStatus });
  });

  app.post("/api/server/action", (req, res) => {
    const { action, startupCommand, dockerImage, autoExecute } = req.body;
    
    if (!['start', 'stop', 'restart'].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (action === 'start') {
      if (serverStatus === 'running') return res.json({ status: serverStatus });
      serverStatus = 'starting';
      logAction("SERVER_START", { previousStatus: "offline", dockerImage, startupCommand, autoExecute });
      
      // Broadcast status change
      broadcastMessage({ type: 'server_status', status: 'starting' });
      
      setTimeout(() => {
        serverStatus = 'running';
        broadcastMessage({ type: 'server_status', status: 'running' });
        
        // Auto-execute startup command if enabled
        if (autoExecute && startupCommand) {
          broadcastMessage({ type: 'startup_executing', command: startupCommand });
        }
      }, 2000);
    } else if (action === 'stop') {
      if (serverStatus === 'offline') return res.json({ status: serverStatus });
      serverStatus = 'stopping';
      logAction("SERVER_STOP", { previousStatus: "running" });
      broadcastMessage({ type: 'server_status', status: 'stopping' });
      
      setTimeout(() => {
        serverStatus = 'offline';
        broadcastMessage({ type: 'server_status', status: 'offline' });
      }, 2000);
    } else if (action === 'restart') {
      serverStatus = 'stopping';
      logAction("SERVER_RESTART", { previousStatus: serverStatus, dockerImage, startupCommand, autoExecute });
      broadcastMessage({ type: 'server_status', status: 'stopping' });
      
      setTimeout(() => {
        serverStatus = 'starting';
        broadcastMessage({ type: 'server_status', status: 'starting' });
        
        setTimeout(() => {
          serverStatus = 'running';
          broadcastMessage({ type: 'server_status', status: 'running' });
          
          // Auto-execute startup command if enabled
          if (autoExecute && startupCommand) {
            broadcastMessage({ type: 'startup_executing', command: startupCommand });
          }
        }, 2000);
      }, 2000);
    }

    res.json({ status: serverStatus });
  });

  // Execute startup command
  app.post("/api/server/execute", (req, res) => {
    const { command, dockerImage } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    logAction("STARTUP_EXECUTE", { command, dockerImage });
    broadcastMessage({ type: 'startup_executing', command, dockerImage });
    
    // Simulate command execution (in production, use docker exec or similar)
    setTimeout(() => {
      const output = `Executed: ${command}`;
      broadcastMessage({ type: 'startup_executed', command, output });
      res.json({ status: 'success', output });
    }, 1500);
  });

  // Get real-time stats
  app.get("/api/server/stats", (req, res) => {
    res.json(systemStats);
  });

  // Broadcast message to all connected WebSocket clients
  function broadcastMessage(message: any) {
    const data = JSON.stringify(message);
    wsClients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        try {
          client.send(data);
        } catch (e) {
          wsClients.delete(client);
        }
      }
    });
  }

  // Start real-time monitoring
  setInterval(async () => {
    systemStats = await getSystemStats();
    broadcastMessage({ type: 'stats_update', data: systemStats });
  }, ENV.MONITORING_INTERVAL);

  app.get("/api/config", (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, "utf8");
        return res.json(JSON.parse(data));
      }
      // Default config
      const defaultConfig = {
        startupCommand: "npm start",
        dockerImage: "ghcr.io/pterodactyl/yolks:node_20",
        envVars: [
          { key: "SERVER_PORT", value: "3000" },
          { key: "NODE_VERSION", value: "20.x" }
        ]
      };
      res.json(defaultConfig);
    } catch (error) {
      res.status(500).json({ error: "Failed to load config" });
    }
  });

  app.post("/api/config", (req, res) => {
    try {
      const config = req.body;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      logAction("CONFIG_UPDATE", { config });
      res.json({ message: "Config updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save config" });
    }
  });

  app.get("/api/info", async (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const loadAvg = os.loadavg();
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : "Unknown";
    
    // Get disk usage using df -h
    let diskInfo = { total: "0G", used: "0G", free: "0G", usage: 0, io: "Low" };
    try {
      const dfOutput = execSync("df -h /").toString().split("\n")[1].split(/\s+/);
      diskInfo = {
        total: dfOutput[1],
        used: dfOutput[2],
        free: dfOutput[3],
        usage: parseInt(dfOutput[4].replace("%", "")),
        io: "0.00 MB/s" // Placeholder for real-time I/O
      };
      
      // Try to get some real-time I/O if possible (very basic)
      try {
        const stats1 = fs.readFileSync("/proc/diskstats", "utf8").split("\n").find(l => l.includes("sda") || l.includes("vda") || l.includes("sda1"));
        if (stats1) {
          const parts1 = stats1.trim().split(/\s+/);
          const read1 = parseInt(parts1[5]);
          const write1 = parseInt(parts1[9]);
          
          // We'd need a delay to calculate rate, but for now we'll just show activity
          diskInfo.io = "Active";
        }
      } catch (e) {}
    } catch (e) {
      console.error("Failed to get disk info", e);
    }

    // Get location info (optional, using a public API)
    let location = "Unknown";
    try {
      if (publicIP && publicIP !== "127.0.0.1") {
        const locRes = await fetch("http://ip-api.com/json/" + publicIP);
        if (locRes.ok) {
          const locData = await locRes.json();
          if (locData.status === "success") {
            location = `${locData.city}, ${locData.countryCode}`;
          }
        }
      }
    } catch (e) {
      // Ignore location fetch errors
    }
    
    res.json({ 
      server: os.hostname(),
      ip: publicIP,
      location: location,
      os: `${os.type()} ${os.release()} ${os.arch()}`,
      uptime: Math.round(os.uptime()), // Seconds
      cpu: {
        model: cpuModel,
        usage: Math.round(loadAvg[0] * 100) / 10
      },
      mem: {
        used: Math.round(usedMem / 1024 / 1024), // MB
        free: Math.round(freeMem / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        usage: Math.round((usedMem / totalMem) * 100)
      },
      disk: diskInfo
    });
  });

  app.get("/api/audit-logs", (req, res) => {
    try {
      if (fs.existsSync(LOG_FILE)) {
        const data = fs.readFileSync(LOG_FILE, "utf8");
        return res.json(JSON.parse(data));
      }
      res.json([]);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.post("/api/extract", (req, res) => {
    const { path: filePath } = req.body;
    if (!filePath || filePath.includes("..")) {
      return res.status(400).json({ error: "Invalid path" });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    try {
      const zip = new AdmZip(filePath);
      const targetDir = path.dirname(filePath);
      zip.extractAllTo(targetDir, true);
      logAction("EXTRACT_ZIP", { path: filePath });
      res.json({ message: "Extracted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to extract ZIP" });
    }
  });

  app.post("/api/create-file", (req, res) => {
    const { path: filePath, name } = req.body;
    if (!filePath || !name || filePath.includes("..") || name.includes("..")) {
      return res.status(400).json({ error: "Invalid path or name" });
    }
    const fullPath = path.join(filePath, name);
    try {
      if (fs.existsSync(fullPath)) {
        return res.status(400).json({ error: "File already exists" });
      }
      fs.writeFileSync(fullPath, "");
      logAction("CREATE_FILE", { path: fullPath });
      res.json({ message: "File created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  app.post("/api/create-folder", (req, res) => {
    const { path: dirPath, name } = req.body;
    if (!dirPath || !name || dirPath.includes("..") || name.includes("..")) {
      return res.status(400).json({ error: "Invalid path or name" });
    }
    const fullPath = path.join(dirPath, name);
    try {
      if (fs.existsSync(fullPath)) {
        return res.status(400).json({ error: "Folder already exists" });
      }
      fs.mkdirSync(fullPath, { recursive: true });
      logAction("CREATE_FOLDER", { path: fullPath });
      res.json({ message: "Folder created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create folder" });
    }
  });

  app.post("/api/rename", (req, res) => {
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath || oldPath.includes("..") || newPath.includes("..")) {
      return res.status(400).json({ error: "Invalid path" });
    }
    try {
      if (!fs.existsSync(oldPath)) {
        return res.status(404).json({ error: "Source not found" });
      }
      if (fs.existsSync(newPath)) {
        return res.status(400).json({ error: "Destination already exists" });
      }
      fs.renameSync(oldPath, newPath);
      logAction("RENAME", { from: oldPath, to: newPath });
      res.json({ message: "Renamed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to rename" });
    }
  });

  app.post("/api/copy", (req, res) => {
    const { source, destination } = req.body;
    if (!source || !destination || source.includes("..") || destination.includes("..")) {
      return res.status(400).json({ error: "Invalid path" });
    }
    try {
      if (!fs.existsSync(source)) {
        return res.status(404).json({ error: "Source not found" });
      }
      const stats = fs.statSync(source);
      if (stats.isDirectory()) {
        fs.cpSync(source, destination, { recursive: true });
      } else {
        fs.copyFileSync(source, destination);
      }
      logAction("COPY", { from: source, to: destination });
      res.json({ message: "Copied successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to copy" });
    }
  });

  app.post("/api/move", (req, res) => {
    const { source, destination } = req.body;
    if (!source || !destination || source.includes("..") || destination.includes("..")) {
      return res.status(400).json({ error: "Invalid path" });
    }
    try {
      if (!fs.existsSync(source)) {
        return res.status(404).json({ error: "Source not found" });
      }
      if (fs.existsSync(destination)) {
        return res.status(400).json({ error: "Destination already exists" });
      }
      fs.renameSync(source, destination);
      logAction("MOVE", { from: source, to: destination });
      res.json({ message: "Moved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to move" });
    }
  });

  app.post("/api/compress", (req, res) => {
    const { paths, name } = req.body;
    if (!Array.isArray(paths) || !name || name.includes("..")) {
      return res.status(400).json({ error: "Invalid paths or name" });
    }
    try {
      const zip = new AdmZip();
      for (const filePath of paths) {
        if (filePath.includes("..")) continue;
        if (!fs.existsSync(filePath)) continue;
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          zip.addLocalFolder(filePath, path.basename(filePath));
        } else {
          zip.addLocalFile(filePath);
        }
      }
      const targetPath = path.join(path.dirname(paths[0]), name.endsWith(".zip") ? name : name + ".zip");
      zip.writeZip(targetPath);
      logAction("COMPRESS", { paths, target: targetPath });
      res.json({ message: "Compressed successfully", path: targetPath });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to compress" });
    }
  });

  app.get("/api/read-file", (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath || filePath.includes("..")) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    try {
      const content = fs.readFileSync(filePath, "utf8");
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: "Failed to read file" });
    }
  });

  app.post("/api/save-file", (req, res) => {
    const { path: filePath, content } = req.body;
    if (!filePath || filePath.includes("..")) {
      return res.status(403).json({ error: "Access denied" });
    }
    try {
      fs.writeFileSync(filePath, content);
      logAction("SAVE_FILE", { path: filePath });
      res.json({ message: "File saved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save file" });
    }
  });

  app.get("/api/files", (req, res) => {
    const dirPath = req.query.path as string || "/home/workspace";
    
    if (dirPath.includes("..")) {
      return res.status(403).json({ error: "Access denied" });
    }

    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      const result = files.map(file => {
        const filePath = path.join(dirPath, file.name);
        try {
          const stats = fs.statSync(filePath);
          return {
            name: file.name,
            isDirectory: file.isDirectory(),
            size: file.isDirectory() ? 0 : stats.size,
            mtime: stats.mtime
          };
        } catch (e) {
          return {
            name: file.name,
            isDirectory: file.isDirectory(),
            size: 0,
            mtime: new Date()
          };
        }
      });
      res.json({ path: dirPath, files: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to read directory" });
    }
  });

  app.post("/api/upload", upload.array("file"), (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [];
    for (const file of files) {
      const filePath = file.path;
      const isZip = file.originalname.toLowerCase().endsWith(".zip");

      if (isZip) {
        try {
          const zip = new AdmZip(filePath);
          const targetDir = path.dirname(filePath);
          
          console.log(`Extracting ZIP: ${file.originalname} to ${targetDir}`);
          zip.extractAllTo(targetDir, true);
          
          const entries = zip.getEntries();
          fs.unlinkSync(filePath);
          logAction("UPLOAD_EXTRACT", { filename: file.originalname, path: targetDir, entries: entries.length });
          results.push({ filename: file.originalname, extracted: true, count: entries.length });
        } catch (error) {
          console.error("Failed to extract ZIP after upload", error);
          results.push({ filename: file.originalname, error: "Failed to extract ZIP" });
        }
      } else {
        logAction("UPLOAD", { filename: file.originalname, path: filePath });
        results.push({ filename: file.originalname, uploaded: true });
      }
    }

    res.json({ message: "Upload process completed", results });
  });

  app.delete("/api/clear-directory", (req, res) => {
    const dirPath = req.query.path as string;
    if (!dirPath || dirPath.includes("..")) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: "Directory not found" });
    }

    try {
      const files = fs.readdirSync(dirPath);
      const appFiles = ['server.ts', 'package.json', 'package-lock.json', 'node_modules', 'src', 'dist', 'metadata.json', '.env.example', 'tsconfig.json', 'vite.config.ts', 'firebase-applet-config.json', 'firebase-blueprint.json', 'firestore.rules', 'firebase.ts'];
      for (const file of files) {
        if (dirPath === "/" && appFiles.includes(file)) continue;
        const fullPath = path.join(dirPath, file);
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
      logAction("CLEAR_DIRECTORY", { path: dirPath });
      res.json({ message: "Directory cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear directory" });
    }
  });

  app.get("/api/download", (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath || filePath.includes("..")) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    res.download(filePath);
  });

  app.delete("/api/delete", (req, res) => {
    let filePath = req.query.path as string;
    if (!filePath || filePath.includes("..")) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Normalize path to fix double slashes
    filePath = path.normalize(filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Protect app files
    const appFiles = ['server.ts', 'package.json', 'package-lock.json', 'node_modules', 'src', 'dist', 'metadata.json', '.env.example', 'tsconfig.json', 'vite.config.ts', 'firebase-applet-config.json', 'firebase-blueprint.json', 'firestore.rules', 'firebase.ts'];
    const absolutePath = path.resolve(filePath);
    const fileName = path.basename(absolutePath);
    const dirName = path.dirname(absolutePath);
    const rootDir = path.resolve("/");
    
    if (dirName === rootDir && appFiles.includes(fileName)) {
      return res.status(403).json({ error: "Cannot delete critical application files" });
    }

    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
      logAction("DELETE", { path: filePath });
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete" });
    }
  });

  app.post("/api/delete-multiple", (req, res) => {
    const { paths } = req.body;
    if (!Array.isArray(paths)) {
      return res.status(400).json({ error: "Invalid paths" });
    }

    const results = [];
    const appFiles = ['server.ts', 'package.json', 'package-lock.json', 'node_modules', 'src', 'dist', 'metadata.json', '.env.example', 'tsconfig.json', 'vite.config.ts', 'firebase-applet-config.json', 'firebase-blueprint.json', 'firestore.rules', 'firebase.ts'];
    
    for (let filePath of paths) {
      if (!filePath || filePath.includes("..")) {
        results.push({ path: filePath, status: "error", message: "Access denied" });
        continue;
      }

      filePath = path.normalize(filePath);

      if (!fs.existsSync(filePath)) {
        results.push({ path: filePath, status: "error", message: "File not found" });
        continue;
      }

      const absolutePath = path.resolve(filePath);
      const fileName = path.basename(absolutePath);
      const dirName = path.dirname(absolutePath);
      const rootDir = path.resolve("/");
      
      if (dirName === rootDir && appFiles.includes(fileName)) {
        results.push({ path: filePath, status: "error", message: "Cannot delete critical application files" });
        continue;
      }

      try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        results.push({ path: filePath, status: "success" });
      } catch (error) {
        results.push({ path: filePath, status: "error", message: "Failed to delete" });
      }
    }
    
    const successfulDeletions = results.filter(r => r.status === "success").map(r => r.path);
    if (successfulDeletions.length > 0) {
      logAction("DELETE_MULTIPLE", { count: successfulDeletions.length, paths: successfulDeletions });
    }
    
    res.json({ results });
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const customShell = url.searchParams.get("shell") || "/bin/bash";
    
    console.log(`New WebSocket connection with shell: ${customShell}`);
    
    // Add to connected clients
    wsClients.add(ws);
    
    // Send initial status to new client
    ws.send(JSON.stringify({ 
      type: 'initial', 
      status: serverStatus,
      stats: systemStats
    }));

    // Spawn a shell process
    // Using python3 pty trick to get a better shell (PTY-like)
    // This fixes "Inappropriate ioctl for device" and allows job control
    const shell = spawn("python3", ["-c", `import pty; pty.spawn("${customShell}")`], {
      env: { 
        ...process.env, 
        TERM: "xterm-256color",
        HOME: "/home/workspace",
        USER: "root",
        PS1: "root@ojicmnty:\\w\\$ ",
        HOSTNAME: "ojicmnty"
      },
      cwd: "/home/workspace",
    });

    let outputBuffer = Buffer.alloc(0);
    let flushTimeout: NodeJS.Timeout | null = null;

    const flushOutput = () => {
      if (outputBuffer.length > 0) {
        if (ws.readyState === 1) { // OPEN
          ws.send(outputBuffer);
        }
        outputBuffer = Buffer.alloc(0);
      }
      flushTimeout = null;
    };

    shell.stdout.on("data", (data) => {
      outputBuffer = Buffer.concat([outputBuffer, data]);
      if (outputBuffer.length > 4096) {
        if (flushTimeout) clearTimeout(flushTimeout);
        flushOutput();
      } else if (!flushTimeout) {
        flushTimeout = setTimeout(flushOutput, 10);
      }
    });

    shell.stderr.on("data", (data) => {
      outputBuffer = Buffer.concat([outputBuffer, data]);
      if (outputBuffer.length > 4096) {
        if (flushTimeout) clearTimeout(flushTimeout);
        flushOutput();
      } else if (!flushTimeout) {
        flushTimeout = setTimeout(flushOutput, 10);
      }
    });

    shell.on("close", () => {
      if (flushTimeout) clearTimeout(flushTimeout);
      flushOutput();
      ws.close();
    });

    ws.on("message", (message) => {
      const msg = message.toString();
      try {
        const parsed = JSON.parse(msg);
        if (parsed.type === "resize") {
          // Attempt to resize using stty if possible
          // This is a best-effort approach since we don't have node-pty
          shell.stdin.write(`stty cols ${parsed.cols} rows ${parsed.rows}\n`);
          return;
        }
      } catch (e) {
        // Not JSON, treat as raw input
      }
      shell.stdin.write(message);
    });

    ws.on("close", () => {
      shell.kill();
      wsClients.delete(ws);
      console.log("WebSocket connection closed");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(ENV.PORT, ENV.HOST, () => {
    console.log(`Server running on ${ENV.HOST}:${ENV.PORT}`);
    console.log(`Environment: ${ENV.NODE_ENV}`);
    console.log(`Monitoring interval: ${ENV.MONITORING_INTERVAL}ms`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

startServer();
