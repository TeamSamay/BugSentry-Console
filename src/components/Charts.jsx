import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ContributionGraph() {
  // Generate mock yearly GitHub contribution data (52 weeks)
  const weeks = 52;
  const data = Array.from({ length: 7 * weeks }, (_, i) => ({
    count: Math.floor(Math.random() * 5),
    date: i
  }));

  const getColor = (count) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    if (count === 1) return '#0e4429';
    if (count === 2) return '#006d32';
    if (count === 3) return '#26a641';
    return '#39d353';
  };

  return (
    <div className="dev-activity-card yearly-contribution-view">
      <div className="activity-card-header">
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>Organizational Security Contributions</h3>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
          Yearly Audit Pulse
        </span>
      </div>
      <div className="contribution-grid-wrapper" style={{ marginTop: '20px', overflowX: 'auto', paddingBottom: '12px' }}>
        <div className="contribution-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${weeks}, 1fr)`, 
          gridTemplateRows: 'repeat(7, 1fr)', 
          gridAutoFlow: 'column', 
          gap: '3px',
          width: 'max-content'
        }}>
          {data.map((day, i) => (
            <div 
              key={i} 
              style={{ 
                width: '10px', 
                height: '10px', 
                backgroundColor: getColor(day.count), 
                borderRadius: '2px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }} 
              title={`${day.count} security audits`}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.4)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(57, 211, 83, 0.5)';
                e.currentTarget.style.zIndex = '10';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.zIndex = '1';
              }}
            />
          ))}
        </div>
        <div className="contribution-legend" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '20px' }}>
          <span>Less Audits</span>
          {[0, 1, 2, 3, 4].map(c => (
            <div key={c} style={{ width: '10px', height: '10px', backgroundColor: getColor(c), borderRadius: '2px' }} />
          ))}
          <span>Consistently Secure</span>
        </div>
      </div>
    </div>
  );
}

export function RiskGraph({ data: inputData }) {
  const defaultData = [15, 25, 45, 30, 60, 40, 20];
  const data = inputData || defaultData;
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const width = 600;
  const height = 120;
  const dx = width / (data.length - 1);
  const max = 100;
  const dy = height / max;

  let pathLine = `M 0 ${height - data[0] * dy}`;
  let pathArea = `M 0 ${height} L 0 ${height - data[0] * dy}`;

  data.forEach((val, i) => {
    if (i > 0) {
      pathLine += ` L ${i * dx} ${height - val * dy}`;
      pathArea += ` L ${i * dx} ${height - val * dy}`;
    }
  });
  pathArea += ` L ${width} ${height} Z`;

  return (
    <div className="dev-activity-card trend-elevation">
      <div className="dev-feed-header" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Organizational Risk Trends</h3>
        <div className="trend-badge-row">
          <span className="badge-positive">↑ 12% Improvements</span>
          <span className="badge-neutral">Systemic Stability</span>
        </div>
      </div>
      <div style={{ width: '100%', height: 'auto', paddingBottom: '12px' }}>
        <svg viewBox={`0 -15 ${width} ${height + 50}`} style={{ width: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGradOrg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#58a6ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#58a6ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={pathArea} fill="url(#areaGradOrg)" />
          <path d={pathLine} fill="none" stroke="#58a6ff" strokeWidth="4" strokeLinecap="round" />
          {data.map((val, i) => (
            <g key={i}>
              <circle cx={i * dx} cy={height - val * dy} r="4" fill="#0d1117" stroke="#58a6ff" strokeWidth="2" />
              <text x={i * dx} y={i % 2 === 0 ? height + 35 : height + 25} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle" fontWeight="500">{labels[i]}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

const defaultRiskData = [
  { name: 'Jan', risk: 400 },
  { name: 'Feb', risk: 320 },
  { name: 'Mar', risk: 600 },
  { name: 'Apr', risk: 450 },
  { name: 'May', risk: 900 },
  { name: 'Jun', risk: 500 },
  { name: 'Jul', risk: 300 },
];

export function RepositoryRiskChart({ data: inputData }) {
  const data = inputData || defaultRiskData;
  return (
    <div className="dev-activity-card overview-elevation">
      <div className="activity-card-header" style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff' }}>Strategic Risk Projections</h3>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Unified Cluster Intelligence</span>
      </div>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRiskUnified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f85149" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Area type="step" dataKey="risk" stroke="#f85149" fillOpacity={1} fill="url(#colorRiskUnified)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
