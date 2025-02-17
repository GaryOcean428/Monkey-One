type EventMap = Record<string, unknown[]>
type EventKey<T extends EventMap> = string & keyof T
type EventHandler<T extends EventMap, K extends EventKey<T>> = (...args: T[K]) => void

export class EventEmitter<T extends EventMap> {
  private events: { [K in EventKey<T>]?: EventHandler<T, K>[] } = {}

  on<K extends EventKey<T>>(event: K, handler: EventHandler<T, K>): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event]?.push(handler)
  }

  off<K extends EventKey<T>>(event: K, handler: EventHandler<T, K>): void {
    if (!this.events[event]) return
    this.events[event] = this.events[event]?.filter(h => h !== handler) as EventHandler<T, K>[]
  }

  emit<K extends EventKey<T>>(event: K, ...args: T[K]): void {
    if (!this.events[event]) return
    this.events[event]?.forEach(handler => {
      try {
        handler(...args)
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error)
      }
    })
  }

  once<K extends EventKey<T>>(event: K, handler: EventHandler<T, K>): void {
    const wrapper = (...args: T[K]) => {
      handler(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }

  removeAllListeners<K extends EventKey<T>>(event?: K): void {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
  }
}
