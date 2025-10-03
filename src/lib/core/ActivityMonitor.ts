import { EventEmitter } from 'events'
import { logger } from '../../utils/logger'
import { agentProcessingTime } from '../../utils/metrics'

export interface ActivityState {
  isLearning: boolean
  isProcessing: boolean
  lastActivity: number
  activeRegions: string[]
}

export class ActivityMonitor extends EventEmitter {
  private state: ActivityState
  private readonly UPDATE_INTERVAL = 1000 // 1 second
  private updateTimer: NodeJS.Timer

  constructor() {
    super()
    this.state = {
      isLearning: false,
      isProcessing: false,
      lastActivity: Date.now(),
      activeRegions: [],
    }
    this.startMonitoring()
  }

  private startMonitoring(): void {
    this.updateTimer = setInterval(() => {
      this.checkActivity()
    }, this.UPDATE_INTERVAL)
  }

  private checkActivity(): void {
    const currentTime = Date.now()
    const idleThreshold = 5000 // 5 seconds

    if (currentTime - this.state.lastActivity > idleThreshold) {
      this.emit('idle')
      logger.debug('System idle detected')
    }

    // Record metrics
    agentProcessingTime.observe(
      {
        agent_type: 'brain',
        operation: this.state.isProcessing ? 'processing' : 'idle',
      },
      (currentTime - this.state.lastActivity) / 1000
    )
  }

  public recordActivity(type: 'learning' | 'processing'): void {
    this.state.lastActivity = Date.now()
    this.state[type === 'learning' ? 'isLearning' : 'isProcessing'] = true
    this.emit('activity', type)
    logger.debug(`Activity recorded: ${type}`)
  }

  public getState(): ActivityState {
    return { ...this.state }
  }

  public cleanup(): void {
    clearInterval(this.updateTimer)
    this.removeAllListeners()
  }
}
