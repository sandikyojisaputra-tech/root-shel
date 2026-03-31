// Server action utilities and helper functions
export interface ServerActionPayload {
  action: 'start' | 'stop' | 'restart';
  startupCommand?: string;
  dockerImage?: string;
  autoExecute?: boolean;
}

export interface ServerActionResponse {
  status: 'running' | 'stopped' | 'starting' | 'stopping';
  message: string;
  timestamp: number;
  output?: string;
}

export interface StartupCommandPayload {
  command: string;
  dockerImage: string;
  envVars?: Array<{ key: string; value: string }>;
}

export interface StartupCommandResponse {
  success: boolean;
  output: string;
  exitCode?: number;
  timestamp: number;
}

/**
 * Perform a server action (start, stop, restart)
 */
export async function performServerAction(
  payload: ServerActionPayload
): Promise<ServerActionResponse> {
  try {
    const res = await fetch('/api/server/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Received non-JSON response from server');
    }

    return await res.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'stopped',
      message: `Failed to perform action: ${message}`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Execute a startup command
 */
export async function executeStartupCommand(
  payload: StartupCommandPayload
): Promise<StartupCommandResponse> {
  try {
    const res = await fetch('/api/server/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Received non-JSON response from server');
    }

    return await res.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      output: `Failed to execute command: ${message}`,
      exitCode: 1,
      timestamp: Date.now(),
    };
  }
}

/**
 * Validate a startup command syntax
 */
export function validateStartupCommand(command: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!command || command.trim().length === 0) {
    errors.push('Startup command cannot be empty');
  }

  // Check for dangerous commands
  const dangerousPatterns = ['rm -rf /', 'mkfs', ':(){:|:&};:'];
  if (dangerousPatterns.some(pattern => command.includes(pattern))) {
    errors.push('Command contains potentially dangerous patterns');
  }

  // Check command length
  if (command.length > 2048) {
    errors.push('Startup command is too long (max 2048 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format log timestamp
 */
export function formatLogTimestamp(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Create a log entry
 */
export function createLogEntry(
  message: string,
  level: 'info' | 'success' | 'error' | 'warning' = 'info'
): string {
  const timestamp = formatLogTimestamp();
  const prefix = {
    info: '[INFO]',
    success: '[✓]',
    error: '[✗]',
    warning: '[⚠]',
  }[level];

  return `${timestamp} ${prefix} ${message}`;
}

/**
 * Parse Docker image from config value
 */
export function parseDockerImage(imageString: string): {
  name: string;
  tag?: string;
} {
  const parts = imageString.split(':');
  return {
    name: parts[0],
    tag: parts[1],
  };
}

/**
 * Validate Docker image format
 */
export function validateDockerImage(image: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!image || image.trim().length === 0) {
    errors.push('Docker image cannot be empty');
  }

  // Check valid Docker image format
  const dockerImageRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?::[a-zA-Z0-9_][a-zA-Z0-9._-]{0,127})?(?:\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*)?$/;

  if (image.length > 256) {
    errors.push('Docker image name is too long (max 256 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended startup command for Docker image
 */
export function getRecommendedCommand(dockerImage: string): string {
  const commands: { [key: string]: string } = {
    'node': 'node app.js',
    'python': 'python3 app.py',
    'java': 'java -jar app.jar',
    'go': './app',
    'rust': './target/release/app',
    'ruby': 'ruby app.rb',
    'php': 'apache2-foreground',
    'dotnet': 'dotnet app.dll',
    'minecraft': '/start.sh',
    'postgres': 'postgres',
    'mysql': 'docker-entrypoint.sh mysqld',
    'mongodb': 'mongod --bind_ip_all',
    'redis': 'redis-server',
  };

  for (const [key, cmd] of Object.entries(commands)) {
    if (dockerImage.includes(key)) {
      return cmd;
    }
  }

  return 'echo "Server started"';
}
