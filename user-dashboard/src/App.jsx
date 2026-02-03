import { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'

function App() {
  const [message, setMessage] = useState('Initializing User Dashboard...')
  const [services, setServices] = useState({
    frontend: { status: 'running', port: 3000, name: 'User Dashboard', tech: 'React', icon: '⚛️', category: 'frontend' },
    gateway: { status: 'pending', port: 3001, name: 'API Gateway', tech: 'Node.js', icon: '🚪', category: 'backend' },
    auth: { status: 'pending', port: 3002, name: 'Auth Service', tech: 'Laravel', icon: '🔐', category: 'backend' },
    analytics: { status: 'pending', port: 3003, name: 'Analytics', tech: 'Python', icon: '📊', category: 'backend' },
    database: { status: 'pending', port: 5432, name: 'Database', tech: 'PostgreSQL', icon: '🗄️', category: 'data' },
    cache: { status: 'pending', port: 6379, name: 'Cache', tech: 'Redis', icon: '⚡', category: 'data' }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const fetchServiceStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('http://localhost:3001/api/status')
      const gatewayData = response.data

      setServices(prev => ({
        ...prev,
        gateway: {
          ...prev.gateway,
          status: 'running'
        },
        auth: {
          ...prev.auth,
          status: gatewayData.services.find(s => s.key === 'auth')?.status || 'pending'
        },
        analytics: {
          ...prev.analytics,
          status: gatewayData.services.find(s => s.key === 'analytics')?.status || 'pending'
        }
      }))

      setMessage('All systems operational')
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to connect to gateway:', err)
      setError('Unable to connect to API Gateway')
      setMessage('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServiceStatus()
    const interval = setInterval(fetchServiceStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'status-running'
      case 'pending': return 'status-pending'
      case 'error': return 'status-error'
      default: return 'status-unknown'
    }
  }

  const handleRefresh = () => {
    fetchServiceStatus()
  }

  const runningCount = Object.values(services).filter(s => s.status === 'running').length
  const totalCount = Object.values(services).length
  const healthPercentage = Math.round((runningCount / totalCount) * 100)

  return (
    <div className="min-h-screen bg-animated-bg relative overflow-x-hidden">
      <div className="grain-overlay fixed inset-0 pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-20 min-h-screen">
        {/* Compact Header */}
        <header className="glass-card p-6 mb-6 flex justify-between items-center gap-6 transition-all duration-300 hover:shadow-lg hover:border-accent-primary/20">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-2xl filter drop-shadow-md">🐳</span>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-text-primary tracking-tight">Microservices Dashboard</h1>
              <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <span className="font-medium">{message}</span>
                <span className="text-text-muted">•</span>
                <span className="font-mono">{lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-2 bg-white/2 rounded-lg border border-white/5">
              <div className="w-10 h-10">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`circle ${healthPercentage === 100 ? 'healthy' : healthPercentage > 50 ? 'warning' : 'critical'}`}
                    strokeDasharray={`${healthPercentage}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{healthPercentage}%</text>
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">System Health</div>
                <div className="text-lg font-bold text-text-primary font-mono">{runningCount}/{totalCount}</div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`text-lg ${loading ? 'animate-spin-slow' : ''}`}>↻</span>
            </button>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="bg-accent-error/10 border border-accent-error/30 rounded-lg p-4 mb-6 flex justify-between items-center gap-6 animate-slideDown">
            <div className="flex items-center gap-4">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-medium text-text-secondary">{error}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-accent-error/20 border border-accent-error/40 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-accent-error/30 whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Services Column */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Services</h2>
              <div className="flex gap-2">
                <span className="status-dot running"></span>
                <span className="status-dot pending"></span>
                <span className="status-dot error"></span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {Object.entries(services).map(([key, service]) => (
                <div
                  key={key}
                  className="bg-white/2 border border-white/5 rounded-lg p-4 flex justify-between items-center gap-4 transition-all duration-300 hover:bg-white/8 hover:border-accent-primary/30 hover:translate-x-1 relative overflow-hidden group"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:shadow-lg ${service.status === 'running' ? 'bg-status-running shadow-[0_0_10px_rgba(16,185,129,0.6)]' :
                    service.status === 'pending' ? 'bg-status-pending shadow-[0_0_10px_rgba(245,158,11,0.6)]' :
                      service.status === 'error' ? 'bg-status-error shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-status-unknown'
                    }`}></div>

                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-11 h-11 bg-white/5 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border border-white/8">
                      {service.icon}
                      <div className={`status-dot ${service.status} absolute -top-1 -right-1 w-3 h-3 border-2 border-bg-secondary`}></div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm font-semibold text-text-primary">{service.name}</div>
                      <div className="text-xs text-text-tertiary font-medium">{service.tech}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs font-semibold text-text-tertiary px-2.5 py-1 bg-white/5 rounded-lg border border-white/8 font-mono">
                      :{service.port}
                    </div>
                    <div className={`status-pill ${getStatusColor(service.status)}`}>
                      {service.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/5">
              <div className="bg-white/2 border border-white/5 rounded-lg p-3 flex items-center gap-2 transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5">
                <div className="text-lg w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">🌐</div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs font-bold text-text-primary">Development</div>
                  <div className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">Environment</div>
                </div>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-lg p-3 flex items-center gap-2 transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5">
                <div className="text-lg w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">🔄</div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs font-bold text-text-primary">5s</div>
                  <div className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">Auto-refresh</div>
                </div>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-lg p-3 flex items-center gap-2 transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5">
                <div className="text-lg w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">📦</div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs font-bold text-text-primary">v1.0.0</div>
                  <div className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">Version</div>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Visualization */}
          <div className="glass-card p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Architecture Flow</h2>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">Client Layer</div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4 w-full max-w-xs transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[0_4px_12px_rgba(99,102,241,0.2)]">
                  <div className="text-2xl w-13 h-13 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">⚛️</div>
                  <div className="flex flex-col gap-1">
                    <div className="text-base font-bold text-text-primary">Frontend</div>
                    <div className="text-xs text-text-tertiary font-medium">React SPA</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-accent-primary to-accent-secondary"></div>
                <div className="text-accent-secondary text-sm">▼</div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">Gateway Layer</div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4 w-full max-w-xs transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[0_4px_12px_rgba(139,92,246,0.2)]">
                  <div className="text-2xl w-13 h-13 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">🚪</div>
                  <div className="flex flex-col gap-1">
                    <div className="text-base font-bold text-text-primary">API Gateway</div>
                    <div className="text-xs text-text-tertiary font-medium">Node.js</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-accent-primary to-accent-secondary"></div>
                <div className="text-accent-secondary text-sm">▼</div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">Service Layer</div>
                <div className="flex gap-2 w-full max-w-xs">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 flex-1 transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5">
                    <div className="text-lg w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">🔐</div>
                    <div className="text-xs font-semibold text-text-primary text-center">Auth</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 flex-1 transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5">
                    <div className="text-lg w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">📊</div>
                    <div className="text-xs font-semibold text-text-primary text-center">Analytics</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-accent-primary to-accent-secondary"></div>
                <div className="text-accent-secondary text-sm">▼</div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">Data Layer</div>
                <div className="flex gap-2 w-full max-w-xs">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 flex-1 transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5 hover:border-accent-tertiary/30">
                    <div className="text-lg w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">🗄️</div>
                    <div className="text-xs font-semibold text-text-primary text-center">PostgreSQL</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center gap-2 flex-1 transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5 hover:border-accent-tertiary/30">
                    <div className="text-lg w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">⚡</div>
                    <div className="text-xs font-semibold text-text-primary text-center">Redis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default App