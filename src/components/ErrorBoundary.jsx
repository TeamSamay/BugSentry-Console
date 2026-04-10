import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    // Keep console error for dev overlay + debugging
    // eslint-disable-next-line no-console
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{ padding: 24, color: '#e6edf3', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>UI crashed</h2>
        <div style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.6 }}>
          Open DevTools Console for the full stack trace.
        </div>
        <pre style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'auto' }}>
{String(this.state.error?.message || this.state.error)}
        </pre>
      </div>
    );
  }
}

