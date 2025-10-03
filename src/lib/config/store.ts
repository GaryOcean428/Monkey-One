interface Config {
  xai: {
    apiKey: string
    model?: string
  }
  agents: {
    maxMemoryItems: number
    defaultRole: string
  }
}

class ConfigStore {
  private storage = localStorage
  private prefix = 'monkey_one_config_'
  private config: Config

  constructor() {
    this.config = this.loadConfig()
  }

  private loadConfig(): Config {
    const defaultConfig: Config = {
      xai: {
        apiKey: import.meta.env.VITE_XAI_API_KEY || '',
        model: 'gpt-4',
      },
      agents: {
        maxMemoryItems: 100,
        defaultRole: 'assistant',
      },
    }

    try {
      const storedConfig = this.storage.getItem(this.prefix + 'main')
      if (storedConfig) {
        return {
          ...defaultConfig,
          ...JSON.parse(storedConfig),
        }
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }

    return defaultConfig
  }

  get xai() {
    return this.config.xai
  }

  get agents() {
    return this.config.agents
  }

  updateConfig(newConfig: Partial<Config>) {
    this.config = {
      ...this.config,
      ...newConfig,
    }
    this.storage.setItem(this.prefix + 'main', JSON.stringify(this.config))
  }
}

export const configStore = new ConfigStore()
