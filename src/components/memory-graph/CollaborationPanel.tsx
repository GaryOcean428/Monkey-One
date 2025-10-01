/**
 * Collaboration Panel Component
 * 
 * Shows active users, their presence, and collaboration controls
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Activity, 
  Clock,
  Eye,
  Edit,
  Trash2,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { CollaborationUser, PresenceInfo, GraphOperation } from '../../lib/memory-graph/collaboration';

interface CollaborationPanelProps {
  users: CollaborationUser[];
  presence: Map<string, PresenceInfo>;
  currentUserId: string;
  isConnected: boolean;
  recentOperations?: GraphOperation[];
  onInviteUser?: () => void;
  onManagePermissions?: (userId: string) => void;
  className?: string;
}

export function CollaborationPanel({
  users,
  presence,
  currentUserId,
  isConnected,
  recentOperations = [],
  onInviteUser,
  onManagePermissions,
  className = ''
}: CollaborationPanelProps) {
  const [showOperations, setShowOperations] = useState(false);

  const onlineUsers = users.filter(u => u.isOnline);
  const offlineUsers = users.filter(u => !u.isOnline);

  const getPresenceInfo = (userId: string): PresenceInfo | undefined => {
    return presence.get(userId);
  };

  const getActivityStatus = (user: CollaborationUser): string => {
    const presenceInfo = getPresenceInfo(user.id);
    if (!presenceInfo) return 'Away';
    
    const timeSinceActivity = Date.now() - presenceInfo.lastActivity.getTime();
    
    if (timeSinceActivity < 30000) { // 30 seconds
      if (presenceInfo.isTyping) return 'Typing...';
      if (presenceInfo.selectedNodeId) return 'Viewing node';
      return 'Active';
    } else if (timeSinceActivity < 300000) { // 5 minutes
      return 'Idle';
    } else {
      return 'Away';
    }
  };

  const getPermissionIcon = (permissions: CollaborationUser['permissions']) => {
    if (permissions.canManageUsers) return <Shield className="h-3 w-3 text-red-500" />;
    if (permissions.canDelete) return <Trash2 className="h-3 w-3 text-orange-500" />;
    if (permissions.canWrite) return <Edit className="h-3 w-3 text-blue-500" />;
    return <Eye className="h-3 w-3 text-gray-500" />;
  };

  const formatOperationType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getOperationIcon = (type: string) => {
    if (type.includes('add')) return '+';
    if (type.includes('delete')) return '−';
    if (type.includes('update')) return '✎';
    return '•';
  };

  return (
    <Card className={`w-80 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Collaboration
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
              {isConnected ? (
                <><Wifi className="h-3 w-3 mr-1" /> Online</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
              )}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-1">
            {onInviteUser && (
              <Button variant="outline" size="sm" onClick={onInviteUser}>
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowOperations(!showOperations)}
            >
              <Activity className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online ({onlineUsers.length})
            </h4>
            <div className="space-y-2">
              {onlineUsers.map(user => {
                const presenceInfo = getPresenceInfo(user.id);
                const isCurrentUser = user.id === currentUserId;
                
                return (
                  <TooltipProvider key={user.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}>
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback 
                                className="text-xs"
                                style={{ backgroundColor: user.color + '20', color: user.color }}
                              >
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div 
                              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                              style={{ backgroundColor: user.color }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {user.name}
                                {isCurrentUser && <span className="text-xs text-gray-500">(You)</span>}
                              </p>
                              {getPermissionIcon(user.permissions)}
                            </div>
                            <p className="text-xs text-gray-500">
                              {getActivityStatus(user)}
                            </p>
                          </div>
                          
                          {onManagePermissions && !isCurrentUser && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onManagePermissions(user.id)}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p><strong>{user.name}</strong></p>
                          <p>Status: {getActivityStatus(user)}</p>
                          {presenceInfo?.selectedNodeId && (
                            <p>Viewing: {presenceInfo.selectedNodeId}</p>
                          )}
                          <p>Permissions: {
                            user.permissions.canManageUsers ? 'Admin' :
                            user.permissions.canDelete ? 'Editor+' :
                            user.permissions.canWrite ? 'Editor' : 'Viewer'
                          }</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        )}

        {/* Offline Users */}
        {offlineUsers.length > 0 && (
          <>
            {onlineUsers.length > 0 && <Separator />}
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                Offline ({offlineUsers.length})
              </h4>
              <div className="space-y-2">
                {offlineUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg opacity-60">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs bg-gray-100">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {getPermissionIcon(user.permissions)}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last seen {user.lastSeen.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Recent Operations */}
        {showOperations && recentOperations.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </h4>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {recentOperations.slice(-10).reverse().map(operation => {
                    const user = users.find(u => u.id === operation.userId);
                    return (
                      <div key={operation.id} className="flex items-center gap-2 p-1 text-xs">
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: user?.color || '#gray' }}
                        >
                          {getOperationIcon(operation.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{user?.name || 'Unknown'}</span>
                          <span className="text-gray-500 ml-1">
                            {formatOperationType(operation.type)}
                          </span>
                        </div>
                        <span className="text-gray-400">
                          {new Date(operation.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Empty State */}
        {users.length === 1 && (
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">You're working alone</p>
            {onInviteUser && (
              <Button variant="outline" size="sm" className="mt-2" onClick={onInviteUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite collaborators
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}