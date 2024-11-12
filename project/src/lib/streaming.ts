export class StreamProcessor {
  private decoder = new TextDecoder();
  private buffer = '';

  constructor(private onProgress: (content: string) => void) {}

  async processStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        this.buffer += this.decoder.decode(value, { stream: true });
        this.processBuffer();
      }
    } finally {
      reader.releaseLock();
    }
  }

  private processBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.message?.content;
          if (content) this.onProgress(content);
        } catch (e) {
          console.warn('Failed to parse streaming response:', e);
        }
      }
    }
  }
}