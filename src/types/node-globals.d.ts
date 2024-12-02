/// <reference types="node" />

declare module 'node:url' {
  import * as url from 'url';
  export = url;
}

declare module 'node:path' {
  import * as path from 'path';
  export = path;
}

declare module 'node:process' {
  import * as process from 'process';
  export = process;
}

declare module 'url' {
  export interface URL {
    href: string;
    origin: string;
    protocol: string;
    username: string;
    password: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
  }

  export function fileURLToPath(url: string | URL): string;
  export function pathToFileURL(path: string): URL;
  export function format(URL: URL, options?: { auth: boolean; fragment: boolean; search: boolean; unicode: boolean }): string;
}

declare module 'path' {
  export function resolve(...pathSegments: string[]): string;
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
  export function normalize(path: string): string;
  export function isAbsolute(path: string): boolean;
  export function relative(from: string, to: string): string;
  export function parse(pathString: string): {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  };
} 