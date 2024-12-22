import { cachedQuery } from '../cache/redis';

// User queries
export const userQueries = {
  async getById(id: string) {
    return cachedQuery(
      `user:${id}`,
      'SELECT * FROM users WHERE id = $1',
      [id],
      3600 // 1 hour cache
    );
  },

  async getByEmail(email: string) {
    return cachedQuery(
      `user:email:${email}`,
      'SELECT * FROM users WHERE email = $1',
      [email],
      3600
    );
  },

  async getRecentActivity(userId: string) {
    return cachedQuery(
      `user:${userId}:activity`,
      `SELECT * FROM user_activity 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId],
      300 // 5 minutes cache
    );
  }
};

// Memory queries
export const memoryQueries = {
  async getRecent(limit: number = 10) {
    return cachedQuery(
      `memories:recent:${limit}`,
      `SELECT * FROM memories 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit],
      60 // 1 minute cache
    );
  },

  async getByType(type: string) {
    return cachedQuery(
      `memories:type:${type}`,
      'SELECT * FROM memories WHERE type = $1',
      [type],
      300
    );
  },

  async searchByTags(tags: string[]) {
    return cachedQuery(
      `memories:tags:${tags.join(',')}`,
      'SELECT * FROM memories WHERE tags @> $1',
      [tags],
      300
    );
  }
};

// Workflow queries
export const workflowQueries = {
  async getActive() {
    return cachedQuery(
      'workflows:active',
      "SELECT * FROM workflows WHERE status = 'active'",
      [],
      60
    );
  },

  async getByUser(userId: string) {
    return cachedQuery(
      `workflows:user:${userId}`,
      'SELECT * FROM workflows WHERE user_id = $1',
      [userId],
      300
    );
  },

  async getMetrics(workflowId: string) {
    return cachedQuery(
      `workflows:metrics:${workflowId}`,
      `SELECT 
         COUNT(*) as total_steps,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_steps,
         AVG(CASE WHEN duration IS NOT NULL THEN duration ELSE 0 END) as avg_duration
       FROM workflow_steps 
       WHERE workflow_id = $1`,
      [workflowId],
      300
    );
  }
};

// Agent queries
export const agentQueries = {
  async getActive() {
    return cachedQuery(
      'agents:active',
      "SELECT * FROM agents WHERE status = 'active'",
      [],
      60
    );
  },

  async getByCapability(capability: string) {
    return cachedQuery(
      `agents:capability:${capability}`,
      'SELECT * FROM agents WHERE capabilities @> $1',
      [[capability]],
      300
    );
  },

  async getPerformanceMetrics(agentId: string) {
    return cachedQuery(
      `agents:metrics:${agentId}`,
      `SELECT 
         success_rate,
         avg_response_time,
         total_tasks_completed
       FROM agent_metrics 
       WHERE agent_id = $1`,
      [agentId],
      300
    );
  }
};