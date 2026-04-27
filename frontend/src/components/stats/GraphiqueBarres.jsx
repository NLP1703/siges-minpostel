import React from 'react';
import './GraphiqueBarres.css';

export function GraphiqueBarres({ data, title }) {
  const maxValue = Math.max(...data.map(d => d.valeur), 1);
  
  return (
    <div className="graphique-barres">
      {title && <h3 className="graphique-title">{title}</h3>}
      <div className="barres-container">
        {data.map((item, index) => (
          <div key={index} className="barre-item">
            <div className="barre-bar-container">
              <div 
                className="barre-bar"
                style={{ 
                  height: `${(item.valeur / maxValue) * 100}%`,
                  animationDelay: `${index * 0.1}s`
                }}
                title={item.valeur}
              >
                <span className="barre-value">{item.valeur}</span>
              </div>
            </div>
            <span className="barre-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}