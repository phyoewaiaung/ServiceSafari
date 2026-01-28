import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('🚀 Initializing User Dashboard...')
  const [services, setServices] = useState({
    frontend: { status: 'running', port: 3000, name: 'User Dashboard (React)' },
    gateway: { status: 'pending', port: 3001, name: 'API Gateway (Node.js)' },
    auth: { status: 'pending', port: 3002, name: 'Auth Service (Laravel)' },
    analytics: { status: 'pending', port: 3003, name: 'Analytics (Python)' },
    database: { status: 'pending', port: 5432, name: 'Database (PostgreSQL)' },
    cache: { status: 'pending', port: 6379, name: 'Cache (Redis)' }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch service status from API Gateway
  const fetchServiceStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call our API Gateway
      const response = await axios.get('http://localhost:3001/api/status')
      const gatewayData = response.data

      // Update services with real data
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

      setMessage('✅ Connected to API Gateway!')
    } catch (err) {
      console.error('Failed to connect to gateway:', err)
      setError('❌ Cannot connect to API Gateway')
      setMessage('❌ API Gateway is not running')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial connection attempt
    fetchServiceStatus()

    // Set up polling to check services every 5 seconds
    const interval = setInterval(fetchServiceStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return '✅'
      case 'pending': return '⏳'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  const handleRefresh = () => {
    fetchServiceStatus()
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐳 Microservices User Dashboard</h1>
        <p className="subtitle">{message}</p>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={handleRefresh} className="retry-btn">
              🔄 Retry Connection
            </button>
          </div>
        )}

        <div className="services-grid">
          <h2>📊 Service Status</h2>
          <div className="services-container">
            {Object.entries(services).map(([key, service]) => (
              <div key={key} className="service-card">
                <div className="service-header">
                  <span className="status-icon">{getStatusIcon(service.status)}</span>
                  <h3>{service.name}</h3>
                </div>
                <p className="service-port">Port: {service.port}</p>
                <div className={`status-indicator ${service.status}`}>
                  {service.status.toUpperCase()}
                  {loading && key === 'gateway' && ' 🔄'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="connection-info">
          <h3>🔗 Connection Info</h3>
          <p>Frontend (React) ↔ API Gateway (Node.js)</p>
          <p>Gateway will route to: Auth (Laravel) & Analytics (Python)</p>
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Refresh Status
          </button>
        </div>
      </header>
    </div>
  )
}

export default App
