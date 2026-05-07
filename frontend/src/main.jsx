import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error Boundary để hiện lỗi thay vì màn hình trắng
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f8ff',
          fontFamily: 'monospace',
          padding: '24px'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ color: '#dc2626', margin: '0 0 16px', fontSize: '20px' }}>
              ❌ Ứng dụng gặp lỗi
            </h2>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <strong style={{ color: '#dc2626' }}>Lỗi:</strong>
              <pre style={{ margin: '8px 0 0', color: '#991b1b', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                {this.state.error?.toString()}
              </pre>
            </div>
            {this.state.info && (
              <details style={{ cursor: 'pointer' }}>
                <summary style={{ color: '#4a6080', marginBottom: '8px' }}>Chi tiết stack trace</summary>
                <pre style={{
                  background: '#f5f8ff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {this.state.info.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
