import React from 'react';
import {
  Wrench,
  Settings,
  Moon,
  Sun,
  Menu,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Minus,
  AlertTriangle,
  Check,
  Info,
  LogOut,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  Bot,
  Github,
  Database,
  FileText,
  Zap,
  Brain,
  GitBranch,
  Command,
  ChevronDown,
  MoreVertical,
  Trash,
  Edit,
  Copy,
  Save,
  Download,
  Upload,
  RefreshCw,
  Send,
  PlayCircle,
  PauseCircle,
  Square,
  Users,
  Box,
  Activity,
  LayoutDashboard
} from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const Icons = {
  wrench: Wrench,
  settings: Settings,
  moon: Moon,
  sun: Sun,
  menu: Menu,
  search: Search,
  close: X,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronsLeft: ChevronsLeft,
  chevronsRight: ChevronsRight,
  plus: Plus,
  minus: Minus,
  warning: AlertTriangle,
  check: Check,
  info: Info,
  logout: LogOut,
  user: User,
  lock: Lock,
  mail: Mail,
  eye: Eye,
  eyeOff: EyeOff,
  spinner: Loader2,
  message: MessageSquare,
  bot: Bot,
  github: Github,
  database: Database,
  file: FileText,
  zap: Zap,
  brain: Brain,
  workflow: GitBranch,
  command: Command,
  chevronDown: ChevronDown,
  moreVertical: MoreVertical,
  trash: Trash,
  edit: Edit,
  copy: Copy,
  save: Save,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  send: Send,
  play: PlayCircle,
  pause: PauseCircle,
  stop: Square,
  chat: MessageSquare,
  agent: Users,
  memory: Database,
  document: FileText,
  dashboard: LayoutDashboard,
  tool: Wrench,
  vectorStore: Box,
  performance: Activity
};

export const IconChat: React.FC<IconProps> = (props) => <MessageSquare {...props} />;
export const IconAgent: React.FC<IconProps> = (props) => <Users {...props} />;
export const IconWorkflow: React.FC<IconProps> = (props) => <GitBranch {...props} />;
export const IconMemory: React.FC<IconProps> = (props) => <Database {...props} />;
export const IconDocument: React.FC<IconProps> = (props) => <FileText {...props} />;
export const IconDashboard: React.FC<IconProps> = (props) => <LayoutDashboard {...props} />;
export const IconTool: React.FC<IconProps> = (props) => <Wrench {...props} />;
export const IconSearch: React.FC<IconProps> = (props) => <Search {...props} />;
export const IconVectorStore: React.FC<IconProps> = (props) => <Box {...props} />;
export const IconGithub: React.FC<IconProps> = (props) => <Github {...props} />;
export const IconPerformance: React.FC<IconProps> = (props) => <Activity {...props} />;
export const IconSettings: React.FC<IconProps> = (props) => <Settings {...props} />;
export const IconSun: React.FC<IconProps> = (props) => <Sun {...props} />;
export const IconMoon: React.FC<IconProps> = (props) => <Moon {...props} />;
