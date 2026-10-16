import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { ScreenProps } from '../store/useAppState';
import BackButton from '../components/BackButton';

// 배경 파티클 — 렌더마다 재생성 방지
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: `${(i * 7.3) % 100}%`,
  size: 14 + (i % 3) * 8,
  delay: i * 0.45,
  duration: 7 + (i % 5),
  emoji: ['🎈', '✨', '🎉', '⭐', '🎀', '💫', '🎊', '🌟'][i % 8],
}));

const RULES = [
  { num: 1, text: '뭘 먹고 뭘 할지는 전부 뽑기로 정해요.' },
  { num: 2, text: '결과가 나올 때까지는 뭐가 걸려 있는지 비밀이에요.' },
  { num: 3, text: '나온 건 무조건 해야 해요. (대신 나쁜 건 없어요 😊)' },
];

function fireConfetti() {
  confetti({
    particleCount: 140,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#38bdf8', '#7dd3fc', '#fbbf24', '#f472b6', '#a78bfa', '#34d399'],
  });
}

type Step = 0 | 2;

export default function Opening({ state, advance, resetState }: ScreenProps) {
  const [step, setStep] = useState<Step>(0);
  const [started, setStarted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // 이전 기록이 있으면 다시 시작 버튼 표시
  const hasPriorProgress =
    state.history.length > 0 ||
    state.ch1.startLane !== null ||
    state.ch2.pickedIndex !== null ||
    state.ch3.slotId !== null ||
    state.bonus.pickedCardIds.length > 0;

  const handleEnter = () => {
    fireConfetti();
    setTimeout(() => setStep(2), 500);
  };

  const handleStart = () => {
    if (started) return;
    setStarted(true);
    fireConfetti();
    setTimeout(fireConfetti, 350);
    setTimeout(() => advance('ch1'), 900);
  };

  return (
    <div
      className="h-full relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)' }}
    >
      {/* 떠다니는 이모지 파티클 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute select-none"
            style={{ left: p.x, bottom: '-8%', fontSize: p.size }}
            animate={{
              y: [0, -900],
              x: [0, 12, -8, 16, 0],
              opacity: [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 0: 타이틀 ── */}
        {step === 0 && (
          <motion.div
            key="step0"
            className="h-full flex flex-col items-center justify-center px-6 pt-4 pb-8 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
            transition={{ duration: 0.4 }}
          >
            {/* 날짜 뱃지 */}
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-white/60 backdrop-blur-sm border border-sky-200 rounded-full px-4 py-1.5 text-sky-500 text-sm font-noto mb-4"
            >
              🎂 2026.10.17 토요일
            </motion.div>

            {/* 타이틀 */}
            <motion.h1
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
              className="font-jua text-5xl text-sky-500 text-center leading-tight"
              style={{ textShadow: '0 2px 20px rgba(56,189,248,0.25)' }}
            >
              Happy
            </motion.h1>
            <motion.h1
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.42, type: 'spring', stiffness: 180 }}
              className="font-jua text-5xl text-sky-400 text-center leading-tight mb-5"
            >
              Mini Day 🎉
            </motion.h1>

            {/* 호스트 배지 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
              className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/70 rounded-full px-4 py-2 mb-3"
            >
              <span className="text-base">🎩</span>
              <p className="font-noto text-xs text-slate-400">오늘의 호스트</p>
              <p className="font-jua text-sm text-slate-600">지누</p>
            </motion.div>

            {/* 초대 카드 */}
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.58 }}
              className="w-full max-w-xs mb-4"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.75), rgba(240,249,255,0.85))',
                backdropFilter: 'blur(12px)',
                borderRadius: 28,
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 8px 32px rgba(56,189,248,0.15), 0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* 상단 장식 띠 */}
              <div style={{ background: 'linear-gradient(135deg, #38bdf8, #7dd3fc, #a5f3fc)', padding: '10px 0', textAlign: 'center', letterSpacing: 6, fontSize: 16, borderRadius: '26px 26px 0 0' }}>
                ✦ ✦ ✦ ✦ ✦
              </div>

              {/* 본문 */}
              <div style={{ padding: '16px 24px 16px' }}>
                <p className="font-jua text-left text-sky-400 mb-1" style={{ fontSize: 15 }}>To. 미니 💌</p>
                <p className="font-noto text-sky-300 text-xs text-center tracking-widest mb-2">INVITATION</p>

                <p className="font-jua text-center text-slate-700 leading-relaxed mb-1" style={{ fontSize: 17 }}>
                  생일 축하해 미니야 🎂
                </p>
                <p className="font-jua text-center leading-snug mb-2" style={{ fontSize: 22, background: 'linear-gradient(135deg, #0ea5e9, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  오늘은 지누가 준비한<br />하루짜리 코스요리 🍽️
                </p>

                <p className="font-noto text-right text-xs text-sky-400 mt-3">from. 지누 🩵</p>
              </div>

            </motion.div>

            {/* 입장 버튼 */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.72 }}
              whileTap={{ scale: 0.93 }}
              onClick={handleEnter}
              className="relative font-jua text-xl text-white px-11 py-4 rounded-2xl shadow-xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
            >
              🎪 입장하기
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ opacity: [0, 0.35, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.button>

            {/* 다시 시작 버튼 — 이전 기록이 있을 때만 표시 */}
            {hasPriorProgress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="mt-5 flex flex-col items-center gap-2"
              >
                {!confirmReset ? (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="font-noto text-sm text-slate-400 underline underline-offset-2"
                  >
                    ↺ 처음부터 다시 시작
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-noto text-sm text-slate-500">진행 기록이 모두 사라져요. 진짜요?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { resetState(); setConfirmReset(false); }}
                        className="font-jua text-sm text-white px-5 py-2 rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #f87171, #ef4444)' }}
                      >
                        네, 다시 시작
                      </button>
                      <button
                        onClick={() => setConfirmReset(false)}
                        className="font-jua text-sm text-slate-500 px-5 py-2 rounded-xl bg-white/60 border border-slate-200"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: 규칙 ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            className="h-full flex flex-col items-center justify-center p-6 relative z-10"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35 }}
          >
            <BackButton onClick={() => setStep(0)} className="absolute top-5 left-5 z-20" />
            <motion.div
              className="w-full max-w-xs bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/80"
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 }}
            >
              {/* 헤더 */}
              <div className="p-6 pb-5" style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}>
                <p className="font-noto text-sky-400 text-xs tracking-widest mb-1">TODAY'S RULES</p>
                <h2 className="font-jua text-2xl text-slate-700">오늘의 규칙 📋</h2>
              </div>

              <div className="p-6">
                {RULES.map((rule, i) => (
                  <motion.div
                    key={rule.num}
                    initial={{ x: 18, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.18 + i * 0.14 }}
                    className="flex gap-3 mb-4 last:mb-0"
                  >
                    <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-500 font-jua text-sm flex-shrink-0 flex items-center justify-center">
                      {rule.num}
                    </div>
                    <p className="font-noto text-slate-600 text-sm leading-relaxed pt-0.5">
                      {rule.text}
                    </p>
                  </motion.div>
                ))}

                <motion.button
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={handleStart}
                  className="mt-6 w-full font-jua text-xl text-white py-4 rounded-2xl shadow-lg relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
                >
                  🎉 파티 시작!
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
