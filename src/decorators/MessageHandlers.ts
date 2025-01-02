import type { Message } from '../lib/types/core';

export type MessageHandler = (message: Message) => Promise<void>;
