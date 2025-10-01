/**
 * Performance Panel Component
 * 
 * Displays comprehensive performance metrics, health status,
 * and monitoring data for the memory graph system.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  HardDrive,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  RefreshCw,
  Bell,
  X,
  Eye,
  BarChart3,
  Gauge
} from 'lucide-react';

import { PerformanceMonitor } from '../../lib/memory-graph/performance-monitor';
import type { 
  PerformanceMetrics, 
  HealthCheck, 
  Alert as AlertType,
  OperationStats
} from '../../lib/memory-graph/performance-monitor';

interface PerformancePanelProps {
  monitor: PerformanceMonitor;
  className?: string;
}

const HEALTH_STATUS_COLORS = {
  healthy: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
  unknown: 'text-gray-600 bg-gray-50 border-gray-200'
};

const ALERT_SEVERITY_COLORS = {
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200'
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export function PerformancePanel({ monitor, className = '' }: PerformancePanelProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState(monitor.getHealthStatus());
  const [alerts, setAlerts] = useState(monitor.getAlerts());
  const [analysis, setAnalysis] = useState(monitor.getPerformanceAnalysis());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const refreshData = () => {
    setMetrics(monitor.getMetrics());
    setHealthStatus(monitor.getHealthStatus());
    setAlerts(monitor.getAlerts());
    setAnalysis(monitor.getPerformanceAnalysis());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [monitor]);

  // Simulate historical data for charts
  useEffect(() => {
    if (metrics) {
      const newDataPoint = {
        timestamp: new Date().toLocaleTimeString(),
        queryTime: metrics.operations.queries.avgTime,
        memoryUsage: metrics.system.memoryUsage.percentage,
        errorRate: metrics.errors.rate,
        throughput: metrics.operations.queries.throughput
      };

      setHistoricalData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-20); // Keep last 20 data points
      });
    }
  }, [metrics]);

  const handleStartMonitoring = () => {
    monitor.startMonitoring(5000);
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    monitor.stopMonitoring();
    setIsMonitoring(false);
  };

  const handleResolveAlert = (alertId: string) => {
    monitor.resolveAlert(alertId);
    refreshData();
  };

  const formatUptime = (uptime: number): string => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getHealthIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'degrading':
      case 'increasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading performance metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gauge className="h-6 w-6" />
            Performance Monitor
            <Badge className={HEALTH_STATUS_COLORS[healthStatus.overall]}>
              {healthStatus.overall.toUpperCase()}
            </Badge>
          </h2>
          <p className="text-sm text-gray-600">
            Uptime: {formatUptime(metrics.system.uptime)} • Health Score: {healthStatus.score.toFixed(0)}%
          </p>
        </div>

        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {alerts.length} alerts
            </Badge>
          )}
          
          <Button
            onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
          >
            {isMonitoring ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>

          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{metrics.system.memoryUsage.percentage.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">
                  {formatBytes(metrics.system.memoryUsage.used)} / {formatBytes(metrics.system.memoryUsage.total)}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={metrics.system.memoryUsage.percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Query Time</p>
                <p className="text-2xl font-bold">{metrics.operations.queries.avgTime.toFixed(0)}ms</p>
                <p className="text-xs text-gray-500">
                  {metrics.operations.queries.count} queries
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{metrics.errors.rate}</p>
                <p className="text-xs text-gray-500">
                  {metrics.errors.total} total errors
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">{metrics.operations.queries.throughput.toFixed(1)}</p>
                <p className="text-xs text-gray-500">queries/sec</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Active Alerts
              <Badge variant="destructive">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map(alert => (
                <Alert key={alert.id} className={ALERT_SEVERITY_COLORS[alert.severity]}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{alert.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-sm">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="queryTime" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Query Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="memoryUsage" 
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.3}
                      name="Memory Usage (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Graph Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Nodes:</span>
                    <span className="font-bold">{metrics.graph.nodeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Edges:</span>
                    <span className="font-bold">{metrics.graph.edgeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Degree:</span>
                    <span className="font-bold">{metrics.graph.avgDegree.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Density:</span>
                    <span className="font-bold">{(metrics.graph.density * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <span className="font-bold text-green-600">{metrics.cache.hitRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Miss Rate:</span>
                    <span className="font-bold text-red-600">{metrics.cache.missRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Size:</span>
                    <span className="font-bold">{metrics.cache.size.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evictions:</span>
                    <span className="font-bold">{metrics.cache.evictions}</span>
                  </div>
                </div>
                <Progress value={metrics.cache.hitRate} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Errors:</span>
                    <span className="font-bold">{metrics.errors.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recent (1h):</span>
                    <span className="font-bold">{metrics.errors.rate}</span>
                  </div>
                  {Object.entries(metrics.errors.byType).slice(0, 3).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          {/* Operation Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(metrics.operations).map(([operation, stats]) => (
              <Card key={operation}>
                <CardHeader>
                  <CardTitle className="capitalize">{operation} Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Count:</span>
                        <span className="font-bold">{stats.count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Time:</span>
                        <span className="font-bold">{stats.avgTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Time:</span>
                        <span className="font-bold">{stats.minTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Time:</span>
                        <span className="font-bold">{stats.maxTime.toFixed(0)}ms</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-bold text-green-600">{stats.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate:</span>
                        <span className="font-bold text-red-600">{stats.errorRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Throughput:</span>
                        <span className="font-bold">{stats.throughput.toFixed(1)}/s</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={stats.successRate} className="mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {/* Health Checks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {healthStatus.checks.map(check => (
              <Card key={check.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(check.status)}
                      <span className="font-medium">{check.name}</span>
                    </div>
                    <Badge className={HEALTH_STATUS_COLORS[check.status]}>
                      {check.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{check.message}</p>
                  <p className="text-xs text-gray-500">
                    Last checked: {check.timestamp.toLocaleString()}
                  </p>
                  {check.responseTime && (
                    <p className="text-xs text-gray-500">
                      Response time: {check.responseTime}ms
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.bottlenecks.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{bottleneck}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p>No performance bottlenecks detected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.recommendations.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                        <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p>System is performing optimally</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getTrendIcon(analysis.trends.performance)}
                    <span className="font-medium">Performance</span>
                  </div>
                  <p className="text-sm capitalize">{analysis.trends.performance}</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getTrendIcon(analysis.trends.errors)}
                    <span className="font-medium">Errors</span>
                  </div>
                  <p className="text-sm capitalize">{analysis.trends.errors}</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">Capacity</span>
                  </div>
                  <p className="text-sm capitalize">{analysis.trends.capacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}