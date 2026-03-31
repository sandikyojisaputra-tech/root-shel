// Docker image configurations for different runtime environments
export interface DockerImage {
  id: string;
  name: string;
  displayName: string;
  category: 'runtime' | 'game-server' | 'database' | 'utility' | 'custom';
  description: string;
  defaultCmd: string;
  tags: string[];
  icon?: string;
  isPopular?: boolean;
}

export const DOCKER_IMAGES: DockerImage[] = [
  // Runtime Environments
  {
    id: 'node-lts',
    name: 'node:lts',
    displayName: 'Node.js LTS',
    category: 'runtime',
    description: 'Node.js runtime with npm package manager',
    defaultCmd: 'node app.js',
    tags: ['javascript', 'nodejs', 'npm', 'runtime'],
    isPopular: true,
  },
  {
    id: 'node-latest',
    name: 'node:latest',
    displayName: 'Node.js Latest',
    category: 'runtime',
    description: 'Latest Node.js version',
    defaultCmd: 'node app.js',
    tags: ['javascript', 'nodejs', 'npm', 'runtime'],
  },
  {
    id: 'python-3.11',
    name: 'python:3.11',
    displayName: 'Python 3.11',
    category: 'runtime',
    description: 'Python runtime with pip package manager',
    defaultCmd: 'python3 app.py',
    tags: ['python', 'runtime', 'pip'],
    isPopular: true,
  },
  {
    id: 'python-3.10',
    name: 'python:3.10',
    displayName: 'Python 3.10',
    category: 'runtime',
    description: 'Python 3.10 runtime',
    defaultCmd: 'python3 app.py',
    tags: ['python', 'runtime', 'pip'],
  },
  {
    id: 'python-3.9',
    name: 'python:3.9',
    displayName: 'Python 3.9',
    category: 'runtime',
    description: 'Python 3.9 runtime',
    defaultCmd: 'python3 app.py',
    tags: ['python', 'runtime', 'pip'],
  },
  {
    id: 'java-17',
    name: 'eclipse-temurin:17',
    displayName: 'Java 17',
    category: 'runtime',
    description: 'Java 17 Eclipse Temurin runtime',
    defaultCmd: 'java -jar app.jar',
    tags: ['java', 'jvm', 'maven', 'gradle'],
    isPopular: true,
  },
  {
    id: 'java-21',
    name: 'eclipse-temurin:21',
    displayName: 'Java 21 LTS',
    category: 'runtime',
    description: 'Java 21 LTS Eclipse Temurin runtime',
    defaultCmd: 'java -jar app.jar',
    tags: ['java', 'jvm', 'maven', 'gradle'],
  },
  {
    id: 'go-latest',
    name: 'golang:latest',
    displayName: 'Go Latest',
    category: 'runtime',
    description: 'Go programming language runtime',
    defaultCmd: './app',
    tags: ['go', 'golang', 'runtime'],
  },
  {
    id: 'rust-latest',
    name: 'rust:latest',
    displayName: 'Rust Latest',
    category: 'runtime',
    description: 'Rust programming language runtime',
    defaultCmd: './target/release/app',
    tags: ['rust', 'cargo', 'runtime'],
  },
  {
    id: 'ruby-3.2',
    name: 'ruby:3.2',
    displayName: 'Ruby 3.2',
    category: 'runtime',
    description: 'Ruby programming language with bundler',
    defaultCmd: 'ruby app.rb',
    tags: ['ruby', 'rails', 'gems', 'runtime'],
  },
  {
    id: 'php-8.2',
    name: 'php:8.2-apache',
    displayName: 'PHP 8.2 Apache',
    category: 'runtime',
    description: 'PHP 8.2 with Apache web server',
    defaultCmd: 'apache2-foreground',
    tags: ['php', 'apache', 'web', 'runtime'],
  },
  {
    id: 'dotnet-7',
    name: 'mcr.microsoft.com/dotnet/runtime:7.0',
    displayName: '.NET 7',
    category: 'runtime',
    description: 'Microsoft .NET 7 runtime',
    defaultCmd: 'dotnet app.dll',
    tags: ['dotnet', 'csharp', 'runtime'],
  },

  // Game Servers
  {
    id: 'minecraft-java',
    name: 'itzg/minecraft-server:latest',
    displayName: 'Minecraft Java Edition',
    category: 'game-server',
    description: 'Minecraft Java server with EULA accepted',
    defaultCmd: '/start.sh',
    tags: ['minecraft', 'game', 'java', 'server'],
    isPopular: true,
  },
  {
    id: 'rust-server',
    name: 'didstopia/rust-server:latest',
    displayName: 'Rust Game Server',
    category: 'game-server',
    description: 'Rust dedicated game server',
    defaultCmd: '/start.sh',
    tags: ['rust', 'game', 'multiplayer'],
  },
  {
    id: 'csgo-server',
    name: 'cm2network/csgo:latest',
    displayName: 'CS:GO Server',
    category: 'game-server',
    description: 'Counter-Strike: Global Offensive server',
    defaultCmd: '/start.sh',
    tags: ['csgo', 'game', 'fps'],
  },
  {
    id: 'factorio-server',
    name: 'factoriotools/factorio:latest',
    displayName: 'Factorio Server',
    category: 'game-server',
    description: 'Factorio dedicated server',
    defaultCmd: '/init',
    tags: ['factorio', 'game', 'multiplayer'],
  },
  {
    id: 'valheim-server',
    name: 'mbround18/valheim:latest',
    displayName: 'Valheim Server',
    category: 'game-server',
    description: 'Valheim dedicated game server',
    defaultCmd: '/start.sh',
    tags: ['valheim', 'game', 'multiplayer'],
  },

  // Databases
  {
    id: 'mysql-8',
    name: 'mysql:8.0',
    displayName: 'MySQL 8.0',
    category: 'database',
    description: 'MySQL relational database server',
    defaultCmd: 'docker-entrypoint.sh mysqld',
    tags: ['mysql', 'database', 'sql'],
  },
  {
    id: 'postgresql-15',
    name: 'postgres:15',
    displayName: 'PostgreSQL 15',
    category: 'database',
    description: 'PostgreSQL relational database',
    defaultCmd: 'postgres',
    tags: ['postgresql', 'postgres', 'database', 'sql'],
  },
  {
    id: 'mongodb',
    name: 'mongo:latest',
    displayName: 'MongoDB Latest',
    category: 'database',
    description: 'MongoDB NoSQL database server',
    defaultCmd: 'mongod --bind_ip_all',
    tags: ['mongodb', 'database', 'nosql'],
  },
  {
    id: 'redis',
    name: 'redis:latest',
    displayName: 'Redis Latest',
    category: 'database',
    description: 'Redis in-memory data structure store',
    defaultCmd: 'redis-server',
    tags: ['redis', 'cache', 'database'],
  },

  // Utilities
  {
    id: 'ubuntu-22',
    name: 'ubuntu:22.04',
    displayName: 'Ubuntu 22.04',
    category: 'utility',
    description: 'Ubuntu base image for custom environments',
    defaultCmd: '/bin/bash',
    tags: ['ubuntu', 'linux', 'base'],
  },
  {
    id: 'alpine-latest',
    name: 'alpine:latest',
    displayName: 'Alpine Linux',
    category: 'utility',
    description: 'Minimal Linux distribution',
    defaultCmd: '/bin/sh',
    tags: ['alpine', 'linux', 'base', 'lightweight'],
  },
  {
    id: 'debian-bookworm',
    name: 'debian:bookworm',
    displayName: 'Debian Bookworm',
    category: 'utility',
    description: 'Debian Linux base image',
    defaultCmd: '/bin/bash',
    tags: ['debian', 'linux', 'base'],
  },
];

export const DOCKER_CATEGORIES = {
  'runtime': 'Runtime Environments',
  'game-server': 'Game Servers',
  'database': 'Databases',
  'utility': 'Utilities',
  'custom': 'Custom Images',
};

export function getImagesByCategory(category: string): DockerImage[] {
  return DOCKER_IMAGES.filter(img => img.category === category);
}

export function getPopularImages(): DockerImage[] {
  return DOCKER_IMAGES.filter(img => img.isPopular);
}

export function getImageById(id: string): DockerImage | undefined {
  return DOCKER_IMAGES.find(img => img.id === id);
}

export function searchImages(query: string): DockerImage[] {
  const lowerQuery = query.toLowerCase();
  return DOCKER_IMAGES.filter(img => 
    img.name.toLowerCase().includes(lowerQuery) ||
    img.displayName.toLowerCase().includes(lowerQuery) ||
    img.description.toLowerCase().includes(lowerQuery) ||
    img.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
