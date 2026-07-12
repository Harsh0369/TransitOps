"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Truck, 
  Route, 
  ShieldCheck, 
  PieChart, 
  Mail, 
  Lock, 
  EyeOff,
  Eye,
  LogIn
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("Fleet Manager");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const roles = [
    {
      id: "Fleet Manager",
      icon: <Truck className="w-5 h-5" />,
      title: "Fleet Manager",
      description: "Manage fleet assets, vehicles and maintenance."
    },
    {
      id: "Dispatcher",
      icon: <Route className="w-5 h-5" />,
      title: "Dispatcher",
      description: "Create, dispatch and monitor transport trips."
    },
    {
      id: "Safety Officer",
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Safety Officer",
      description: "Monitor licenses, compliance and safety scores."
    },
    {
      id: "Financial Analyst",
      icon: <PieChart className="w-5 h-5" />,
      title: "Financial Analyst",
      description: "Track fuel, expenses, profitability and ROI."
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white font-sans">
      {/* Left Panel: Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden flex-col justify-between p-12">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8ed7c663be?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
        
        {/* Logo Section */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Truck className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-tight">TransitOps</h2>
            <p className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Operations Platform</p>
          </div>
        </div>

        {/* Text overlay bottom */}
        <div className="relative z-10 mb-8">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight max-w-lg">
            Smart Transport Operations Platform
          </h1>
          <p className="text-lg text-zinc-300 max-w-md mb-12">
            Optimizing the pulse of global logistics through precision data and real-time fleet intelligence.
          </p>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">One Login, Four Roles:</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm text-zinc-300 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Fleet Manager
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Dispatcher
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Safety Officer
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Financial Analyst
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-[#09090b]">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Sign in to your account</h2>
            <p className="text-zinc-400">Enter your credentials to continue</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); login(selectedRole); }}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-sm"
                  placeholder="raven.k@transitops.in"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-zinc-700 bg-zinc-900 group-hover:border-amber-500 transition-colors">
                  <input type="checkbox" className="opacity-0 absolute" />
                  {/* Custom Checkbox mark can be added here if needed */}
                </div>
                <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-blue-500 hover:text-blue-400 font-medium transition-colors text-sm">
                Forgot password?
              </a>
            </div>

            {/* Error Alert Box mock */}
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/40 flex items-start gap-3 mt-4">
              <div className="w-2.5 h-2.5 mt-1 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] shrink-0" />
              <div>
                <h4 className="text-[13px] font-semibold text-red-200">INVALID CREDENTIALS</h4>
                <p className="text-[11px] text-red-300/80 mt-0.5">Account will be locked after 5 failed attempts.</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <motion.div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id as Role)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer rounded-xl p-3 border transition-all duration-300 ${
                        isSelected 
                          ? "bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                          : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 ${isSelected ? "text-amber-500" : "text-zinc-500"}`}>
                          {role.icon}
                        </div>
                        <div>
                          <h4 className={`text-sm font-medium ${isSelected ? "text-amber-500" : "text-zinc-200"}`}>
                            {role.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-[11px] text-zinc-500 mt-3 text-center sm:text-left">
                Your dashboard and permissions are determined by the selected role.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all active:scale-[0.98]"
            >
              Sign In
              <LogIn className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Status */}
          <div className="mt-12 flex items-center justify-center lg:justify-end gap-3 text-xs font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span className="text-zinc-400">System Status : Active</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
              v2.4.12-pro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
