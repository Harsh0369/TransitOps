'use client';

import React, { useState } from 'react';
import { useAppContext } from '../providers/AppProvider';
import { AuditLog } from '../types';
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  Clock,
  User,
  Shield,
  Globe,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuditLogsView = () => {
  const { auditLogs } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter actions
  const getActionCategory = (action: string) => {
    if (action.includes('CREATED') || action.includes('STARTED')) return 'create';
    if (action.includes('DISPATCHED') || action.includes('APPROVED') || action.includes('RENEWED') || action.includes('UPDATED')) return 'update';
    if (action.includes('CHANGED') || action.includes('UPDATED') || action.includes('SCORE')) return 'status';
    if (action.includes('CANCELLED') || action.includes('REJECTED') || action.includes('DELETED')) return 'delete';
    return 'other';
  };

  // Filter & Search Logic
  const filteredLogs = auditLogs.filter(log => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      log.id.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.entity.toLowerCase().includes(searchLower) ||
      log.entityId.toLowerCase().includes(searchLower) ||
      (log.reason || '').toLowerCase().includes(searchLower) ||
      (log.user?.name || '').toLowerCase().includes(searchLower) ||
      (log.user?.email || '').toLowerCase().includes(searchLower);

    const matchesEntity = selectedEntityFilter === 'all' || log.entity.toLowerCase() === selectedEntityFilter.toLowerCase();
    
    const matchesAction = selectedActionFilter === 'all' || getActionCategory(log.action) === selectedActionFilter;

    return matchesSearch && matchesEntity && matchesAction;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper for rendering badges
  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CANCELLED') || act.includes('REJECTED') || act.includes('DELETED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50">
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (act.includes('DISPATCHED') || act.includes('STARTED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (act.includes('APPROVED') || act.includes('CLOSED') || act.includes('RENEWED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (act.includes('CREATED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50">
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  const getEntityBadge = (entity: string) => {
    const baseStyle = "inline-flex px-2 py-0.5 rounded text-xs font-medium border";
    switch (entity) {
      case 'Trip':
        return <span className={`${baseStyle} bg-indigo-50/50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30`}>{entity}</span>;
      case 'Vehicle':
        return <span className={`${baseStyle} bg-sky-50/50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30`}>{entity}</span>;
      case 'Driver':
        return <span className={`${baseStyle} bg-emerald-50/50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30`}>{entity}</span>;
      case 'User':
        return <span className={`${baseStyle} bg-purple-50/50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30`}>{entity}</span>;
      case 'Maintenance':
        return <span className={`${baseStyle} bg-amber-50/50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30`}>{entity}</span>;
      default:
        return <span className={`${baseStyle} bg-zinc-50 text-zinc-600 border-zinc-150 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700`}>{entity}</span>;
    }
  };

  // Helper for rendering JSON Diff view in detail panel
  const renderJSONDiff = (oldVal: any, newVal: any) => {
    if (!oldVal && !newVal) return <span className="text-zinc-400 italic text-xs">No values modified</span>;

    // If one is null, it's a creation or deletion
    if (!oldVal) {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Created Fields:</span>
          <pre className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-lg text-xs font-mono text-emerald-800 dark:text-emerald-300 overflow-x-auto">
            {JSON.stringify(newVal, null, 2)}
          </pre>
        </div>
      );
    }

    if (!newVal) {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Removed Fields:</span>
          <pre className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-3 rounded-lg text-xs font-mono text-rose-800 dark:text-rose-300 overflow-x-auto">
            {JSON.stringify(oldVal, null, 2)}
          </pre>
        </div>
      );
    }

    // Otherwise, calculate diff keys
    const allKeys = Array.from(new Set([...Object.keys(oldVal), ...Object.keys(newVal)]));

    return (
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Field Value Modification</span>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left border-collapse font-sans">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-semibold border-b border-zinc-150 dark:border-zinc-800">
                <th className="px-4 py-2 w-1/3">Field</th>
                <th className="px-4 py-2 w-1/3 text-rose-600 dark:text-rose-400">Old Value</th>
                <th className="px-4 py-2 w-1/3 text-emerald-600 dark:text-emerald-400">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {allKeys.map(key => {
                const oVal = oldVal[key];
                const nVal = newVal[key];
                const isDifferent = JSON.stringify(oVal) !== JSON.stringify(nVal);

                if (!isDifferent) return null; // Only show changes

                return (
                  <tr key={key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850">
                    <td className="px-4 py-2.5 font-semibold text-zinc-700 dark:text-zinc-300">{key}</td>
                    <td className="px-4 py-2.5 text-zinc-400 dark:text-zinc-500 line-through">
                      {oVal === undefined || oVal === null ? 'null' : typeof oVal === 'object' ? JSON.stringify(oVal) : String(oVal)}
                    </td>
                    <td className="px-4 py-2.5 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/20 dark:bg-emerald-950/10">
                      {nVal === undefined || nVal === null ? 'null' : typeof nVal === 'object' ? JSON.stringify(nVal) : String(nVal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header KPI Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Total Logs</span>
            <span className="text-2xl font-bold text-zinc-800 dark:text-white leading-none">{auditLogs.length}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1 font-semibold">Ledger Active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Trip Events</span>
            <span className="text-2xl font-bold text-zinc-800 dark:text-white leading-none">
              {auditLogs.filter(l => l.entity === 'Trip').length}
            </span>
            <span className="text-[10px] text-zinc-400 block mt-1">Dispatches & completions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Maintenance</span>
            <span className="text-2xl font-bold text-zinc-800 dark:text-white leading-none">
              {auditLogs.filter(l => l.entity === 'Maintenance').length}
            </span>
            <span className="text-[10px] text-zinc-400 block mt-1">Workshops & repairs</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Security & Access</span>
            <span className="text-2xl font-bold text-zinc-800 dark:text-white leading-none">
              {auditLogs.filter(l => l.entity === 'User' || l.entity === 'VehicleCompliance').length}
            </span>
            <span className="text-[10px] text-zinc-400 block mt-1">Role & status changes</span>
          </div>
        </div>
      </div>

      {/* Interactive Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Actor, Entity ID, Action..."
            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-zinc-50/50 dark:bg-zinc-950 placeholder-zinc-400 text-zinc-800 dark:text-zinc-200 transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">Entity:</span>
          </div>
          <select
            value={selectedEntityFilter}
            onChange={(e) => { setSelectedEntityFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Entities</option>
            <option value="trip">Trip</option>
            <option value="vehicle">Vehicle</option>
            <option value="driver">Driver</option>
            <option value="user">User</option>
            <option value="maintenance">Maintenance</option>
            <option value="vehiclecompliance">Compliance</option>
          </select>

          <span className="text-xs text-zinc-350 dark:text-zinc-850 font-medium">|</span>

          <span className="text-xs text-zinc-500 font-medium">Category:</span>
          <select
            value={selectedActionFilter}
            onChange={(e) => { setSelectedActionFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="create">Creations</option>
            <option value="update">Modifications</option>
            <option value="status">Status & Score</option>
            <option value="delete">Cancellations</option>
          </select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50/70 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4 w-[160px]">Timestamp</th>
                <th className="px-6 py-4 w-[180px]">Action</th>
                <th className="px-6 py-4 w-[140px]">Target Entity</th>
                <th className="px-6 py-4 w-[120px]">Entity ID</th>
                <th className="px-6 py-4 w-[180px]">Operator</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-zinc-50/40 dark:hover:bg-zinc-850/40 transition-colors duration-150 cursor-pointer group"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4.5 whitespace-nowrap text-zinc-400 dark:text-zinc-500 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4.5 font-medium">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4.5">
                      {getEntityBadge(log.entity)}
                    </td>
                    <td className="px-6 py-4.5 font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {log.entityId}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase shrink-0">
                          {log.user?.name ? log.user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'SY'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{log.user?.name || 'System Auto'}</p>
                          <p className="text-[9px] text-zinc-400 truncate">{log.user?.email || 'automated@transitops.in'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all cursor-pointer group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ClipboardList className="w-8 h-8 text-zinc-300 dark:text-zinc-800 animate-pulse" />
                      <p className="text-sm font-semibold">No operations logs match the current filters.</p>
                      <p className="text-xs text-zinc-400">Try modifying your search or dropdown filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Showing <span className="font-semibold text-zinc-700 dark:text-zinc-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
              </span>{' '}
              of <span className="font-semibold text-zinc-700 dark:text-zinc-300">{filteredLogs.length}</span> audit logs
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-150/40 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-7.5 h-7.5 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                      page === currentPage
                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-150/40 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Detail Drawer/Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider">Inspect Operations Log</h3>
                    <span className="text-[10px] text-zinc-400 font-mono block truncate max-w-xs">{selectedLog.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Action & Target</span>
                    <div className="space-y-1.5">
                      <div>{getActionBadge(selectedLog.action)}</div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 mt-2">
                        <span className="font-semibold text-zinc-400">Entity:</span>
                        {getEntityBadge(selectedLog.entity)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
                        <span className="font-semibold text-zinc-400">ID:</span>
                        <span>{selectedLog.entityId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Operator Info</span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{selectedLog.user?.name || 'System Automated'}</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{selectedLog.user?.email || 'automated@transitops.in'}</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-1">Role: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedLog.user?.role || 'SYSTEM'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Audit Context Details (IP & Reason) */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Timestamp:</span>
                    </div>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      <span>IP Address:</span>
                    </div>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      {selectedLog.ipAddress || '127.0.0.1 (local)'}
                    </span>
                  </div>

                  {selectedLog.reason && (
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-850 text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Reason for Modification:</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 font-medium italic pl-5">
                        "{selectedLog.reason}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Value Difference Visualizer */}
                <div className="space-y-2">
                  {renderJSONDiff(selectedLog.oldValue, selectedLog.newValue)}
                </div>

                {/* Meta details if any */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Additional Metadata</span>
                    <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl text-xs font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto max-h-40">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-800 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 border border-zinc-750 text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-black/10 active:scale-[0.98]"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
