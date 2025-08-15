import { OrchestratorAgent } from '../../lib/agents/core/OrchestratorAgent';
import { Agent, AgentStatus, AgentType, AgentCapabilityType, Message, MessageType } from '../../types';
import { RuntimeError } from '../../lib/errors/AgentErrors';

// Mock child agent for testing
class MockChildAgent implements Agent {
    id: string;
    name: string;
    type: AgentType;
    status: AgentStatus;
    capabilities: AgentCapabilityType[];
    metrics: { lastExecutionTime: number; totalRequests: number; successfulRequests: number; failedRequests: number; averageResponseTime: number };

    constructor(id: string) {
        this.id = id;
        this.name = `MockAgent-${id}`;
        this.type = AgentType.BASE;
        this.status = AgentStatus.IDLE;
        this.capabilities = [];
        this.metrics = {
            lastExecutionTime: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0
        };
    }

    getId(): string { return this.id; }
    getName(): string { return this.name; }
    getType(): AgentType { return this.type; }
    getStatus(): AgentStatus { return this.status; }
    getCapabilities(): AgentCapabilityType[] { return this.capabilities; }
    hasCapability(capability: AgentCapabilityType): boolean { return this.capabilities.includes(capability); }
    addCapability(capability: AgentCapabilityType): void { this.capabilities.push(capability); }
    removeCapability(capability: AgentCapabilityType): void { 
        this.capabilities = this.capabilities.filter(c => c !== capability); 
    }
    getMetrics() { return this.metrics; }
    
    async handleMessage(message: Message): Promise<{ success: boolean }> {
        return { success: true };
    }
    
    async handleRequest(request: unknown): Promise<unknown> {
        return request;
    }
    
    async handleToolUse(tool: unknown): Promise<{ status: 'success' | 'error'; data: unknown }> {
        return { status: 'success', data: tool };
    }

    async processMessage(message: Message): Promise<Message> {
        return {
            id: `response-${message.id}`,
            type: MessageType.RESPONSE,
            content: `Processed: ${message.content}`,
            timestamp: Date.now(),
            metadata: { originalMessage: message.id }
        };
    }

    setStatus(status: AgentStatus): void {
        this.status = status;
    }

    updateMetrics(success: boolean, executionTime: number): void {
        this.metrics.lastExecutionTime = executionTime;
        this.metrics.totalRequests++;
        if (success) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }
    }

    async initialize(): Promise<void> {}
    async shutdown(): Promise<void> {}
}

describe('OrchestratorAgent', () => {
    let orchestrator: OrchestratorAgent;
    let mockChild1: MockChildAgent;
    let mockChild2: MockChildAgent;

    beforeEach(() => {
        orchestrator = new OrchestratorAgent('test-orchestrator', 'Test Orchestrator');
        mockChild1 = new MockChildAgent('child-1');
        mockChild2 = new MockChildAgent('child-2');
    });

    describe('agent management', () => {
        it('should register child agents', async () => {
            await orchestrator.registerAgent(mockChild1);
            expect(orchestrator.getAgents()).toContain(mockChild1);
        });

        it('should unregister child agents', async () => {
            await orchestrator.registerAgent(mockChild1);
            await orchestrator.unregisterAgent(mockChild1.id);
            expect(orchestrator.getAgents()).not.toContain(mockChild1);
        });

        it('should throw error when registering duplicate agent', async () => {
            await orchestrator.registerAgent(mockChild1);
            await expect(orchestrator.registerAgent(mockChild1))
                .rejects.toThrow(RuntimeError);
        });
    });

    describe('message orchestration', () => {
        beforeEach(async () => {
            await orchestrator.registerAgent(mockChild1);
            await orchestrator.registerAgent(mockChild2);
        });

        it('should route message to specific agent', async () => {
            const message: Message = {
                id: 'test-1',
                type: MessageType.COMMAND,
                sender: 'test',
                recipient: mockChild1.id,
                content: 'test message',
                timestamp: Date.now()
            };

            const response = await orchestrator.processMessage(message);
            expect(response.content).toBe('Processed by child-1');
        });

        it('should broadcast message to all agents', async () => {
            const message: Message = {
                id: 'test-2',
                type: MessageType.BROADCAST,
                sender: 'test',
                content: 'broadcast message',
                timestamp: Date.now()
            };

            const responses = await orchestrator.broadcast(message);
            expect(responses).toHaveLength(2);
        });

        it('should handle agent errors gracefully', async () => {
            const failingAgent = new MockChildAgent('failing-agent');
            jest.spyOn(failingAgent, 'handleMessage')
                .mockRejectedValue(new Error('Test error'));

            await orchestrator.registerAgent(failingAgent);

            const message: Message = {
                id: 'test-3',
                type: MessageType.COMMAND,
                sender: 'test',
                recipient: failingAgent.id,
                content: 'test message',
                timestamp: Date.now()
            };

            const response = await orchestrator.processMessage(message);
            expect(response.type).toBe('error');
        });
    });

    describe('agent monitoring', () => {
        it('should track agent status changes', async () => {
            await orchestrator.registerAgent(mockChild1);
            mockChild1.status = AgentStatus.BUSY;
            
            const status = orchestrator.getAgentStatus(mockChild1.id);
            expect(status).toBe(AgentStatus.BUSY);
        });

        it('should get active agents', async () => {
            await orchestrator.registerAgent(mockChild1);
            await orchestrator.registerAgent(mockChild2);
            mockChild1.status = AgentStatus.BUSY;

            const activeAgents = orchestrator.getActiveAgents();
            expect(activeAgents).toHaveLength(1);
            expect(activeAgents[0]).toBe(mockChild1);
        });
    });
});
