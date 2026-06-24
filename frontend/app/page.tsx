import Link from "next/link";
import { BrainCircuit, Sparkles, Zap, ArrowRight, FileText, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none animate-pulse-slow delay-1000" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">AI Flashcards</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-6 py-2.5 text-slate-300 hover:text-white font-medium transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all transform hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-blue-400 font-medium text-sm mb-8 shadow-inner animate-fade-in-up">
            <Sparkles size={16} /> Welcome to the future of learning
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-purple-400 mb-8 tracking-tighter leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Master Any Topic <br className="hidden md:block"/> in Minutes.
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Upload your documents, PDFs, or notes. Our AI instantly transforms them into interactive, voice-enabled flashcards designed for maximum retention.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/register" className="group px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:-translate-y-1 text-lg">
              Start Learning Now <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20}/>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {[
            {
              icon: <FileText size={32} className="text-blue-400" />,
              title: "Instant Extraction",
              desc: "Upload CSV, PDF, or DOC files. Our AI reads the context and pulls out the most crucial information automatically."
            },
            {
              icon: <Zap size={32} className="text-purple-400" />,
              title: "Voice Interactions",
              desc: "Practice naturally by speaking your answers. Our voice-to-text engine and smart grading will evaluate your response."
            },
            {
              icon: <CheckCircle2 size={32} className="text-emerald-400" />,
              title: "Smart Grading",
              desc: "We don't look for exact matches. Our fuzzy logic understands the meaning behind your words to grade you fairly."
            }
          ].map((feature, i) => (
            <div key={i} className="glass p-10 rounded-3xl border border-slate-800/80 hover:border-slate-600 transition-colors shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/30 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
