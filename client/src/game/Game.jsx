import { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../AuthContext';
import { loadJSON, saveJSON } from '../utils/localStore';
import { useToast } from '../components/Toast';
import PageTransition from '../components/PageTransition';
import {
  Brain, Trophy, Gamepad2, Zap, Clock, Star,
  CheckCircle, XCircle, RotateCcw, ChevronRight, Medal,
} from 'lucide-react';

/* ── Quiz Data ──────────────────────────────────────────────────── */
const QUIZ_QUESTIONS = [
  { q: 'How many bones are in the adult human body?', options: ['196', '206', '216', '226'], answer: 1 },
  { q: 'Which vitamin is produced when skin is exposed to sunlight?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], answer: 3 },
  { q: 'What is the normal resting heart rate for adults (beats per minute)?', options: ['40–50', '60–100', '100–120', '120–140'], answer: 1 },
  { q: 'Which organ produces insulin?', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], answer: 2 },
  { q: 'How much water should an average adult drink daily?', options: ['1–2 litres', '2–3 litres', '3–4 litres', '4–5 litres'], answer: 1 },
  { q: 'Which blood type is the universal donor?', options: ['A+', 'B+', 'AB+', 'O−'], answer: 3 },
  { q: 'What is the largest organ in the human body?', options: ['Liver', 'Lungs', 'Skin', 'Brain'], answer: 2 },
  { q: 'Normal blood pressure (systolic) in mmHg is:', options: ['Less than 80', 'Less than 120', 'Less than 140', 'Less than 160'], answer: 1 },
  { q: 'Which mineral is essential for strong bones and teeth?', options: ['Iron', 'Calcium', 'Potassium', 'Magnesium'], answer: 1 },
  { q: 'Sleep duration recommended for adults per night is:', options: ['4–5 hours', '5–6 hours', '7–9 hours', '10–12 hours'], answer: 2 },
  { q: 'Hemoglobin in blood is responsible for transporting:', options: ['Nutrients', 'Oxygen', 'Hormones', 'Waste'], answer: 1 },
  { q: 'Which food is highest in Omega-3 fatty acids?', options: ['Chicken', 'Salmon', 'Eggs', 'Almonds'], answer: 1 },
];

/* ── Memory Cards Data ──────────────────────────────────────────── */
const CARD_PAIRS = [
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'brain', emoji: '🧠', label: 'Brain' },
  { id: 'lungs', emoji: '🫁', label: 'Lungs' },
  { id: 'bone',  emoji: '🦴', label: 'Bone' },
  { id: 'eyes',  emoji: '👁️', label: 'Eyes' },
  { id: 'pill',  emoji: '💊', label: 'Medicine' },
  { id: 'steth', emoji: '🩺', label: 'Stethoscope' },
  { id: 'dna',   emoji: '🧬', label: 'DNA' },
];

function shuffle(arr) {
  return [...arr, ...arr]
    .map(v => ({ ...v, uid: `${v.id}-${Math.random()}`, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

/* ── Quiz Game ──────────────────────────────────────────────────── */
function QuizGame({ onComplete }) {
  const [questions] = useState(() => QUIZ_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 8));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (done || selected !== null) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [idx, selected, done]);

  const handleAnswer = useCallback((optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === questions[idx].answer;
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const finalScore = score + (correct ? 1 : 0);
        setDone(true);
        onComplete(finalScore, questions.length, 'quiz');
      } else {
        setIdx(i => i + 1);
        setSelected(null);
        setTimeLeft(20);
      }
    }, 1200);
  }, [selected, idx, questions, score, onComplete]);

  if (done) return null;

  const q = questions[idx];
  const progress = ((idx) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-sand-500 dark:text-sand-400">Q {idx + 1} / {questions.length}</span>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-sand-400'}`} />
          <span className={`font-bold text-lg w-8 text-center ${timeLeft <= 5 ? 'text-red-500' : 'text-sand-700 dark:text-sand-300'}`}>{timeLeft}</span>
        </div>
      </div>
      <div className="h-2 bg-sand-200 dark:bg-brand-800 rounded-full mb-6 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-gold-500 to-brand-600 rounded-full" animate={{ width: `${progress}%` }} />
      </div>

      <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white dark:bg-brand-900 rounded-3xl border border-sand-100 dark:border-brand-800 p-8 mb-6">
        <p className="text-lg font-bold text-sand-900 dark:text-white leading-snug mb-8">{q.q}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            let style = 'bg-sand-50 dark:bg-brand-800 border-sand-200 dark:border-brand-700 text-sand-700 dark:text-sand-300 hover:border-gold-400';
            if (selected !== null) {
              if (i === q.answer) style = 'bg-green-50 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-300';
              else if (i === selected) style = 'bg-red-50 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-300';
              else style = 'bg-sand-50 dark:bg-brand-800 border-sand-200 dark:border-brand-700 text-sand-400 opacity-60';
            }
            return (
              <motion.button key={i} whileHover={selected === null ? { scale: 1.02 } : {}} whileTap={selected === null ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(i)} disabled={selected !== null}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left font-medium text-sm transition-all ${style}`}>
                <span className="w-7 h-7 rounded-full bg-white dark:bg-brand-700 flex items-center justify-center shrink-0 text-xs font-bold border border-sand-200 dark:border-brand-600">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <div className="flex items-center justify-between bg-white dark:bg-brand-900 rounded-2xl border border-sand-100 dark:border-brand-800 px-6 py-3">
        <span className="text-sm text-sand-500 dark:text-sand-400">Score</span>
        <div className="flex items-center gap-1">
          {[...Array(questions.length)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < idx ? 'bg-gold-500' : 'bg-sand-200 dark:bg-brand-700'}`} />
          ))}
        </div>
        <span className="font-bold text-sand-900 dark:text-white">{score} pts</span>
      </div>
    </div>
  );
}

/* ── Memory Game ────────────────────────────────────────────────── */
function MemoryGame({ onComplete }) {
  const [cards, setCards] = useState(() => shuffle(CARD_PAIRS));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  const matchedCount = cards.filter(c => c.matched).length;

  const flip = (uid) => {
    if (flipped.length === 2) return;
    const card = cards.find(c => c.uid === uid);
    if (!card || card.flipped || card.matched) return;

    const newFlipped = [...flipped, uid];
    setCards(prev => prev.map(c => c.uid === uid ? { ...c, flipped: true } : c));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(u => cards.find(c => c.uid === u));
      if (a.id === b.id) {
        setCards(prev => prev.map(c => newFlipped.includes(c.uid) ? { ...c, matched: true } : c));
        setFlipped([]);
        if (matchedCount + 2 === cards.length) {
          setDone(true);
          const score = Math.max(1, 16 - moves);
          onComplete(score, 16, 'memory');
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.uid) ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 900);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-sand-500 dark:text-sand-400">Pairs found: <span className="font-bold text-sand-900 dark:text-white">{matchedCount / 2} / {CARD_PAIRS.length}</span></p>
        <p className="text-sm text-sand-500 dark:text-sand-400">Moves: <span className="font-bold text-sand-900 dark:text-white">{moves}</span></p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <motion.div key={card.uid} whileHover={{ scale: card.flipped || card.matched ? 1 : 1.06 }}
            whileTap={{ scale: card.flipped || card.matched ? 1 : 0.94 }}
            onClick={() => flip(card.uid)}
            className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer text-3xl transition-all select-none ${
              card.matched
                ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-400'
                : card.flipped
                ? 'bg-gold-50 dark:bg-gold-900/20 border-2 border-gold-400'
                : 'bg-white dark:bg-brand-900 border-2 border-sand-100 dark:border-brand-800 hover:border-gold-300'
            }`}>
            <motion.span animate={{ rotateY: card.flipped || card.matched ? 0 : 180 }}>
              {card.flipped || card.matched ? card.emoji : '❓'}
            </motion.span>
          </motion.div>
        ))}
      </div>
      {done && (
        <p className="text-center mt-5 text-green-600 dark:text-green-400 font-bold text-lg animate-bounce">
          🎉 Completed in {moves} moves!
        </p>
      )}
    </div>
  );
}

/* ── Score Result Screen ────────────────────────────────────────── */
function ResultScreen({ score, total, gameType, onReplay, onBack }) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '⭐ Good job!' : pct >= 40 ? '📚 Keep learning!' : '💪 Try again!';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white dark:bg-brand-900 rounded-3xl border border-sand-100 dark:border-brand-800 p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-500 to-brand-700 flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl font-black text-white">{score}</span>
      </div>
      <h2 className="text-2xl font-black text-sand-900 dark:text-white mb-1">{grade}</h2>
      <p className="text-sand-500 dark:text-sand-400 mb-6">
        You scored <span className="font-bold text-sand-900 dark:text-white">{score}/{total}</span> ({pct}%)
      </p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onReplay}
          className="flex-1 bg-gold-600 hover:bg-gold-700 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors">
          <RotateCcw className="w-4 h-4" /> Play Again
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          className="flex-1 bg-sand-100 dark:bg-brand-800 text-sand-700 dark:text-sand-200 font-semibold py-3 rounded-2xl transition-colors">
          Back
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Leaderboard ────────────────────────────────────────────────── */
function Leaderboard() {
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const list = loadJSON('jc_game_scores', []);
      list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      setScores(list.slice(0, 10));
    } catch {
      toast.error('Could not load leaderboard');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-sand-200 dark:bg-brand-800 animate-pulse" />)}</div>;

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="font-bold text-sand-900 dark:text-white mb-5 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" /> Top Scores
      </h2>
      {scores.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-brand-900 rounded-2xl border border-sand-100 dark:border-brand-800">
          <Trophy className="w-12 h-12 text-sand-200 dark:text-brand-700 mx-auto mb-3" />
          <p className="text-sand-400 font-medium">No scores yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((s, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isMe = s.userId === currentUser?.uid;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 bg-white dark:bg-brand-900 rounded-2xl border px-5 py-4 ${
                  isMe ? 'border-gold-400 bg-gold-50 dark:bg-gold-900/20' : 'border-sand-100 dark:border-brand-800'
                }`}>
                <span className="text-xl w-8 text-center">{medals[i] ?? `#${i + 1}`}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isMe ? 'text-gold-700 dark:text-gold-300' : 'text-sand-900 dark:text-white'}`}>
                    {s.playerName || 'Anonymous'} {isMe && '(You)'}
                  </p>
                  <p className="text-xs text-sand-400 capitalize">{s.gameType || 'quiz'}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-sand-900 dark:text-white">{s.score}</p>
                  <p className="text-xs text-sand-400">{s.pct}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Game Selection ─────────────────────────────────────────────── */
function GameMenu({ onSelect }) {
  const games = [
    { id: 'quiz', icon: Brain, title: 'Health Quiz', desc: '8 questions · 20s each · Test your medical knowledge', color: 'from-gold-500 to-brand-700', light: 'bg-gold-100 dark:bg-gold-900/30' },
    { id: 'memory', icon: Zap, title: 'Memory Match', desc: 'Match health-themed emoji pairs · Train your brain', color: 'from-emerald-500 to-teal-600', light: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-5">
        {games.map(g => (
          <motion.button key={g.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => onSelect(g.id)}
            className="bg-white dark:bg-brand-900 rounded-3xl border border-sand-100 dark:border-brand-800 p-7 text-left hover:shadow-xl transition-shadow group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-5`}>
              <g.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-lg text-sand-900 dark:text-white mb-2">{g.title}</h3>
            <p className="text-sm text-sand-500 dark:text-sand-400 mb-5">{g.desc}</p>
            <div className="flex items-center text-sm font-semibold text-gold-600 dark:text-gold-400 group-hover:gap-2 transition-all gap-1">
              Play Now <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: Brain, label: 'Health Quiz', value: '12', sub: 'questions' },
          { icon: Star, label: 'Memory Cards', value: '8', sub: 'pairs' },
          { icon: Trophy, label: 'Leaderboard', value: 'Top 10', sub: 'players' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-brand-900 rounded-2xl border border-sand-100 dark:border-brand-800 p-4">
            <s.icon className="w-5 h-5 text-gold-500 mx-auto mb-2" />
            <p className="font-black text-sand-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-sand-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Game() {
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();
  const [view, setView] = useState('menu'); // 'menu' | 'quiz' | 'memory' | 'result' | 'leaderboard'
  const [lastResult, setLastResult] = useState(null);

  const handleComplete = useCallback(async (score, total, gameType) => {
    const pct = Math.round((score / total) * 100);
    setLastResult({ score, total, gameType, pct });
    setView('result');

    if (currentUser) {
      try {
        const list = loadJSON('jc_game_scores', []);
        list.push({
          id: `${Date.now()}`,
          userId: currentUser.id,
          playerName: currentUser.name || 'Player',
          score, total, pct, gameType,
          playedAt: new Date().toISOString(),
        });
        saveJSON('jc_game_scores', list);
        toast.success('Score saved!', `You scored ${score}/${total}`);
      } catch {
        // score save failed silently — not a critical error
      }
    }
  }, [currentUser, toast]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-sand-50 dark:bg-brand-950 pt-16 pb-24 md:pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-600 to-brand-700 text-white py-8 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Gamepad2 className="w-6 h-6" /> Health Games
              </h1>
              <p className="text-gold-100 text-sm mt-1">Learn while you play · Fun health quizzes & puzzles</p>
            </div>
            <div className="flex gap-2">
              {['menu', 'leaderboard'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                    view === v ? 'bg-white text-gold-700' : 'text-white hover:bg-white/10'
                  }`}>
                  {v === 'leaderboard' ? '🏆 Scores' : '🎮 Games'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {view === 'menu' && (
              <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GameMenu onSelect={v => setView(v)} />
              </motion.div>
            )}
            {view === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-sand-900 dark:text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-gold-600" /> Health Quiz
                  </h2>
                  <button onClick={() => setView('menu')} className="text-sm text-sand-400 hover:text-sand-600 dark:hover:text-sand-200 transition-colors">← Back</button>
                </div>
                <QuizGame onComplete={handleComplete} />
              </motion.div>
            )}
            {view === 'memory' && (
              <motion.div key="memory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-sand-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600" /> Memory Match
                  </h2>
                  <button onClick={() => setView('menu')} className="text-sm text-sand-400 hover:text-sand-600 dark:hover:text-sand-200 transition-colors">← Back</button>
                </div>
                <MemoryGame onComplete={handleComplete} />
              </motion.div>
            )}
            {view === 'result' && lastResult && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResultScreen
                  {...lastResult}
                  onReplay={() => setView(lastResult.gameType)}
                  onBack={() => setView('menu')}
                />
              </motion.div>
            )}
            {view === 'leaderboard' && (
              <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Leaderboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
