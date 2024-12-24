export * from './types';
export * from './client';

// Create a default instance
import { ToolhouseClient } from './client';
export const toolhouse = new ToolhouseClient();
