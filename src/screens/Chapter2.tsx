import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { ScreenProps } from '../store/useAppState';
import { restaurants, fixedRestaurant } from '../content/restaurants';
import BackButton from '../components/BackButton';

// ─── Constants ───────────────────────────────────────────────────────────────
const CAPSULE_COLORS = [
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#818cf8',
  '#f472b6',
  '#a3e635',
];

const CONFETTI_COLORS = ['#38bdf8', '#fbbf24', '#f472b6', '#34d399'];

// ─── Fisher-Yates shuffle ────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fireConfetti() {
  confetti({
    particleCount: 140,
    spread: 90,
    origin: { y: 0.5 },
    colors: CONFETTI_COLORS,
  });
}

// ─── Ch2Intro ────────────────────────────────────────────────────────────────
function Ch2Intro({ onStart, goBack }: { onStart: () => void; goBack: () => void }) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)' }}
    >
      <BackButton onClick={goBack} className="absolute top-5 left-5 z-20" />
      <motion.div
        className="w-full max-w-xs"
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160 }}
      >
        <div
          className="rounded-t-3xl p-6 pb-5 text-center"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
        >
          <p className="font-noto text-white/70 text-sm tracking-widest mb-1">CHAPTER 2</p>
          <p className="font-jua text-2xl text-white mb-1">오늘 저녁 뭐 먹지?</p>
          <p className="font-noto text-white/80 text-sm">캡슐 뽑기 🎰</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-b-3xl p-6 shadow-xl border border-white/80 border-t-0">
          <p className="font-noto text-slate-600 text-sm leading-relaxed mb-5">
            오늘 저녁 메뉴는 <span className="text-sky-500 font-bold">캡슐 뽑기</span>로 결정해요.<br /><br />
            8개의 캡슐 중 하나를 골라보세요. 어떤 음식이 나올지는 뜯어봐야 알아요! 🍽️
          </p>
          <motion.button
            onClick={onStart}
            whileTap={{ scale: 0.95 }}
            className="w-full font-jua text-xl text-white py-4 rounded-2xl shadow-md"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
          >
            캡슐 뽑으러 가기 →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Chapter2 ────────────────────────────────────────────────────────────────
export default function Chapter2({ state, update, advance, goBack }: ScreenProps) {
  const { capsuleAssignment, pickedIndex, restaurantId } = state.ch2;

  const [showIntro, setShowIntro] = useState(pickedIndex === null);

  // animating: true while the pop animation is running (before result shown)
  const [animating, setAnimating] = useState(false);
  // localPicked: the index being animated (set before state is persisted)
  const [localPicked, setLocalPicked] = useState<number | null>(pickedIndex);

  // ── On first mount: shuffle restaurant IDs into capsule slots
  useEffect(() => {
    if (capsuleAssignment.length === 0) {
      const ids = shuffle(restaurants.map((r) => r.id));
      update({ ch2: { ...state.ch2, capsuleAssignment: ids } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 어떤 캡슐을 뽑아도 항상 고정 결과를 보여준다
  const resultRestaurant = restaurantId ? fixedRestaurant : null;

  // Phase: 'picking' | 'animating' | 'result'
  const phase =
    pickedIndex !== null ? 'result' : animating ? 'animating' : 'picking';

  function handleCapsulePick(idx: number) {
    if (phase !== 'picking' || capsuleAssignment.length === 0) return;
    const assignment = state.ch2.capsuleAssignment; // capture now, before async boundary
    const rid = assignment[idx];
    if (!rid) return;

    setLocalPicked(idx);
    setAnimating(true);

    // After animation completes (~1.2s), persist and show result
    setTimeout(() => {
      setAnimating(false);
      fireConfetti();
      // 어느 캡슐을 골라도 항상 고정 결과(fixedRestaurant)로 저장
      update({ ch2: { capsuleAssignment: assignment, pickedIndex: idx, restaurantId: fixedRestaurant.id } });
    }, 1200);
  }

  // ── Capsule grid (Phase 1 & during animation) ────────────────────────────
  const assignment = capsuleAssignment.length > 0 ? capsuleAssignment : Array(8).fill('');

  if (showIntro) {
    return <Ch2Intro onStart={() => setShowIntro(false)} goBack={goBack} />;
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-start p-4 pt-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)' }}
    >
      {/* Back button — shown in picking and result phases, not during animation */}
      {phase !== 'animating' && (
        <BackButton onClick={goBack} className="absolute top-5 left-5 z-20" />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={`w-full max-w-sm text-center ${phase === 'result' ? 'mb-3' : 'mb-6'}`}>
        <p className="font-noto text-sky-500 text-sm font-bold text-center mb-1">CHAPTER 2 · 오늘 저녁 뭐 먹지?</p>
        <h2 className="font-jua text-2xl text-slate-700">캡슐 뽑기 🎰</h2>
        <p className="font-noto text-slate-500 text-sm mt-1">
          {phase === 'picking' && '8개의 캡슐 중 하나를 골라 오늘 저녁 메뉴를 결정해요'}
          {phase === 'animating' && '두근두근...!'}
          {phase === 'result' && '오늘 저녁 메뉴가 결정됐어요 🍽️'}
        </p>
      </div>

      {/* ── Machine body ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase !== 'result' ? (
          <motion.div
            key="capsule-grid"
            className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/80 p-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 160 }}
          >
            {/* Machine glass top */}
            <div
              className="rounded-2xl mb-5 p-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', minHeight: 32 }}
            >
              <p className="font-noto text-sky-500 text-sm">
                {phase === 'picking' ? '🎰 하나를 골라요!' : '🎊 열리는 중...'}
              </p>
            </div>

            {/* 4×2 capsule grid */}
            <div className="grid grid-cols-4 gap-3 justify-items-center">
              {assignment.map((_, idx) => {
                const isLocalPicked = localPicked === idx;
                const color = CAPSULE_COLORS[idx];

                if (isLocalPicked && animating) {
                  // Animating capsule: scale up → shake → fade
                  return (
                    <motion.div
                      key={idx}
                      style={{
                        width: 64,
                        height: 76,
                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        background: `radial-gradient(circle at 35% 35%, #ffffff55, transparent 60%), ${color}`,
                        boxShadow: `0 4px 16px ${color}88`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'default',
                      }}
                      initial={{ scale: 1, rotate: 0 }}
                      animate={{
                        scale: [1, 1.3, 1.3, 1.3, 1.3, 1.3, 1],
                        rotate: [0, 0, 15, -15, 15, -15, 0],
                      }}
                      transition={{
                        duration: 1.1,
                        times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1.0],
                        ease: 'easeInOut',
                      }}
                    >
                      <span className="font-jua text-white text-lg drop-shadow">{idx + 1}</span>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={idx}
                    onClick={() => handleCapsulePick(idx)}
                    style={{
                      width: 64,
                      height: 76,
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                      background: `radial-gradient(circle at 35% 35%, #ffffff55, transparent 60%), ${color}`,
                      boxShadow: `0 4px 12px ${color}66`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: phase === 'picking' ? 'pointer' : 'default',
                      opacity: phase === 'animating' && !isLocalPicked ? 0.45 : 1,
                    }}
                    whileHover={phase === 'picking' ? { scale: 1.08, y: -4 } : {}}
                    whileTap={phase === 'picking' ? { scale: 0.95 } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <span className="font-jua text-white text-lg drop-shadow">{idx + 1}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* ── Phase 3: Result card ──────────────────────────────────────── */
          <motion.div
            key="result-card"
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 32, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, delay: 0.1 }}
          >
            {/* Main result */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/80 overflow-hidden">
              {/* 음식점 이미지 3장 */}
              {resultRestaurant?.imageUrls && resultRestaurant.imageUrls.length > 0 && (
                <div className="flex w-full overflow-hidden" style={{ height: 110 }}>
                  {resultRestaurant.imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${resultRestaurant.name} ${i + 1}`}
                      style={{ flex: 1, minWidth: 0, objectFit: 'cover', borderRight: i < 2 ? '2px solid rgba(255,255,255,0.6)' : 'none' }}
                    />
                  ))}
                </div>
              )}

              {/* 메뉴명 */}
              <div
                className="px-4 pt-3 pb-2"
                style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}
              >
                <p className="font-noto text-sky-400 text-xs tracking-widest mb-0.5">
                  🍽️ 오늘 저녁은...
                </p>
                <p className="font-jua text-2xl text-slate-700">
                  {resultRestaurant
                    ? `${resultRestaurant.emoji} ${resultRestaurant.menu}`
                    : '???'}
                </p>
              </div>

              <div className="px-4 py-3 flex flex-col gap-2">
                {/* 식당명 + 위치 + 지도 링크 */}
                {resultRestaurant?.name ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-jua text-lg text-slate-700">{resultRestaurant.name}</span>
                      {resultRestaurant.intro && (
                        <span className="font-noto text-slate-400 text-xs">📍 {resultRestaurant.intro}</span>
                      )}
                    </div>
                    {resultRestaurant.mapUrl && (
                      <a
                        href={resultRestaurant.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-noto text-sky-500 text-xs underline underline-offset-2 shrink-0"
                      >
                        지도 →
                      </a>
                    )}
                  </div>
                ) : null}

                {/* 추천 메뉴 */}
                {resultRestaurant?.recommended && resultRestaurant.recommended.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-noto text-slate-400 text-xs">추천</span>
                    {resultRestaurant.recommended.map((item) => (
                      <span
                        key={item}
                        className="font-noto text-xs text-sky-600"
                        style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 6, padding: '2px 7px' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => advance('ch3')}
                  className="w-full font-jua text-lg text-white py-3 rounded-2xl shadow-md active:scale-95 transition-transform mt-1"
                  style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
                >
                  다음 퀘스트로 →
                </button>
              </div>
            </div>

            <p className="font-noto text-slate-400 text-xs text-center mt-2">
              식사 후 다음 퀘스트가 기다리고 있어요 👀
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
