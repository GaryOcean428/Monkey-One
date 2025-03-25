import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import {
  LayoutDashboard,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Users,
  GitBranch,
  Wrench,
  FileText,
  Github,
  BrainCircuit,
  StickyNote,
} from 'lucide-react'
import { create } from 'zustand'

interface SidebarStore {
  isOpen: boolean
  toggle: () => void
}

export const useSidebarStore = create<SidebarStore>(set => ({
  isOpen: true,
  toggle: () => set(state => ({ isOpen: !state.isOpen })),
}))

const sidebarItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/workflow', label: 'Workflow', icon: GitBranch },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/github', label: 'GitHub', icon: Github },
  { href: '/ai', label: 'AI Features', icon: BrainCircuit },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/analytics', label: 'Analytics', icon: BarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <>
      <motion.aside
        className={cn(
          'fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        animate={{
          width: isOpen ? 256 : 0,
          transition: { duration: 0.3, ease: 'easeInOut' },
        }}
      >
        <div className="flex h-full flex-col p-4">
          <nav className="space-y-1">
            {sidebarItems.map(item => (
              <Link key={item.href} to={item.href} className="block">
                <Button
                  variant="secondary"
                  className={cn(
                    'w-full justify-start transition-all duration-200',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span
                    className={cn(
                      'transition-opacity duration-200',
                      isOpen ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    {item.label}
                  </span>
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </motion.aside>

      <Button
        variant="secondary"
        size="sm"
        className={cn(
          'fixed left-64 top-[3.5rem] z-40 h-8 w-8 rounded-full p-0',
          'transition-all duration-300 ease-in-out',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isOpen ? 'translate-x-0' : '-translate-x-64'
        )}
        onClick={toggle}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
        ) : (
          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
        )}
      </Button>
    </>
  )
}
