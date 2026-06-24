"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Mic, Loader2, Send, CheckCircle, XCircle, LogOut, Info } from "lucide-react";

export default function TestPage() {
  const { setId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [fset, setFset] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchSet();
    return () => {
      // Cleanup recognition session on unmount
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const fetchSet = async () => {
    try {
      const res = await api.get(`/flashcards/sets/${setId}`);
      const fetchedCards = res.data.flashcards;
      
      const limitParam = searchParams.get('limit');
      let finalCards = [...fetchedCards];
      
      if (limitParam && limitParam !== 'all') {
        const limitNum = parseInt(limitParam);
        finalCards = finalCards.sort(() => 0.5 - Math.random()).slice(0, limitNum);
      }
      
      setFset(res.data);
      setCards(finalCards);
    } catch (err) {
      alert("Failed to load set");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Browser Native Web Speech API STT
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input (Web Speech API) is not supported in this browser. Please use a modern browser like Google Chrome.");
      return;
    }

    if (recording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAnswer(transcript);
      };

      recognition.onerror = (err: any) => {
        const errCode = err.error || "unknown";
        console.error("Speech Recognition Error:", errCode);
        
        if (errCode === "not-allowed") {
          alert("Microphone permission denied. Please allow microphone access in your browser settings.");
        } else if (errCode === "network") {
          alert("Network error. Web Speech API requires an active internet connection to transcribe.");
        } else if (errCode === "audio-capture") {
          alert("No microphone found. Please ensure a microphone is connected.");
        } else if (errCode !== "no-speech" && errCode !== "aborted") {
          alert(`Speech recognition error: ${errCode}`);
        }
        setRecording(false);
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to initialize speech recognition:", e);
      setRecording(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setGrading(true);
    try {
      const currentCard = cards[currentIndex];
      const res = await api.post("/flashcards/grade", {
        correct_answer: currentCard.answer,
        user_answer: answer
      });
      
      setFeedback({
        ...res.data,
        correct_answer: currentCard.answer,
        user_answer: answer,
        question: currentCard.question
      });
    } catch (err) {
      alert("Failed to grade answer.");
    } finally {
      setGrading(false);
    }
  };

  const nextQuestion = async () => {
    const newResults = [...results, feedback];
    setResults(newResults);
    setAnswer("");
    setFeedback(null);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setLoading(true);
      const totalScore = newResults.filter(r => r.is_correct).length;
      try {
        await api.post("/flashcards/results", {
          set_id: setId,
          total_score: totalScore,
          max_score: cards.length,
          wrong_answers: newResults.map(r => ({
            question: r.question,
            user_answer: r.user_answer,
            correct_answer: r.correct_answer,
            score: r.score,
            is_correct: r.is_correct
          }))
        });
        router.push(`/results/${setId}`);
      } catch (err) {
        alert("Failed to save results");
        setLoading(false);
      }
    }
  };

  const handleExit = () => {
    router.push("/dashboard");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" size={48} /></div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden font-sans flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

      <header className="max-w-4xl mx-auto w-full flex justify-between items-center mb-10 relative z-10 glass p-4 rounded-2xl shadow-lg border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{fset.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex) / cards.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-slate-400 text-sm font-semibold tracking-wider">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowExitConfirm(true)}
          className="text-slate-300 hover:text-red-400 flex items-center gap-2 transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-xl font-medium"
        >
          <LogOut size={18} /> Exit Test
        </button>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col items-center justify-center relative z-10 perspective-[1000px]">
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div 
              key={`q-${currentIndex}`}
              initial={{ rotateX: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotateX: 0, opacity: 1, scale: 1 }}
              exit={{ rotateX: -90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
              className="w-full glass rounded-3xl p-10 md:p-16 border border-slate-600/50 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center min-h-[400px] relative bg-gradient-to-b from-slate-800/80 to-slate-900/80"
            >
              <div className="absolute top-4 left-4 text-slate-500">
                <Info size={20} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-center leading-tight tracking-wide text-slate-100">
                {currentCard.question}
              </h2>
            </motion.div>
          ) : (
            <motion.div 
              key={`a-${currentIndex}`}
              initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className={`w-full glass rounded-3xl p-10 md:p-16 border-2 flex flex-col items-center justify-center min-h-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
                feedback.is_correct ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-rose-500/50 bg-rose-950/20'
              }`}
            >
              {feedback.is_correct ? (
                <CheckCircle className="text-emerald-400 mb-6" size={64} />
              ) : (
                <XCircle className="text-rose-400 mb-6" size={64} />
              )}
              <h3 className="text-2xl font-bold mb-8 text-center text-slate-100">{feedback.is_correct ? 'Excellent!' : 'Needs Improvement'}</h3>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700">
                  <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider block mb-2">Your Answer</span>
                  <p className="text-lg text-white">{feedback.user_answer}</p>
                </div>
                <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700">
                  <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider block mb-2">Correct Answer</span>
                  <p className="text-lg text-white">{feedback.correct_answer}</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  feedback.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  Match Score: {feedback.score}% Match
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full mt-8">
          {!feedback ? (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer or use voice..."
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-4 pl-6 pr-16 text-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner"
                  onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                  disabled={grading}
                />
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  disabled={grading}
                  className={`absolute right-3 top-3 p-2 rounded-xl transition-all ${
                    recording ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={recording ? "Click to stop recording" : "Click to speak answer"}
                >
                  <Mic size={20} />
                </button>
              </div>
              <button
                onClick={submitAnswer}
                disabled={!answer.trim() || grading || recording}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-1"
              >
                {grading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              </button>
            </div>
          ) : (
            <button
              onClick={nextQuestion}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] text-lg tracking-wide hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-1"
            >
              {currentIndex + 1 < cards.length ? 'Next Question' : 'View Results'}
            </button>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl relative text-center"
            >
              <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Exit Test?</h2>
              <p className="text-slate-400 mb-8">Your progress for this session will be lost. Are you sure you want to leave?</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleExit}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors font-bold shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                >
                  Yes, Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
