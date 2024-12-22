import type { BaseRuntime as BaseRuntimeType } from '@/types/core';

export abstract class BaseRuntime implements BaseRuntimeType {
  protected isActive = false;

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  isRunning(): boolean {
    return this.isActive;
  }
}