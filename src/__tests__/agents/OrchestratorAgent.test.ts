import { OrchestratorAgent } from '../../lib/agents/core/OrchestratorAgent';
import { Agent, AgentStatus, AgentType, Message, MessageType } from '../../types';
import { RuntimeError } from '../../lib/errors/AgentErrors';

// Mock child agent for testing
class MockChildAgent implements Agent {
    id: string;
    type: AgentType;
    status: AgentStatus;
    capabilities: string[];

    constructor(id: string) {
        this.id = id;
        this.type = AgentType.BASE;
        this.status = AgentStatus.IDLE;
        this.capabilities = ['test'];
    }

    async initialize(): Promise<void> {}

    async handleMessage(message: Message): Promise<Message> {
        return {
            id: `response-${message.id}`,
            type: MessageType.RESPONSE,
            sender: this.id,
            recipient: message.sender,
            content: `Processed by ${this.id}`,
            timestamp: Date.now()
        };
    }
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
            expect(response.type).toBe(MessageType.ERROR);
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
