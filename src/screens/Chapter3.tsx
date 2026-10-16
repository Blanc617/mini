import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScreenProps } from '../store/useAppState';
import { rouletteSlots } from '../content/roulette';
import BackButton from '../components/BackButton';

// ─── SVG pie slice helper ─────────────────────────────────────────────────────
const CX = 150;
const CY = 150;
const R = 130;
const SLICE_DEG = 72;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function slicePath(i: number): string {
  const startDeg = i * SLICE_DEG;
  const endDeg = (i + 1) * SLICE_DEG;
  const x1 = CX + R * Math.cos(toRad(startDeg));
  const y1 = CY + R * Math.sin(toRad(startDeg));
  const x2 = CX + R * Math.cos(toRad(endDeg));
  const y2 = CY + R * Math.sin(toRad(endDeg));
  // large-arc-flag = 0 (5 slices, 72° each — never > 180°)
  return `M ${CX},${CY} L ${x1},${y1} A ${R},${R} 0 0 1 ${x2},${y2} Z`;
}

function sliceLabelPos(i: number): { x: number; y: number } {
  const midDeg = i * SLICE_DEG + SLICE_DEG / 2;
  const labelR = R * 0.62;
  return {
    x: CX + labelR * Math.cos(toRad(midDeg)),
    y: CY + labelR * Math.sin(toRad(midDeg)),
  };
}

// Landing offset: slot i center is at (i*72+36)° in SVG coords (0° = 3 o'clock).
// Pointer is at 270° (12 o'clock). We need: slotCenter + rotation ≡ 270 (mod 360)
// rotation = (270 - slotCenter + 360) % 360
function landingOffset(slotIndex: number): number {
  return ((270 - (slotIndex * SLICE_DEG + SLICE_DEG / 2)) % 360 + 360) % 360;
}

// ─── Ch3Intro ────────────────────────────────────────────────────────────────
function Ch3Intro({ onStart, goBack }: { onStart: () => void; goBack: () => void }) {
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
          <p className="font-noto text-white/70 text-sm tracking-widest mb-1">CHAPTER 3</p>
          <p className="font-jua text-2xl text-white mb-1">오늘의 미션</p>
          <p className="font-noto text-white/80 text-sm">룰렛 돌리기 🎡</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-b-3xl p-6 shadow-xl border border-white/80 border-t-0">
          <p className="font-noto text-slate-600 text-sm leading-relaxed mb-5">
            룰렛을 돌려서 <span className="text-sky-500 font-bold">오늘의 미션</span>을 뽑아요.<br /><br />
            어떤 미션이 나올지는 아무도 몰라요. 둘이 함께 도전해봐요! 🎯
          </p>
          <motion.button
            onClick={onStart}
            whileTap={{ scale: 0.95 }}
            className="w-full font-jua text-xl text-white py-4 rounded-2xl shadow-md"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
          >
            룰렛 돌리러 가기 →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Chapter3 ─────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'spinning' | 'revealed';

export default function Chapter3({ state, update, advance, goBack }: ScreenProps) {
  const { slotId, winner } = state.ch3;

  const [showIntro, setShowIntro] = useState(slotId === null);

  // Restore phase on refresh
  const getInitialPhase = (): Phase => {
    if (slotId !== null) return 'revealed';
    return 'idle';
  };

  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const restoredIdx = slotId
    ? rouletteSlots.findIndex((s) => s.id === slotId)
    : -1;
  const [rotation, setRotation] = useState<number>(
    restoredIdx >= 0 ? landingOffset(restoredIdx) : 0
  );
  const [winSlotIndex, setWinSlotIndex] = useState<number | null>(
    restoredIdx >= 0 ? restoredIdx : null
  );
  const [localWinner, setLocalWinner] = useState<'jinu' | 'mini' | null>(winner);

  const slot = winSlotIndex !== null ? rouletteSlots[winSlotIndex] : null;

  function handleSpin() {
    if (phase !== 'idle') return;

    // 항상 소품샵으로 고정
    const winIdx = rouletteSlots.findIndex((s) => s.id === 'props');
    setWinSlotIndex(winIdx);
    setPhase('spinning');
    setRotation(prev => {
      const currentAngle = ((prev % 360) + 360) % 360;
      const target = landingOffset(winIdx);
      let delta = (target - currentAngle + 360) % 360;
      if (delta < 90) delta += 360; // ensure visible spin
      return prev + 4 * 360 + delta;
    });
  }

  function handleReveal() {
    if (winSlotIndex === null) return;
    const winSlot = rouletteSlots[winSlotIndex];
    update({ ch3: { slotId: winSlot.id, winner: null } });
    setPhase('revealed');
  }

  function handleAdvance() {
    advance('bonus');
  }

  function handleWinnerSelect(w: 'jinu' | 'mini') {
    setLocalWinner(w);
    if (winSlotIndex !== null) {
      update({ ch3: { slotId: rouletteSlots[winSlotIndex].id, winner: w } });
    } else if (state.ch3.slotId !== null) {
      update({ ch3: { slotId: state.ch3.slotId, winner: w } });
    }
  }

  if (showIntro) {
    return <Ch3Intro onStart={() => setShowIntro(false)} goBack={goBack} />;
  }

  return (
    <div
      className={`h-full flex flex-col items-center justify-start p-4 relative overflow-hidden ${phase === 'revealed' ? 'pt-4' : 'pt-8'}`}
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)' }}
    >
      {/* Back button — shown in idle and revealed phases, not during spinning */}
      {phase !== 'spinning' && (
        <BackButton onClick={goBack} className="absolute top-5 left-5 z-20" />
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className={`w-full max-w-sm text-center ${phase === 'revealed' ? 'mb-2' : 'mb-5'}`}>
        <p className="font-noto text-sky-500 text-sm font-bold text-center mb-1">CHAPTER 3 · 오늘의 미션</p>
        <h2 className="font-jua text-2xl text-slate-700">룰렛 돌리기 🎡</h2>
        {phase === 'idle' && (
          <p className="font-noto text-slate-500 text-sm mt-1">버튼을 눌러 오늘의 미션을 뽑아보세요!</p>
        )}
        {phase === 'spinning' && (
          <p className="font-noto text-slate-500 text-sm mt-1">두근두근...!</p>
        )}
        {phase === 'revealed' && slot && (
          <p className="font-noto text-slate-500 text-sm mt-1">미션이 결정됐어요!</p>
        )}
      </div>

      {/* ── Wheel ────────────────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center mb-3">
        <svg
          width={phase === 'revealed' ? 180 : 300}
          height={phase === 'revealed' ? 180 : 300}
          viewBox="0 0 300 300"
          style={{ display: 'block', filter: 'drop-shadow(0 8px 24px rgba(14,165,233,0.18))' }}
        >
          {/* Outer ring */}
          <circle cx={CX} cy={CY} r={R + 6} fill="white" opacity="0.6" />

          {/* Spinning group */}
          <motion.g
            style={{ transformOrigin: `${CX}px ${CY}px` }}
            animate={{ rotate: rotation }}
            transition={
              phase === 'spinning'
                ? { duration: 3.5, ease: [0.17, 0.67, 0.35, 1.0] }
                : { duration: 0 }
            }
            onAnimationComplete={phase === 'spinning' ? handleReveal : undefined}
          >
            {rouletteSlots.map((s, i) => {
              const isWinner = phase === 'revealed' && winSlotIndex === i;
              const { x, y } = sliceLabelPos(i);
              const label = phase === 'revealed' ? (isWinner ? s.label : '') : '?';

              return (
                <g key={s.id}>
                  <path
                    d={slicePath(i)}
                    fill={s.color}
                    stroke={isWinner ? 'white' : 'rgba(255,255,255,0.4)'}
                    strokeWidth={isWinner ? 3 : 1.5}
                    opacity={isWinner ? 1 : 0.88}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={phase === 'revealed' ? 11 : 14}
                    fontFamily="Jua, sans-serif"
                    fill="white"
                    transform={phase === 'revealed' && isWinner ? `rotate(-90, ${x}, ${y})` : undefined}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Center cap */}
            <circle cx={CX} cy={CY} r={18} fill="white" opacity="0.9" />
            <circle cx={CX} cy={CY} r={12} fill="#0ea5e9" />
          </motion.g>

          {/* Winner highlight ring (outside rotating group so it stays at top) */}
          {phase === 'revealed' && (
            <circle
              cx={CX}
              cy={CY}
              r={R + 6}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={3}
              opacity="0.7"
            />
          )}

          {/* Fixed pointer at top */}
          <polygon points="150,8 143,28 157,28" fill="#0ea5e9" />
          <polygon points="150,8 143,28 157,28" fill="none" stroke="white" strokeWidth={1.5} />
        </svg>
      </div>

      {/* ── Spin button ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.button
            key="spin-btn"
            onClick={handleSpin}
            className="font-jua text-xl text-white px-10 py-4 rounded-2xl shadow-lg active:scale-95 transition-transform mb-4"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
          >
            돌리기! 🎡
          </motion.button>
        )}

        {phase === 'spinning' && (
          <motion.div
            key="spinning-text"
            className="font-jua text-xl text-sky-400 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            돌아가는 중...
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result card ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'revealed' && slot && (
          <motion.div
            key="result-card"
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 32, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, delay: 0.1 }}
          >
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/80 overflow-hidden mb-3">
              {/* Card header */}
              <div
                className="px-4 py-3"
                style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}
              >
                <p className="font-noto text-sky-400 text-xs tracking-widest mb-0.5">
                  🎉 결과 공개!
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-noto text-slate-400 text-xs">미션 장소</span>
                  <span className="font-noto text-slate-400 text-xs">:</span>
                  <p className="font-jua text-2xl text-slate-700">{slot.label}</p>
                </div>
              </div>

              <div className="px-4 py-3 flex flex-col gap-2">
                {/* Place name */}
                {slot.placeName && (
                  <div className="flex items-center gap-2">
                    <span className="font-noto text-slate-400 text-xs shrink-0">미션 장소</span>
                    <span className="font-noto text-slate-400 text-xs">:</span>
                    <span className="font-noto text-slate-700 text-sm font-medium">📍 {slot.placeName}</span>
                  </div>
                )}

                {/* Mission */}
                <div className="flex items-start gap-2">
                  <span className="font-noto text-slate-400 text-xs shrink-0 mt-0.5">미션 내용</span>
                  <span className="font-noto text-slate-400 text-xs mt-0.5">:</span>
                  <p className="font-noto text-slate-600 text-sm leading-relaxed">{slot.mission}</p>
                </div>

                {/* Map link */}
                {slot.mapUrl && (
                  <a
                    href={slot.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-noto text-sky-500 text-sm underline underline-offset-2"
                  >
                    📍 지도 보기
                  </a>
                )}

                {/* ── Winner selection (hat / pin kinds) ───────────────────── */}
                {slot.hasWinner && (
                  <div className="flex flex-col gap-2">
                    <p className="font-noto text-slate-500 text-xs text-center">
                      GPT 판정 결과, 이긴 사람은?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWinnerSelect('jinu')}
                        className={`flex-1 py-2.5 rounded-2xl font-jua text-base transition-all ${
                          localWinner === 'jinu'
                            ? 'text-white shadow-md'
                            : 'bg-sky-50 text-sky-400 border border-sky-200'
                        }`}
                        style={
                          localWinner === 'jinu'
                            ? { background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }
                            : {}
                        }
                      >
                        🏆 지누
                      </button>
                      <button
                        onClick={() => handleWinnerSelect('mini')}
                        className={`flex-1 py-2.5 rounded-2xl font-jua text-base transition-all ${
                          localWinner === 'mini'
                            ? 'text-white shadow-md'
                            : 'bg-pink-50 text-pink-400 border border-pink-200'
                        }`}
                        style={
                          localWinner === 'mini'
                            ? { background: 'linear-gradient(135deg, #f472b6, #ec4899)' }
                            : {}
                        }
                      >
                        🏆 미니
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Next button ──────────────────────────────────────────── */}
                {(!slot.hasWinner || localWinner !== null) && (
                  <motion.button
                    onClick={handleAdvance}
                    className="w-full font-jua text-lg text-white py-3 rounded-2xl shadow-md active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    다음으로 →
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
