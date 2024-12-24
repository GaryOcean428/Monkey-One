import React from 'react';
import { Card } from '../ui/card';

export default function DashboardPanel() {
  return (
    <div className="h-full p-4 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          <p className="text-muted-foreground">All systems operational</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Active Agents</h3>
          <p className="text-muted-foreground">No active agents</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <p className="text-muted-foreground">No recent activity</p>
        </Card>
      </div>
    </div>
  );
}