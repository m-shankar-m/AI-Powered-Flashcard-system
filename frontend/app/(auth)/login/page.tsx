"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      Cookies.set("token", res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-2xl w-full max-w-md z-10 border border-slate-700/50 shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/30">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-6 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>
        
        <p className="text-slate-400 text-center mt-6 text-sm">
          Don't have an account? <Link href="/register" className="text-blue-400 hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
