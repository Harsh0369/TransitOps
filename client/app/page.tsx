'use client';

import React from 'react';
import { useAppContext } from '../providers/AppProvider';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardView } from '../components/DashboardView';
import { DispatcherConsole } from '../components/DispatcherConsole';
import { FleetView } from '../components/FleetView';
import { DriversView } from '../components/DriversView';
import { TripsView } from '../components/TripsView';
import { MaintenanceView } from '../components/MaintenanceView';
import { ExpensesView } from '../components/ExpensesView';
import { AnalyticsView } from '../components/AnalyticsView';
import { SettingsView } from '../components/SettingsView';

export default function Home() {
  const { activeTab } = useAppContext();

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'dispatcher':
        return <DispatcherConsole />;
      case 'fleet':
        return <FleetView />;
      case 'drivers':
        return <DriversView />;
      case 'trips':
        return <TripsView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'expenses':
        return <ExpensesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex bg-zinc-50 min-h-screen w-full font-sans antialiased text-zinc-950">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header />

        {/* Dynamic Panel Content */}
        <main className="pt-20 pl-72 pr-8 pb-12 flex-1 w-full bg-zinc-50/50">
          <div className="max-w-7xl mx-auto py-4">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login');
}
