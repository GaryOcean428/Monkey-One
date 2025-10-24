import * as React from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Shield, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { fetchWithSkewProtection } from '../../lib/skew-protection'

interface OIDCStatusData {
  status: 'valid_token' | 'no_token' | 'error'
  message: string
  hasToken: boolean
  issuer?: string
  expiresAt?: string
  environment?: string
  timeUntilExpiry?: number
  error?: string
}

export function OIDCStatus() {
  const [status, setStatus] = React.useState<OIDCStatusData | null>(null)
  const [loading, setLoading] = React.useState(false)

  const fetchOIDCStatus = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetchWithSkewProtection('/api/auth/oidc-status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        status: 'error',
        message: 'Failed to fetch OIDC status',
        hasToken: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchOIDCStatus()
  }, [fetchOIDCStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid_token':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'no_token':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid_token':
        return <Shield className="h-4 w-4 text-green-600" />
      case 'no_token':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimeUntilExpiry = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">OIDC Authentication</h3>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOIDCStatus} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {status ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.status)}
            <Badge className={getStatusColor(status.status)}>
              {status.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <p className="text-sm text-gray-600">{status.message || 'No status message'}</p>

          {status.environment && (
            <div className="text-sm">
              <span className="font-medium">Environment:</span> {status.environment || 'N/A'}
            </div>
          )}

          {status.issuer && (
            <div className="text-sm">
              <span className="font-medium">Issuer:</span> {status.issuer || 'N/A'}
            </div>
          )}

          {status.expiresAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Expires:</span>
              <span>{new Date(status.expiresAt).toLocaleString()}</span>
            </div>
          )}

          {status.timeUntilExpiry && status.timeUntilExpiry > 0 && (
            <div className="text-sm">
              <span className="font-medium">Time until expiry:</span>{' '}
              {formatTimeUntilExpiry(status.timeUntilExpiry)}
            </div>
          )}

          {status.error && (
            <div className="rounded bg-red-50 p-2 text-sm text-red-600">
              <span className="font-medium">Error:</span> {status.error || 'Unknown error'}
            </div>
          )}

          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <h4 className="mb-2 font-medium text-blue-900">About OIDC</h4>
            <p className="text-sm text-blue-700">
              OpenID Connect (OIDC) federation provides secure backend access with short-lived
              tokens instead of storing long-lived credentials. This improves security by reducing
              the risk of credential leaks.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading OIDC status...</span>
        </div>
      )}
    </Card>
  )
}
