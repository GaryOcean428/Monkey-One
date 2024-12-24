import React from 'react';
import { Card } from '../ui/card';

export default function PerformancePanel() {
  return (
    <div className="h-full p-4 bg-background">
      <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Response Time</h3>
          <p className="text-2xl font-bold">0ms</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Memory Usage</h3>
          <p className="text-2xl font-bold">0MB</p>
        </Card>
      </div>
    </div>
  );
}