declare module '../tools/CalculatorTool' {
    export class CalculatorTool {
        schema: { name: string };
    }
}

declare module '../monitoring/ToolMonitor' {
    export class ToolMonitor {
        logExecution(tool: any, args: any, result: any): void;
    }
}

declare module './ToolAgent' {
    export class ToolAgent {
        tools: Array<{ schema: { name: string } }>;
        handleToolCall(call: any): Promise<any>;
    }
}

declare module '../patterns/AgentMixture' {
    export class AgentMixture {
        constructor(config: { 
            agents: Array<unknown>;
            aggregator: (results: Array<unknown>) => unknown;
        });
    }
}

declare module '../patterns/DebateCoordinator' {
    export class DebateCoordinator {
        constructor(
            config: {
                agents: Array<unknown>;
                moderator: unknown;
                config: { maxRounds: number };
            },
            aggregator: (results: Array<unknown>) => unknown,
            options: { timeout: number }
        );
    }
}