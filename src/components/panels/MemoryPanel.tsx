import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Trash2, RefreshCw, Database } from 'lucide-react'

interface MemoryItem {
  id: string
  type: 'conversation' | 'document' | 'task'
  content: string
  timestamp: string
  size: number
}

export const MemoryPanel: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('overview')
  const [memoryItems] = React.useState<MemoryItem[]>([
    {
      id: '1',
      type: 'conversation',
      content: 'Chat history with user about project requirements',
      timestamp: '2024-12-29T02:30:00Z',
      size: 1024,
    },
    {
      id: '2',
      type: 'document',
      content: 'Technical documentation for API endpoints',
      timestamp: '2024-12-29T02:15:00Z',
      size: 2048,
    },
  ])

  const memoryStats = {
    totalSize: '256MB',
    used: '45MB',
    available: '211MB',
    usagePercent: 18,
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Memory Management</h1>
        <div className="space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Backup
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Memory Items</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Memory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{memoryStats.totalSize}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Used Memory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{memoryStats.used}</div>
                <Progress value={memoryStats.usagePercent} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Available Memory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{memoryStats.available}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-4 p-4">
                  {memoryItems.map(item => (
                    <Card key={item.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge>{item.type}</Badge>
                            <span className="text-muted-foreground text-sm">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{item.content}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="text-muted-foreground text-sm">
                          Size: {(item.size / 1024).toFixed(2)} KB
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <h3 className="font-medium">Memory Settings</h3>
                <p className="text-muted-foreground text-sm">
                  Configure memory management settings and cleanup policies
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto Cleanup</h4>
                    <p className="text-muted-foreground text-sm">
                      Automatically remove old memory items
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Memory Limits</h4>
                    <p className="text-muted-foreground text-sm">Set maximum memory usage limits</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
