import React from 'react';

export function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      {icon && <div className="stat-card-icon" style={{ color }}>{icon}</div>}
      <div className="stat-card-info">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-title">{title}</span>
      </div>
    </div>
  );
}

