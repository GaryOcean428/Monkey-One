#!/usr/bin/env ts-node

/**
 * Ollama GPU Management Script
 * Handles safe startup, shutdown, and status checking of Ollama with GPU support
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

// Constants for configuration
const CONSTANTS = {
  OLLAMA_PORT: 11434,
  GPU_DEVICE: '0',
  LOG_DIR: path.join(process.env.HOME || '', '.ollama', 'logs'),
  PID_FILE: path.join(process.env.HOME || '', '.ollama', 'ollama.pid'),
} as const;

/**
 * Check if a port is in use
 * @param port - Port number to check
 * @returns Promise<boolean> - True if port is in use
 */
async function isPortInUse(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`lsof -i :${port}`);
    return stdout.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if Ollama process is running
 * @returns Promise<number | null> - Process ID if running, null otherwise
 */
async function getOllamaProcess(): Promise<number | null> {
  try {
    const { stdout } = await execAsync('pgrep ollama');
    return parseInt(stdout.trim(), 10);
  } catch {
    return null;
  }
}

/**
 * Safely stop Ollama process
 * @returns Promise<void>
 */
async function stopOllama(): Promise<void> {
  const pid = await getOllamaProcess();
  if (!pid) {
    console.log('Ollama is not running');
    return;
  }

  try {
    // Try graceful shutdown first
    await execAsync(`kill ${pid}`);
    console.log('Sent shutdown signal to Ollama');

    // Wait for process to end
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force kill if still running
    if (await getOllamaProcess()) {
      await execAsync(`kill -9 ${pid}`);
      console.log('Force stopped Ollama');
    }
  } catch (error) {
    console.error('Error stopping Ollama:', error);
    throw error;
  }
}

/**
 * Start Ollama with GPU support
 * @returns Promise<void>
 */
async function startOllamaGPU(): Promise<void> {
  try {
    // Create log directory if it doesn't exist
    await fs.mkdir(CONSTANTS.LOG_DIR, { recursive: true });

    const logFile = path.join(CONSTANTS.LOG_DIR, `ollama-${Date.now()}.log`);
    const logStream = fs.createWriteStream(logFile);

    // Set GPU environment variable
    const env = {
      ...process.env,
      CUDA_VISIBLE_DEVICES: CONSTANTS.GPU_DEVICE,
    };

    // Start Ollama process
    const ollamaProcess = spawn('ollama', ['serve'], {
      env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Save PID for later management
    await fs.writeFile(CONSTANTS.PID_FILE, ollamaProcess.pid?.toString() || '');

    // Pipe output to log file
    ollamaProcess.stdout.pipe(logStream);
    ollamaProcess.stderr.pipe(logStream);

    console.log(`Started Ollama with GPU support (PID: ${ollamaProcess.pid})`);
    console.log(`Logs available at: ${logFile}`);

    // Detach process
    ollamaProcess.unref();
  } catch (error) {
    console.error('Error starting Ollama:', error);
    throw error;
  }
}

/**
 * Check Ollama status
 * @returns Promise<void>
 */
async function checkStatus(): Promise<void> {
  const pid = await getOllamaProcess();
  const portInUse = await isPortInUse(CONSTANTS.OLLAMA_PORT);

  console.log('Ollama Status:');
  console.log(`- Process: ${pid ? `Running (PID: ${pid})` : 'Not running'}`);
  console.log(`- Port ${CONSTANTS.OLLAMA_PORT}: ${portInUse ? 'In use' : 'Free'}`);

  if (pid) {
    try {
      const { stdout } = await execAsync('nvidia-smi --query-gpu=gpu_name,memory.used,utilization.gpu --format=csv,noheader');
      console.log('GPU Status:');
      console.log(stdout);
    } catch {
      console.log('GPU Status: Unable to query GPU');
    }
  }
}

/**
 * Main function to handle command line arguments
 */
async function main(): Promise<void> {
  const command = process.argv[2]?.toLowerCase();

  try {
    switch (command) {
      case 'start':
        if (await getOllamaProcess()) {
          console.log('Ollama is already running. Stop it first.');
          break;
        }
        await startOllamaGPU();
        break;

      case 'stop':
        await stopOllama();
        break;

      case 'restart':
        await stopOllama();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await startOllamaGPU();
        break;

      case 'status':
        await checkStatus();
        break;

      default:
        console.log(`
Usage: ts-node manage-ollama.ts <command>
Commands:
  start   - Start Ollama with GPU support
  stop    - Stop Ollama
  restart - Restart Ollama with GPU support
  status  - Check Ollama and GPU status
        `);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(console.error);
