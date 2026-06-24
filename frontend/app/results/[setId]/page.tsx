"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Download, Award, Loader2, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import { motion } from "framer-motion";

export default function Results() {
  const { setId } = useParams();
  const router = useRouter();
  const [fset, setFset] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const setRes = await api.get(`/flashcards/sets/${setId}`);
      setFset(setRes.data);

      try {
        const resultRes = await api.get(`/flashcards/results/latest/${setId}`);
        setTestResult(resultRes.data);
      } catch (err) {
        console.error("No test results found or backend error:", err);
        setError("Could not retrieve test results. Ensure you completed the test.");
      }
    } catch (err) {
      console.error("Error fetching set:", err);
      setError("Failed to load flashcard set details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!testResult || !fset) return;
    
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`AI Flashcards - Test Results`, 15, 20);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Collection: ${fset.title}`, 15, 30);
    doc.text(`Score: ${testResult.total_score} / ${testResult.max_score} (${Math.round((testResult.total_score / testResult.max_score) * 100)}%)`, 15, 38);
    doc.text(`Date: ${new Date(testResult.timestamp).toLocaleString()}`, 15, 46);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 52, 195, 52);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Incorrect Answers Summary", 15, 62);
    
    let yPos = 72;
    const wrongAnswers = testResult.wrong_answers.filter((q: any) => !q.is_correct);
    
    if (wrongAnswers.length === 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.text("Perfect score! No incorrect answers.", 15, yPos);
    } else {
      wrongAnswers.forEach((q: any, idx: number) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}. Q: ${q.question}`, 15, yPos);
        yPos += 7;
        
        doc.setFont("helvetica", "normal");
        doc.text(`Your Answer: ${q.user_answer}`, 20, yPos);
        yPos += 6;
        
        doc.text(`Correct Answer: ${q.correct_answer}`, 20, yPos);
        yPos += 6;
        
        doc.text(`Match score: ${q.score}%`, 20, yPos);
        yPos += 12;
      });
    }
    
    doc.save(`${fset.title}_results.pdf`);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" size={48} /></div>;

  const scorePercentage = testResult ? Math.round((testResult.total_score / testResult.max_score) * 100) : 0;
  const incorrectQuestions = testResult ? testResult.wrong_answers.filter((q: any) => !q.is_correct) : [];

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans relative overflow-hidden text-white">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 pt-10">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-slate-400 hover:text-white flex items-center gap-2 mb-10 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        {error && !testResult ? (
          <div className="glass p-10 rounded-3xl border border-rose-500/30 text-center shadow-lg">
            <AlertCircle className="text-rose-400 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button 
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-10 rounded-3xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-8 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 blur-[50px] rounded-full" />
              
              <div className="relative z-10">
                <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  {scorePercentage >= 85 ? "Excellent Job!" : "Keep Practicing!"}
                </h1>
                <p className="text-xl text-slate-300">You completed <span className="text-white font-bold">"{fset?.title}"</span></p>
                <p className="text-slate-400 text-sm mt-2">Attempted: {testResult?.max_score} questions</p>
              </div>
              
              <div className="flex items-center gap-8 relative z-10">
                <div className="text-center">
                  <div className={`w-32 h-32 rounded-full border-4 ${
                    scorePercentage >= 85 ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  } flex flex-col items-center justify-center bg-slate-900/50`}>
                    <span className={`text-4xl font-black ${scorePercentage >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {testResult?.total_score} / {testResult?.max_score}
                    </span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Score</span>
                  </div>
                </div>
                <button 
                  onClick={downloadPDF}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] transform hover:-translate-y-1"
                  title="Download PDF Report"
                >
                  <Download size={24} />
                </button>
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Award className="text-blue-400" /> Questions You Got Wrong ({incorrectQuestions.length})
            </h2>

            {incorrectQuestions.length === 0 ? (
              <div className="glass p-12 rounded-3xl border border-emerald-500/30 text-center shadow-lg">
                <CheckCircle className="text-emerald-400 mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-bold text-white mb-2">Perfect Score!</h3>
                <p className="text-slate-400">You got every single question correct. Amazing job!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {incorrectQuestions.map((q: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="glass p-8 rounded-3xl border border-rose-500/30 shadow-lg"
                  >
                    <div className="flex gap-4">
                      <div className="mt-1">
                        <XCircle className="text-rose-400" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-6">{q.question}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Your Answer</span>
                            <p className="text-lg text-rose-200">{q.user_answer}</p>
                          </div>
                          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Correct Answer</span>
                            <p className="text-lg text-slate-200">{q.correct_answer}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
                          <span>Similarity Score: <strong className="text-rose-400">{q.score}% Match</strong></span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
