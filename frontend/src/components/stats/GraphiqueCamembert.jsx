import React from 'react';
import './GraphiqueCamembert.css';

export function GraphiqueCamembert({ data, title }) {
  const total = data.reduce((sum, item) => sum + item.valeur, 0);
  
  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.valeur / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
      color: item.color || '#007A5E'
    };
  });

  // Create conic gradient for the pie
  const gradientParts = segments.map(seg => {
    const startPct = (seg.startAngle / 360) * 100;
    const endPct = (seg.endAngle / 360) * 100;
    return `${seg.color} ${startPct}% ${endPct}%`;
  }).join(', ');

  return (
    <div className="graphique-camembert">
      {title && <h3 className="graphique-title">{title}</h3>}
      
      <div className="camembert-container">
        <div 
          className="camembert-chart"
          style={{ background: `conic-gradient(${gradientParts})` }}
        >
          <div className="camembert-center">
            <span className="camembert-total">{total}</span>
            <span className="camembert-label">Total</span>
          </div>
        </div>
        
        <div className="camembert-legend">
          {segments.map((seg, index) => (
            <div key={index} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: seg.color }}
              />
              <span className="legend-label">{seg.label}</span>
              <span className="legend-value">{seg.valeur}</span>
              <span className="legend-pct">{seg.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}