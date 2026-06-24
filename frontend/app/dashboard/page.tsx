"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Play, Loader2, LogOut, X } from "lucide-react";
import Cookies from "js-cookie";

export default function Dashboard() {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedSet, setSelectedSet] = useState<any>(null);
  const [limit, setLimit] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const res = await api.get("/flashcards/sets");
      setSets(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      await api.post("/flashcards/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setTitle("");
      setFile(null);
      fetchSets();
    } catch (err) {
      alert("Upload failed. Ensure file is CSV, PDF, or DOC/DOCX.");
    } finally {
      setUploading(false);
    }
  };

  const startTest = () => {
    if (selectedSet) {
      router.push(`/test/${selectedSet._id}?limit=${limit}`);
    }
  };

  const logout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12 p-6 rounded-3xl glass shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">Dashboard</h1>
          <button onClick={logout} className="text-slate-300 hover:text-white flex items-center gap-2 transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl">
            <LogOut size={18} /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 glass p-8 rounded-3xl border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full" />
            
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <UploadCloud className="text-blue-400" size={28} /> Create New Set
            </h2>
            <form onSubmit={handleUpload} className="space-y-6 relative z-10">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Set Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner"
                  placeholder="e.g., Biology 101"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Document (CSV, PDF, DOCX)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    required
                    accept=".csv,.pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-slate-900/80 border-2 border-dashed border-slate-700 group-hover:border-blue-500/50 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 transition-all shadow-inner">
                    <UploadCloud size={32} className="mb-2 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm text-center">
                      {file ? <span className="text-blue-400 font-semibold">{file.name}</span> : "Drag & drop or click to browse"}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                disabled={uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-1"
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : "Generate Flashcards"}
              </button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Your Collections</h2>
              <div className="text-slate-400 text-sm font-medium">{sets.length} Sets</div>
            </div>
            
            {sets.length === 0 ? (
              <div className="glass p-16 rounded-3xl text-center border border-slate-700/50 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                  <FileText className="text-slate-500" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No flashcards yet</h3>
                <p className="text-slate-400 max-w-md">Upload your first study material on the left to let our AI generate a magical learning experience for you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sets.map((set: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    key={set._id} 
                    className="glass p-6 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_40px_rgba(37,99,235,0.2)] cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner">
                        <FileText size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">{set.title}</h3>
                      <p className="text-slate-400 text-sm mb-6">{set.flashcards.length} Flashcards</p>
                    </div>
                    <button 
                      onClick={() => setSelectedSet(set)}
                      className="w-full bg-slate-800/80 group-hover:bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold"
                    >
                      <Play size={18} fill="currentColor" /> Let's Practice
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Limit Modal */}
      <AnimatePresence>
        {selectedSet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-10 rounded-3xl w-full max-w-md border border-slate-600 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full" />
              
              <button 
                onClick={() => setSelectedSet(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-red-500"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Play size={32} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">{selectedSet.title}</h2>
              <p className="text-slate-400 text-sm mb-8 font-medium">Select how many questions you want to attempt in this session.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                {['5', '10', '20', 'all'].map((opt) => {
                  const numCards = selectedSet.flashcards.length;
                  if (opt !== 'all' && parseInt(opt) > numCards) return null;
                  
                  return (
                    <button
                      key={opt}
                      onClick={() => setLimit(opt)}
                      className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${limit === opt ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-105' : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'}`}
                    >
                      {opt === 'all' ? 'All' : opt}
                      <span className="block text-xs font-normal opacity-70 mt-1">{opt === 'all' ? `${numCards} cards` : 'cards'}</span>
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={startTest}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] text-lg tracking-wide relative z-10 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
              >
                Start Session
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
