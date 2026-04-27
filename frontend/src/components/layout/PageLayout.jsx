import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './PageLayout.css';

export function PageLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-layout" >
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      <div className="page-body" >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="page-main" >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

