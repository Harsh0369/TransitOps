'use client';

import React from 'react';
import { useExpenses, useFuelLogs } from '../hooks/queries';
import { Fuel, Wrench, CreditCard, Sparkles } from 'lucide-react';

export const ExpensesView = () => {
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: fuelLogs = [], isLoading: fuelLoading } = useFuelLogs();
  const isLoading = expensesLoading || fuelLoading;

  // Combined transactions sorted by date
  const transactions = [
    ...expenses.map((e: any) => ({
      id: e.id,
      vehicleName: e.vehicle?.name || e.vehicleName,
      type: e.expenseType,
      amount: e.amount,
      description: e.description,
      date: e.date || e.createdAt,
      category: 'General'
    })),
    ...fuelLogs.map((f: any) => ({
      id: f.id,
      vehicleName: f.vehicle?.name || f.vehicleName,
      type: 'Fuel Fill',
      amount: f.cost,
      description: `Filled ${f.liters} liters of diesel`,
      date: f.date || f.createdAt,
      category: 'Fuel'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (type: string) => {
    if (type.toLowerCase() === 'fuel' || type.toLowerCase() === 'fuel fill') {
      return <Fuel className="w-4 h-4 text-indigo-600" />;
    }
    if (type.toLowerCase() === 'maintenance') {
      return <Wrench className="w-4 h-4 text-amber-500" />;
    }
    return <CreditCard className="w-4 h-4 text-emerald-600" />;
  };

  const getTypeStyle = (type: string) => {
    if (type.toLowerCase() === 'fuel' || type.toLowerCase() === 'fuel fill') {
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
    if (type.toLowerCase() === 'maintenance') {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  };

  return (
    <div className="space-y-6">
      {/* Ledger overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Fuel Liters</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">
              {isLoading ? '...' : fuelLogs.reduce((sum: number, f: any) => sum + f.liters, 0).toLocaleString()} L
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Fuel className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Fuel Cost</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">
              INR {isLoading ? '...' : fuelLogs.reduce((sum: number, f: any) => sum + f.cost, 0).toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Repair & Shop Expenses</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">
              INR {isLoading ? '...' : expenses.filter((e: any) => e.expenseType === 'Maintenance').reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ledger transaction logs */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 mb-5">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-zinc-800">Operational Expense Ledger</h2>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-zinc-400">Loading expenses...</div>
          ) : transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 border border-zinc-100 bg-zinc-50/20 rounded-xl flex items-center justify-between gap-4 hover:border-zinc-200 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-[240px]">
                <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                  {getIcon(tx.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400">{tx.id}</span>
                    <span className="text-sm font-semibold text-zinc-800">{tx.vehicleName || 'General'}</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">{tx.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeStyle(tx.type)}`}>
                  {tx.type}
                </span>

                <div className="text-right">
                  <span className="text-sm font-bold text-zinc-800">INR {tx.amount.toLocaleString()}</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && transactions.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-400">
              No transactions currently logged in ledger.
            </div>
          )}
          {isLoading && transactions.length > 0 && null /* To satisfy TS/JSX parsing */}
        </div>
      </div>
    </div>
  );
};
