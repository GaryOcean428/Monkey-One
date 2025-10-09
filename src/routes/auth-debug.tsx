/**
 * Authentication Debug Page
 * 
 * Comprehensive debugging interface for the authentication flow
 */

import React, { useState, useEffect } from 'react'
import { getStoredGoogleUser } from '../lib/auth/google-auth'
import { getValidOIDCToken } from '../lib/auth/oidc'
import { supabase } from '../lib/supabase/client'

interface DebugInfo {
  category: string
  items: Array<{
    label: string
    value: string | boolean | null
    status: 'success' | 'warning' | 'error' | 'info'
  }>
}

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    loadDebugInfo()
  }, [])

  const loadDebugInfo = async () => {
    setLoading(true)
    const info: DebugInfo[] = []

    // Environment Variables
    info.push({
      category: 'Environment Variables',
      items: [
        {
          label: 'VITE_GOOGLE_CLIENT_ID',
          value: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
          status: import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'success' : 'error',
        },
        {
          label: 'VITE_SUPABASE_URL',
          value: !!import.meta.env.VITE_SUPABASE_URL,
          status: import.meta.env.VITE_SUPABASE_URL ? 'success' : 'error',
        },
        {
          label: 'VITE_SUPABASE_ANON_KEY',
          value: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          status: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'success' : 'error',
        },
        {
          label: 'VITE_PUBLIC_URL',
          value: import.meta.env.VITE_PUBLIC_URL || window.location.origin,
          status: 'info',
        },
        {
          label: 'VITE_AUTH_ENABLED',
          value: import.meta.env.VITE_AUTH_ENABLED === 'true',
          status: import.meta.env.VITE_AUTH_ENABLED === 'true' ? 'success' : 'warning',
        },
      ],
    })

    // Google OAuth Status
    const googleUser = getStoredGoogleUser()
    info.push({
      category: 'Google OAuth',
      items: [
        {
          label: 'User Authenticated',
          value: !!googleUser,
          status: googleUser ? 'success' : 'warning',
        },
        {
          label: 'User Email',
          value: googleUser?.email || 'Not signed in',
          status: googleUser ? 'info' : 'warning',
        },
        {
          label: 'User Name',
          value: googleUser?.name || 'N/A',
          status: googleUser ? 'info' : 'warning',
        },
        {
          label: 'Email Verified',
          value: googleUser?.verified_email ?? false,
          status: googleUser?.verified_email ? 'success' : 'warning',
        },
      ],
    })

    // Supabase Status
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      info.push({
        category: 'Supabase',
        items: [
          {
            label: 'Connection',
            value: !sessionError,
            status: !sessionError ? 'success' : 'error',
          },
          {
            label: 'Session Active',
            value: !!sessionData?.session,
            status: sessionData?.session ? 'success' : 'warning',
          },
          {
            label: 'Session User',
            value: sessionData?.session?.user?.email || 'No session',
            status: sessionData?.session ? 'info' : 'warning',
          },
        ],
      })

      // Try to query profiles table
      if (googleUser) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', googleUser.email)
          .single()

        info.push({
          category: 'Supabase Profile',
          items: [
            {
              label: 'Profile Synced',
              value: !!profile,
              status: profile ? 'success' : 'warning',
            },
            {
              label: 'Profile Email',
              value: profile?.email || 'Not synced',
              status: profile ? 'info' : 'warning',
            },
            {
              label: 'Error',
              value: profileError?.message || 'None',
              status: profileError ? 'error' : 'success',
            },
          ],
        })
      }
    } catch (error) {
      info.push({
        category: 'Supabase',
        items: [
          {
            label: 'Error',
            value: String(error),
            status: 'error',
          },
        ],
      })
    }

    // OIDC Status
    const oidcToken = getValidOIDCToken()
    info.push({
      category: 'Vercel OIDC',
      items: [
        {
          label: 'Token Available',
          value: !!oidcToken,
          status: oidcToken ? 'success' : 'warning',
        },
        {
          label: 'Token Issuer',
          value: oidcToken?.issuer || 'N/A',
          status: oidcToken ? 'info' : 'warning',
        },
        {
          label: 'Token Expires',
          value: oidcToken ? new Date(oidcToken.expiresAt).toISOString() : 'N/A',
          status: oidcToken ? 'info' : 'warning',
        },
      ],
    })

    // Runtime Environment
    info.push({
      category: 'Runtime Environment',
      items: [
        {
          label: 'Current URL',
          value: window.location.href,
          status: 'info',
        },
        {
          label: 'Origin',
          value: window.location.origin,
          status: 'info',
        },
        {
          label: 'User Agent',
          value: (typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent.substring(0, 50) + '...' : 'N/A'),
          status: 'info',
        },
        {
          label: 'Is Production',
          value: import.meta.env.PROD,
          status: 'info',
        },
      ],
    })

    setDebugInfo(info)
    setLoading(false)
  }

  const runTest = async (testName: string) => {
    setTestResults(prev => [...prev, `Running ${testName}...`])

    switch (testName) {
      case 'google-auth':
        try {
          const user = getStoredGoogleUser()
          if (user) {
            setTestResults(prev => [
              ...prev,
              `✅ Google Auth: User ${user.email} is authenticated`,
            ])
          } else {
            setTestResults(prev => [
              ...prev,
              `⚠️ Google Auth: No user authenticated. Click "Sign in with Google"`,
            ])
          }
        } catch (error) {
          setTestResults(prev => [...prev, `❌ Google Auth Error: ${error}`])
        }
        break

      case 'supabase-connection':
        try {
          const { error } = await supabase.from('profiles').select('count').limit(1)
          if (error) {
            setTestResults(prev => [
              ...prev,
              `❌ Supabase Connection Error: ${error.message}`,
            ])
          } else {
            setTestResults(prev => [
              ...prev,
              `✅ Supabase Connection: Successfully connected`,
            ])
          }
        } catch (error) {
          setTestResults(prev => [...prev, `❌ Supabase Connection Error: ${error}`])
        }
        break

      case 'profile-sync':
        try {
          const googleUser = getStoredGoogleUser()
          if (!googleUser) {
            setTestResults(prev => [
              ...prev,
              `⚠️ Profile Sync: No Google user to sync`,
            ])
            break
          }

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', googleUser.email)
            .single()

          if (error) {
            if (error.code === 'PGRST116') {
              setTestResults(prev => [
                ...prev,
                `⚠️ Profile Sync: Profile not found. Attempting to create...`,
              ])

              // Try to create profile
              const { error: insertError } = await supabase.from('profiles').insert({
                user_id: googleUser.id,
                email: googleUser.email,
                username: googleUser.email.split('@')[0],
                name: googleUser.name,
                avatar_url: googleUser.picture,
              })

              if (insertError) {
                setTestResults(prev => [
                  ...prev,
                  `❌ Profile Creation Error: ${insertError.message}`,
                ])
              } else {
                setTestResults(prev => [
                  ...prev,
                  `✅ Profile Sync: Profile created successfully`,
                ])
              }
            } else {
              setTestResults(prev => [
                ...prev,
                `❌ Profile Sync Error: ${error.message}`,
              ])
            }
          } else {
            setTestResults(prev => [
              ...prev,
              `✅ Profile Sync: Profile found for ${profile.email}`,
            ])
          }
        } catch (error) {
          setTestResults(prev => [...prev, `❌ Profile Sync Error: ${error}`])
        }
        break

      case 'oidc-token':
        try {
          const token = getValidOIDCToken()
          if (token) {
            setTestResults(prev => [
              ...prev,
              `✅ OIDC Token: Valid token from ${token.issuer}`,
            ])
          } else {
            setTestResults(prev => [
              ...prev,
              `⚠️ OIDC Token: Not available (expected in local development)`,
            ])
          }
        } catch (error) {
          setTestResults(prev => [...prev, `❌ OIDC Token Error: ${error}`])
        }
        break

      default:
        setTestResults(prev => [...prev, `Unknown test: ${testName}`])
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const refreshDebugInfo = () => {
    loadDebugInfo()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '○'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading debug information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">🔐 Authentication Debug Page</h1>
          <p className="text-gray-600">
            Comprehensive debugging interface for the authentication flow
          </p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={refreshDebugInfo}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back to App
            </a>
          </div>
        </div>

        {/* Debug Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {debugInfo.map((section, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">{item.label}:</span>
                    <span className={`ml-2 text-right ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)} {String(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Test Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Run Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <button
              onClick={() => runTest('google-auth')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Google Auth
            </button>
            <button
              onClick={() => runTest('supabase-connection')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Supabase
            </button>
            <button
              onClick={() => runTest('profile-sync')}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test Profile Sync
            </button>
            <button
              onClick={() => runTest('oidc-token')}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Test OIDC Token
            </button>
          </div>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Results
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Test Results</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
              {testResults.map((result, idx) => (
                <div key={idx}>{result}</div>
              ))}
            </div>
          </div>
        )}

        {/* Documentation */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">📚 Quick Reference</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">CLI Commands:</h3>
              <code className="block bg-gray-100 p-2 rounded">pnpm run debug:auth</code>
              <code className="block bg-gray-100 p-2 rounded mt-1">pnpm run debug:supabase</code>
              <code className="block bg-gray-100 p-2 rounded mt-1">pnpm run debug:vercel</code>
              <code className="block bg-gray-100 p-2 rounded mt-1">pnpm run validate:env</code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Documentation:</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-600">
                <li>
                  <a href="/README_AUTHENTICATION.md" className="hover:underline">
                    README_AUTHENTICATION.md
                  </a>
                </li>
                <li>
                  <a href="/DEPLOYMENT_CHECKLIST.md" className="hover:underline">
                    DEPLOYMENT_CHECKLIST.md
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
