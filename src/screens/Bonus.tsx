import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { ScreenProps } from '../store/useAppState';
import { cards } from '../content/cards';
import type { Card } from '../content/cards';
import BackButton from '../components/BackButton';

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Card type styles ─────────────────────────────────────────────────────────
const typeStyles: Record<Card['type'], { bg: string; border: string; tag: string; tagText: string }> = {
  wish:    { bg: '#f0f9ff', border: '#bae6fd', tag: '#e0f2fe', tagText: '#0284c7' },
  penalty: { bg: '#fff1f2', border: '#fecaca', tag: '#fee2e2', tagText: '#dc2626' },
};

// ─── Confetti ─────────────────────────────────────────────────────────────────
function fireCardConfetti() {
  confetti({ particleCount: 50, spread: 60, origin: { y: 0.55 }, colors: ['#38bdf8', '#fbbf24', '#f472b6', '#34d399'] });
}

// ─── FlipCard ─────────────────────────────────────────────────────────────────
interface FlipCardProps {
  card: Card;
  isFlipped: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function FlipCard({ card, isFlipped, isDisabled, onClick }: FlipCardProps) {
  const style = typeStyles[card.type];
  return (
    <div
      style={{ width: 96, height: 132, position: 'relative', perspective: 800, cursor: isDisabled ? 'default' : 'pointer', opacity: isDisabled ? 0.38 : 1, transition: 'opacity 0.3s' }}
      onClick={isDisabled ? undefined : onClick}
    >
      <motion.div
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.52, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front (face-down) */}
        <div style={{
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          position: 'absolute', inset: 0, borderRadius: 16,
          background: 'linear-gradient(145deg, #38bdf8 0%, #0ea5e9 60%, #0284c7 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(14,165,233,0.35)', border: '2px solid rgba(255,255,255,0.4)', gap: 6,
        }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>🎴</span>
          <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 26, color: 'white', lineHeight: 1 }}>?</span>
          <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: 1 }}>BONUS</span>
        </div>

        {/* Back (face-up) */}
        <div style={{
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', position: 'absolute', inset: 0, borderRadius: 16,
          background: style.bg, boxShadow: '0 6px 16px rgba(0,0,0,0.10)',
          border: `2px solid ${style.border}`, padding: '10px 8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>{card.emoji}</span>
          <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 700, fontSize: 10, color: '#1e293b', textAlign: 'center', lineHeight: 1.35, wordBreak: 'keep-all', padding: '0 4px' }}>
            {card.title}
          </span>
          <span style={{
            fontFamily: 'Noto Sans KR, sans-serif', fontSize: 8.5, color: typeStyles[card.type].tagText,
            background: typeStyles[card.type].tag, borderRadius: 20, padding: '2px 7px',
          }}>
            {card.type === 'wish' ? '소원권' : '패널티'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ResultCard ───────────────────────────────────────────────────────────────
function ResultCard({ card, index }: { card: Card; index: number }) {
  const style = typeStyles[card.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
      style={{
        background: 'white',
        border: `2px solid ${style.border}`,
        borderRadius: 20,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
      }}
    >
      <div style={{
        width: 58, height: 58, borderRadius: 16, background: style.bg,
        border: `1.5px solid ${style.border}`, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
      }}>
        {card.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <p style={{ fontFamily: 'Jua, sans-serif', fontSize: 18, color: '#1e293b', margin: 0, lineHeight: 1.2 }}>
            {card.title}
          </p>
          <span style={{
            fontFamily: 'Noto Sans KR, sans-serif', fontSize: 9, color: style.tagText,
            background: style.tag, borderRadius: 20, padding: '2px 7px', flexShrink: 0,
          }}>
            {card.type === 'wish' ? '소원권' : '패널티'}
          </span>
        </div>
        <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          {card.desc}
        </p>
        {card.type === 'wish' && (
          <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 10, color: '#94a3b8', margin: '5px 0 0' }}>
            📅 유효기간 2026.11.17까지
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Bonus (main export) ──────────────────────────────────────────────────────
const MAX_PICKS = 2;

export default function Bonus({ state, update, advance, goBack }: ScreenProps) {
  const { deck, pickedCardIds } = state.bonus;

  useEffect(() => {
    if (deck.length === 0) {
      update({ bonus: { deck: shuffle(cards.map((c) => c.id)), pickedCardIds: [] } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const orderedIds = deck.length > 0 ? deck : cards.map((c) => c.id);
  const isDone = pickedCardIds.length >= MAX_PICKS;
  const pendingPicks = useRef<Set<string>>(new Set());

  const [showResult, setShowResult] = useState(isDone);

  useEffect(() => {
    if (isDone && !showResult) {
      const t = setTimeout(() => setShowResult(true), 2000);
      return () => clearTimeout(t);
    }
  }, [isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePick(id: string) {
    if (pickedCardIds.includes(id)) return;
    if (pendingPicks.current.has(id)) return;
    if (isDone) return;
    pendingPicks.current.add(id);
    fireCardConfetti();
    update({ bonus: { deck, pickedCardIds: [...pickedCardIds, id] } });
    pendingPicks.current.delete(id);
  }

  const pickedCards = pickedCardIds.map((id) => cardMap.get(id)).filter((c): c is Card => c !== undefined);

  return (
    <div
      className="h-full overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)' }}
    >
      <BackButton onClick={goBack} className="absolute top-5 left-5 z-20" />

      <AnimatePresence mode="wait">
        {!showResult ? (
          /* ── Picking phase ── */
          <motion.div
            key="picking"
            className="flex flex-col items-center h-full px-5 pt-8 pb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <p className="font-noto text-sky-500 text-sm font-bold tracking-wide mb-1">BONUS CHAPTER</p>
              <h2 className="font-jua text-2xl text-slate-700 mb-1">랜덤 카드 뽑기 🎴</h2>
              <p className="font-noto text-slate-500 text-sm">6장 중 마음에 드는 {MAX_PICKS}장을 골라요!</p>
            </div>

            {/* Card container */}
            <div
              className="w-full max-w-sm flex flex-col rounded-3xl overflow-hidden shadow-xl"
              style={{ border: '1.5px solid rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)' }}
            >
              {/* Container header bar */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
              >
                <p className="font-jua text-white text-base">🎴 카드를 골라보세요</p>
                <div
                  className="font-noto text-sm font-bold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
                >
                  {pickedCardIds.length} / {MAX_PICKS}
                </div>
              </div>

              {/* Grid */}
              <div className="p-5 flex flex-col items-center gap-4">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 96px)', gap: 14 }}>
                  {orderedIds.map((id) => {
                    const card = cardMap.get(id);
                    if (!card) return null;
                    return (
                      <FlipCard
                        key={id}
                        card={card}
                        isFlipped={pickedCardIds.includes(id)}
                        isDisabled={isDone && !pickedCardIds.includes(id)}
                        onClick={() => handlePick(id)}
                      />
                    );
                  })}
                </div>

                {/* Hint */}
                <p className="font-noto text-slate-400 text-xs text-center mt-1">
                  카드를 눌러 뒤집어보세요 ✨
                </p>
              </div>
            </div>

            {/* Bottom note */}
            <p className="font-noto text-slate-400 text-xs text-center mt-4 leading-relaxed">
              소원권은 유효기간 안에 언제든지 사용할 수 있어요 🎁
            </p>
          </motion.div>
        ) : (
          /* ── Result phase ── */
          <motion.div
            key="result"
            className="flex flex-col items-center h-full px-5 pt-8 pb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 160 }}
          >
            {/* Header */}
            <div className="text-center mb-4 w-full max-w-sm">
              <p className="font-noto text-sky-500 text-sm font-bold tracking-wide mb-1">BONUS CHAPTER</p>
              <h2 className="font-jua text-2xl text-slate-700 mb-1">🎉 선택 완료!</h2>
              <p className="font-noto text-slate-500 text-sm">뽑은 카드 {MAX_PICKS}장이에요</p>
            </div>

            {/* Result container */}
            <div
              className="w-full max-w-sm flex flex-col rounded-3xl overflow-hidden shadow-xl mb-4"
              style={{ border: '1.5px solid rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)' }}
            >
              {/* Container header bar */}
              <div
                className="px-5 py-4"
                style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
              >
                <p className="font-jua text-white text-base">🎁 오늘의 보너스 카드</p>
                <p className="font-noto text-white/75 text-xs mt-0.5">미니가 뽑은 {MAX_PICKS}장</p>
              </div>

              {/* Cards */}
              <div className="p-4 flex flex-col gap-3">
                {pickedCards.map((card, i) => (
                  <ResultCard key={card.id} card={card} index={i} />
                ))}
              </div>
            </div>

            {/* Closing note */}
            <p className="font-noto text-slate-400 text-xs text-center mb-4 leading-relaxed">
              소원권은 유효기간 안에 언제든지 써도 돼요 💕
            </p>

            {/* Next button */}
            <motion.button
              onClick={() => advance('ending')}
              className="w-full max-w-sm font-jua text-lg text-white py-4 rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.97 }}
            >
              다음으로 →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
