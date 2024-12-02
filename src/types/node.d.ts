/// <reference types="node" />

declare namespace NodeJS {
  interface Process {
    env: ProcessEnv
  }
  interface ProcessEnv {
    [key: string]: string | undefined
  }
}

declare const process: NodeJS.Process
declare const __dirname: string
declare const __filename: string

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
  export function pathToFileURL(path: string): URL;
  export * from 'url';
}

declare module 'node:path' {
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
  export function normalize(path: string): string;
  export * from 'path';
}

declare module 'node:process' {
  export * from 'process';
} 