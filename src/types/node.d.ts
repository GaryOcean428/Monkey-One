/// <reference types="node" />
/// <reference lib="dom" />

declare namespace NodeJS {
  interface Process {
    env: ProcessEnv
  }
  interface ProcessEnv {
    [key: string]: string | undefined
    NODE_ENV: 'development' | 'production' | 'test'
    BASE_URL: string
    API_URL: string
  }
}

declare const process: NodeJS.Process
declare const __dirname: string
declare const __filename: string

declare module 'node:url' {
  export * from 'url'
}

declare module 'node:path' {
  export * from 'path'
}

declare module 'node:fs' {
  export * from 'fs'
}

declare module 'node:crypto' {
  export * from 'crypto'
}

declare module 'node:events' {
  export * from 'events'
}

declare module 'node:stream' {
  export * from 'stream'
}

declare module 'node:util' {
  export * from 'util'
}

declare module 'node:http' {
  export * from 'http'
}

declare module 'node:https' {
  export * from 'https'
}

declare module 'node:net' {
  export * from 'net'
}

declare module 'node:tls' {
  export * from 'tls'
}

declare module 'node:zlib' {
  export * from 'zlib'
}

declare module 'node:dns' {
  export * from 'dns'
}

declare module 'node:os' {
  export * from 'os'
}

declare module 'node:child_process' {
  export * from 'child_process'
}

declare module 'node:worker_threads' {
  export * from 'worker_threads'
}

declare module 'node:cluster' {
  export * from 'cluster'
}

declare module 'node:vm' {
  export * from 'vm'
}

declare module 'node:module' {
  export * from 'module'
}

declare module 'node:process' {
  export * from 'process'
}

declare module 'node:timers' {
  export * from 'timers'
}

declare module 'node:buffer' {
  export * from 'buffer'
}

declare module 'node:string_decoder' {
  export * from 'string_decoder'
}

declare module 'node:querystring' {
  export * from 'querystring'
}

declare module 'node:assert' {
  export * from 'assert'
}

declare module 'node:repl' {
  export * from 'repl'
}

declare module 'node:readline' {
  export * from 'readline'
}

declare module 'node:punycode' {
  export * from 'punycode'
}

declare module 'node:domain' {
  export * from 'domain'
}

declare module 'node:constants' {
  export * from 'constants'
}

declare module 'node:async_hooks' {
  export * from 'async_hooks'
}

declare module 'node:diagnostics_channel' {
  export * from 'diagnostics_channel'
}

declare module 'node:perf_hooks' {
  export * from 'perf_hooks'
}

declare module 'node:trace_events' {
  export * from 'trace_events'
}

declare module 'node:v8' {
  export * from 'v8'
}

declare module 'node:tty' {
  export * from 'tty'
}

declare module 'node:dgram' {
  export * from 'dgram'
}