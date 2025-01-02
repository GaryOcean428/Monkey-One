import { useCallback } from 'react';
import { useThoughtStore } from '../stores/thoughtStore';
import type { ThoughtType } from '../types/thought';

export function useThoughtLogger(options: {
  agentId?: string;
  collaborationId?: string;
  taskId?: string;
  source?: string;
} = {}) {
  const { addThought } = useThoughtStore();

  const log = useCallback((
    type: ThoughtType,
    message: string,
    metadata?: Record<string, unknown>,
    additionalOptions?: {
      importance?: number;
      confidence?: number;
      tags?: string[];
      parentThoughtId?: string;
    }
  ) => {
    return addThought({
      type,
      message,
      metadata,
      ...options,
      ...additionalOptions,
    });
  }, [addThought, options]);

  // Helper methods for common thought types
  const observe = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('observation', message, metadata, opts);
  }, [log]);

  const reason = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('reasoning', message, metadata, opts);
  }, [log]);

  const plan = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('plan', message, metadata, opts);
  }, [log]);

  const decide = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('decision', message, metadata, opts);
  }, [log]);

  const critique = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('critique', message, metadata, opts);
  }, [log]);

  const reflect = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('reflection', message, metadata, opts);
  }, [log]);

  const execute = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('execution', message, metadata, opts);
  }, [log]);

  const success = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('success', message, metadata, opts);
  }, [log]);

  const error = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('error', message, metadata, opts);
  }, [log]);

  const agentState = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('agent-state', message, metadata, opts);
  }, [log]);

  const agentComm = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('agent-comm', message, metadata, opts);
  }, [log]);

  const memoryOp = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('memory-op', message, metadata, opts);
  }, [log]);

  const taskPlan = useCallback((message: string, metadata?: Record<string, unknown>, opts?: { importance?: number; confidence?: number; tags?: string[] }) => {
    return log('task-plan', message, metadata, opts);
  }, [log]);

  return {
    log,
    observe,
    reason,
    plan,
    decide,
    critique,
    reflect,
    execute,
    success,
    error,
    agentState,
    agentComm,
    memoryOp,
    taskPlan,
  };
}
