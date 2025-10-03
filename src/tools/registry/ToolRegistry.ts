import { EventEmitter } from 'events'
import { Tool, ToolMetadata } from './Tool'

export class ToolRegistry extends EventEmitter {
  private static instance: ToolRegistry
  private tools: Map<string, Tool>
  private capabilities: Set<string>

  private constructor() {
    super()
    this.tools = new Map()
    this.capabilities = new Set()
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry()
    }
    return ToolRegistry.instance
  }

  public registerTool(tool: Tool): void {
    const metadata = tool.getMetadata()
    this.validateToolRegistration(metadata)

    this.tools.set(metadata.name, tool)
    metadata.capabilities.forEach(cap => this.capabilities.add(cap))

    this.emit('toolRegistered', metadata)
  }

  public unregisterTool(toolName: string): void {
    const tool = this.tools.get(toolName)
    if (tool) {
      this.tools.delete(toolName)
      this.emit('toolUnregistered', tool.getMetadata())
    }
  }

  public getTool(toolName: string): Tool | undefined {
    return this.tools.get(toolName)
  }

  public getAllTools(): Tool[] {
    return Array.from(this.tools.values())
  }

  public getToolsByCapability(capability: string): Tool[] {
    return this.getAllTools().filter(tool => tool.getMetadata().capabilities.includes(capability))
  }

  public getCapabilities(): string[] {
    return Array.from(this.capabilities)
  }

  public hasCapability(capability: string): boolean {
    return this.capabilities.has(capability)
  }

  private validateToolRegistration(metadata: ToolMetadata): void {
    if (this.tools.has(metadata.name)) {
      throw new Error(`Tool with name '${metadata.name}' is already registered`)
    }
  }

  public async discoverTools(directory: string): Promise<void> {
    // TODO: Implement dynamic tool discovery from directory
    this.emit('toolDiscoveryStarted', directory)

    try {
      // Scan directory for tool definitions
      // Load and validate tool modules
      // Register valid tools

      this.emit('toolDiscoveryCompleted', {
        directory,
        toolsFound: this.tools.size,
      })
    } catch (error) {
      this.emit('toolDiscoveryError', {
        directory,
        error,
      })
      throw error
    }
  }
}
