import React from 'react'
import { cn } from '../../lib/utils'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Brain,
  Wrench,
  History,
  Settings,
  ArrowRight,
  Activity,
  Database,
  Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface QuickActionProps {
  icon: React.ElementType
  title: string
  description: string
  path: string
}

const QuickAction: React.FC<QuickActionProps> = ({ icon: Icon, title, description, path }) => {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer p-6 transition-shadow hover:shadow-lg"
      onClick={() => navigate(path)}
    >
      <div className="flex items-start space-x-4">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

interface MetricCardProps {
  icon: React.ElementType
  title: string
  value: string
  trend?: string
  trendUp?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, trend, trendUp }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
        {trend && (
          <p className={cn('mt-2 text-sm', trendUp ? 'text-green-600' : 'text-red-600')}>{trend}</p>
        )}
      </div>
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </Card>
)

export const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's an overview of your system.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Brain}
          title="Active Memories"
          value="1,234"
          trend="+12% from last week"
          trendUp={true}
        />
        <MetricCard icon={Activity} title="System Load" value="23%" trend="Normal" trendUp={true} />
        <MetricCard
          icon={Database}
          title="Storage Used"
          value="45.2 GB"
          trend="2.1 GB free"
          trendUp={false}
        />
        <MetricCard
          icon={Search}
          title="Searches Today"
          value="89"
          trend="+5% from yesterday"
          trendUp={true}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <QuickAction
            icon={Brain}
            title="Memory Management"
            description="View and manage your system's memory storage"
            path="/memory"
          />
          <QuickAction
            icon={Wrench}
            title="Tools & Capabilities"
            description="Configure and monitor available tools"
            path="/tools"
          />
          <QuickAction
            icon={History}
            title="Activity History"
            description="View past operations and system logs"
            path="/history"
          />
          <QuickAction
            icon={Settings}
            title="System Settings"
            description="Configure system preferences and options"
            path="/settings"
          />
        </div>
      </div>
    </div>
  )
}
