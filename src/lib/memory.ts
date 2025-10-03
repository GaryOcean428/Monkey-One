import { config } from './config'

interface MemoryItem {
  type: string
  content: string
  tags: string[]
  timestamp?: number
}

class MemoryManager {
  private items: MemoryItem[] = []

  async add(item: MemoryItem): Promise<void> {
    this.items.push({
      ...item,
      timestamp: Date.now(),
    })
    this.cleanup()
  }

  private cleanup(): void {
    const maxSize = config.memory.maxSize
    if (this.items.length > maxSize) {
      this.items = this.items.slice(-maxSize)
    }

    const cutoff = Date.now() - config.memory.retentionDays * 24 * 60 * 60 * 1000
    this.items = this.items.filter(item => (item.timestamp || 0) > cutoff)
  }

  async search(query: string): Promise<MemoryItem[]> {
    return this.items
      .filter(item => item.content.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }

  getRecent(count: number): MemoryItem[] {
    return [...this.items].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, count)
  }
}

export const memoryManager = new MemoryManager()
