import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fixedRestaurant } from '../content/restaurants';
import { rouletteSlots } from '../content/roulette';
import { cards } from '../content/cards';
import type { ScreenProps } from '../store/useAppState';
import BackButton from '../components/BackButton';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'upload' | 'slideshow' | 'summary';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SLIDE_DURATION = 2000;
const CONTROLS_HIDE_DELAY = 2000;

// ─── Title Slide (index 0) ────────────────────────────────────────────────────

function TitleSlide() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(160deg, #0a0f1a 0%, #0c1a2e 60%, #0f2744 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 별 파티클 */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: 'white',
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 13 + 8) % 100}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}

      {/* 날짜 */}
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: 'Noto Sans KR, sans-serif',
          fontSize: 13,
          color: 'rgba(125,211,252,0.8)',
          letterSpacing: '0.25em',
          marginBottom: 20,
        }}
      >
        2026 · 10 · 17
      </motion.span>

      {/* 메인 타이틀 */}
      <motion.span
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 160 }}
        style={{
          fontFamily: 'Jua, sans-serif',
          fontSize: 'clamp(2.2rem, 9vw, 3.8rem)',
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.15,
          marginBottom: 12,
        }}
      >
        지누 × 미니
      </motion.span>

      {/* 서브 */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        style={{
          fontFamily: 'Noto Sans KR, sans-serif',
          fontSize: 14,
          color: 'rgba(186,230,253,0.7)',
          letterSpacing: '0.15em',
          marginBottom: 36,
        }}
      >
        오늘 하루의 기록 💙
      </motion.span>

      {/* 구분선 */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{
          width: 60,
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(125,211,252,0.6), transparent)',
        }}
      />
    </div>
  );
}

// ─── Slideshow ────────────────────────────────────────────────────────────────

interface SlideshowProps {
  photoUrls: string[];
  onEnd: () => void;
  onBack: () => void;
}

function Slideshow({ photoUrls, onEnd, onBack }: SlideshowProps) {
  // index 0 = title card, 1..N = photos
  const total = photoUrls.length + 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (next >= total) {
        onEnd();
        return;
      }
      setIndex(next);
    },
    [total, onEnd],
  );

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => goTo(index + 1), SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, paused, goTo]);

  // Show controls briefly on mount
  useEffect(() => {
    controlsTimerRef.current = setTimeout(
      () => setShowControls(false),
      CONTROLS_HIDE_DELAY,
    );
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  function revealControls() {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(
      () => setShowControls(false),
      CONTROLS_HIDE_DELAY,
    );
  }

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const x = e.clientX;
    const w = (e.currentTarget as HTMLDivElement).offsetWidth;
    const third = w / 3;

    if (x < third) {
      // Left third: prev
      revealControls();
      goTo(Math.max(0, index - 1));
    } else if (x > w - third) {
      // Right third: next
      revealControls();
      goTo(index + 1);
    } else {
      // Center: pause/resume + show controls
      setPaused((p) => !p);
      revealControls();
    }
  }

  const isTitle = index === 0;
  const photoUrl = isTitle ? null : photoUrls[index - 1];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 50,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={handleTap}
    >
      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {isTitle ? (
            <TitleSlide />
          ) : (
            <img
              src={photoUrl!}
              alt={`사진 ${index}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Back button — always visible */}
      <button
        onClick={(e) => { e.stopPropagation(); onBack(); }}
        className="absolute top-4 left-4 z-30 w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9L11 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            key="controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px 20px',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              pointerEvents: 'none',
            }}
          >
            {/* Pause/Play */}
            <span style={{ fontSize: 28, color: 'white', opacity: 0.9 }}>
              {paused ? '▶️' : '⏸️'}
            </span>

            {/* Counter */}
            <span
              style={{
                fontFamily: 'Noto Sans KR, sans-serif',
                fontSize: 14,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {index} / {total - 1}
            </span>

            {/* Summary button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEnd();
              }}
              style={{
                fontFamily: 'Jua, sans-serif',
                fontSize: 14,
                color: 'white',
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 20,
                padding: '8px 16px',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                pointerEvents: 'all',
              }}
            >
              요약 카드 보기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Upload UI ────────────────────────────────────────────────────────────────

interface UploadProps {
  wasRefreshed: boolean;
  onPhotos: (urls: string[], count: number) => void;
}

function UploadUI({ wasRefreshed: _wasRefreshed, onPhotos }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    onPhotos(urls, files.length);
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(12px)',
        borderRadius: 24,
        padding: 28,
        boxShadow: '0 8px 32px rgba(14,165,233,0.12)',
        border: '1.5px solid rgba(255,255,255,0.8)',
        textAlign: 'center',
        maxWidth: 360,
        width: '100%',
      }}
    >
      <p
        style={{
          fontFamily: 'Jua, sans-serif',
          fontSize: 20,
          color: '#1e293b',
          marginBottom: 8,
          lineHeight: 1.3,
        }}
      >
        오늘 찍은 사진을 골라주세요 📷
      </p>
      <label
        style={{
          display: 'inline-block',
          fontFamily: 'Jua, sans-serif',
          fontSize: 18,
          color: 'white',
          background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
          borderRadius: 16,
          padding: '14px 28px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(14,165,233,0.35)',
          userSelect: 'none',
        }}
      >
        🖼️ 갤러리로 이동하기
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFiles}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}

// ─── Summary Screen ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  top: `${(i * 11.3 + 4) % 92}%`,
  left: `${(i * 16.7 + 2) % 96}%`,
  color: ['#38bdf8', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#fb923c'][i % 6],
  size: 5 + (i % 3) * 3,
  delay: (i * 0.38) % 2.8,
  dur: 2.2 + (i % 5) * 0.5,
  rotate: (i * 47) % 360,
}));

interface SummaryScreenProps {
  state: ScreenProps['state'];
  resetState: () => void;
  goBack: () => void;
  photoUrls: string[];
}

function SummaryScreen({ state, resetState, goBack, photoUrls }: SummaryScreenProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const restaurant = state.ch2.restaurantId ? fixedRestaurant : null;
  const slot = rouletteSlots.find((s) => s.id === state.ch3.slotId);
  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const pickedCards = state.bonus.pickedCardIds
    .map((id) => cardMap.get(id))
    .filter((c): c is (typeof cards)[0] => c !== undefined);

  const row = (icon: string, main: string, sub?: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(14,165,233,0.1)', overflow: 'hidden' }}>
      <span style={{ fontSize: 17, width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 14, color: '#0c4a6e', lineHeight: 1.3, flexShrink: 0 }}>{main}</span>
      {sub && <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 11, color: '#64748b', marginLeft: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{sub}</span>}
    </div>
  );

  return (
    <div
      style={{
        height: '100%',
        background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 45%, #f0f9ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: '52px 20px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BackButton onClick={goBack} className="absolute top-5 left-5 z-20" />

      {/* Confetti particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {CONFETTI.map((c) => (
          <motion.div
            key={c.id}
            style={{
              position: 'absolute',
              top: c.top,
              left: c.left,
              width: c.size,
              height: c.size,
              borderRadius: c.id % 2 === 0 ? '50%' : 3,
              background: c.color,
              opacity: 0.55,
              rotate: c.rotate,
            }}
            animate={{ y: [0, -14, 0], opacity: [0.3, 0.7, 0.3], rotate: [c.rotate, c.rotate + 30, c.rotate] }}
            transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Hero */}
      <motion.div
        style={{ textAlign: 'center', zIndex: 1 }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 160 }}
      >
        <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 22, color: '#0ea5e9', letterSpacing: '0.18em', fontWeight: 700, marginBottom: 8 }}>
          HAPPY MINI DAY 🎊
        </p>
        <motion.p
          style={{ fontFamily: 'Jua, sans-serif', fontSize: 32, margin: 0, lineHeight: 1.25, color: '#0284c7', textShadow: '0 2px 16px rgba(56,189,248,0.55), 0 4px 32px rgba(14,165,233,0.25)' }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          미니야 생일축하해 💙
        </motion.p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(255,255,255,0.6)', borderRadius: 20, padding: '4px 14px', border: '1px solid rgba(14,165,233,0.2)' }}>
          <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13, color: '#0369a1', margin: 0, letterSpacing: '0.08em', fontWeight: 500 }}>
            2026 · 10 · 17
          </p>
        </div>
      </motion.div>

      {/* Recap card */}
      <motion.div
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.9)',
          borderRadius: 24,
          padding: '16px 18px 12px',
          boxShadow: '0 4px 24px rgba(14,165,233,0.12)',
          zIndex: 1,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 160 }}
      >
        <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13, color: '#0ea5e9', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 6 }}>
          TODAY'S RECAP
        </p>
        {row('🔒', '남산 자물쇠 걸기', state.escapeRoom.comment ?? undefined)}
        {row(restaurant?.emoji ?? '🍽', restaurant ? restaurant.menu : '저녁 뽑기', restaurant?.name || undefined)}
        {row('🎡', slot ? slot.label : '룰렛 미션', state.ch3.winner ? `${state.ch3.winner === 'jinu' ? '지누' : '미니'} 승리 🏆` : (slot?.mission ?? undefined))}

        {pickedCards.length > 0 && (
          <div style={{ display: 'flex', gap: 6, paddingTop: 9 }}>
            {pickedCards.map((card) => (
              <div key={card.id} style={{ flex: 1, background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '7px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>{card.emoji}</div>
                <div style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 9, color: '#475569', marginTop: 3, lineHeight: 1.3 }}>{card.title}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 사진 스트립 */}
      {photoUrls.length > 0 && (
        <motion.div
          style={{ width: '100%', maxWidth: 380, zIndex: 1 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 160 }}
        >
          <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13, color: '#0ea5e9', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 8 }}>
            오늘의 사진 📸
          </p>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
            {photoUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                onClick={() => setLightboxIndex(i)}
                style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 12, flexShrink: 0, border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 2px 8px rgba(14,165,233,0.2)', cursor: 'pointer' }}
              />
            ))}
          </div>
          {/* 저장 / 공유 버튼 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={async () => {
                try {
                  const files = await Promise.all(
                    photoUrls.map(async (url, i) => {
                      const res = await fetch(url);
                      const blob = await res.blob();
                      return new File([blob], `mini-day-2026-${String(i + 1).padStart(2, '0')}.jpg`, { type: blob.type || 'image/jpeg' });
                    })
                  );
                  if (navigator.canShare && navigator.canShare({ files })) {
                    await navigator.share({ files, title: 'Happy Mini Day 🎉' });
                  } else {
                    // 미지원 시 순차 다운로드
                    for (let i = 0; i < photoUrls.length; i++) {
                      await new Promise<void>(resolve => setTimeout(resolve, i * 300));
                      const a = document.createElement('a');
                      a.href = photoUrls[i];
                      a.download = `mini-day-2026-${String(i + 1).padStart(2, '0')}.jpg`;
                      a.click();
                    }
                  }
                } catch { /* 취소 */ }
              }}
              style={{ flex: 1, fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, fontWeight: 600, color: '#0ea5e9', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(14,165,233,0.25)', borderRadius: 10, padding: '8px 0', cursor: 'pointer' }}
            >
              💾 사진 저장
            </button>
            <button
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({ title: 'Happy Mini Day 🎉', text: '2026.10.17 지누 x 미니의 하루 💙', url: window.location.href });
                  } catch { /* 취소 */ }
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                  alert('링크가 복사됐어요! 📋');
                }
              }}
              style={{ flex: 1, fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, fontWeight: 600, color: '#0ea5e9', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(14,165,233,0.25)', borderRadius: 10, padding: '8px 0', cursor: 'pointer' }}
            >
              🔗 링크 공유
            </button>
          </div>
        </motion.div>
      )}

      {/* 라이트박스 */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setLightboxIndex(null)}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
              style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>

            {/* 이전 버튼 */}
            {photoUrls.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + photoUrls.length) % photoUrls.length); }}
                style={{ position: 'absolute', left: 16, background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
              >
                ‹
              </button>
            )}

            {/* 사진 */}
            <motion.img
              key={lightboxIndex}
              src={photoUrls[lightboxIndex]}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
            />

            {/* 다음 버튼 */}
            {photoUrls.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % photoUrls.length); }}
                style={{ position: 'absolute', right: 16, background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
              >
                ›
              </button>
            )}

            {/* 인디케이터 */}
            {photoUrls.length > 1 && (
              <div style={{ position: 'absolute', bottom: 24, display: 'flex', gap: 6 }}>
                {photoUrls.map((_, i) => (
                  <div
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                    style={{ width: i === lightboxIndex ? 20 : 7, height: 7, borderRadius: 4, background: i === lightboxIndex ? '#38bdf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 다시 시작 */}
      <motion.div style={{ zIndex: 1 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <ResetButton resetState={resetState} />
      </motion.div>
    </div>
  );
}

// ─── Reset button (summary phase) ────────────────────────────────────────────

function ResetButton({ resetState }: { resetState: () => void }) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="mt-6 mb-2 flex flex-col items-center gap-2">
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13, color: '#94a3b8',
            background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          ↺ 처음부터 다시 시작
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13, color: '#64748b', margin: 0 }}>
            진행 기록이 모두 사라져요. 진짜요?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => resetState()}
              style={{ fontFamily: 'Jua, sans-serif', fontSize: 14, color: '#fff',
                background: 'linear-gradient(135deg, #f87171, #ef4444)',
                border: 'none', borderRadius: 12, padding: '8px 20px', cursor: 'pointer' }}
            >
              네, 다시 시작
            </button>
            <button
              onClick={() => setConfirm(false)}
              style={{ fontFamily: 'Jua, sans-serif', fontSize: 14, color: '#64748b',
                background: 'rgba(255,255,255,0.6)', border: '1px solid #e2e8f0',
                borderRadius: 12, padding: '8px 20px', cursor: 'pointer' }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ending (main export) ─────────────────────────────────────────────────────

export default function Ending({ state, update, goBack, resetState }: ScreenProps) {
  const [phase, setPhase] = useState<Phase>(
    // If already viewed summary before (photoCount set), start at upload
    // Phase determined by local photo URLs — not persisted state
    'upload',
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const photoUrlsRef = useRef<string[]>([]);

  // Revoke object URLs on unmount to avoid memory leaks (use ref to avoid stale closure)
  useEffect(() => {
    return () => {
      photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handlePhotos(urls: string[], count: number) {
    photoUrlsRef.current = urls;
    setPhotoUrls(urls);
    update({ ending: { photoCount: count } });
    setPhase('slideshow');
  }

  function handleSlideshowEnd() {
    setPhase('summary');
  }

  const wasRefreshed = state.ending.photoCount > 0 && photoUrls.length === 0;

  return (
    <>
      {/* Slideshow — rendered as fixed overlay when active */}
      {phase === 'slideshow' && photoUrls.length > 0 && (
        <Slideshow photoUrls={photoUrls} onEnd={handleSlideshowEnd} onBack={() => setPhase('upload')} />
      )}

      {/* Summary — full-screen night sky layout */}
      {phase === 'summary' && (
        <SummaryScreen state={state} resetState={resetState} goBack={goBack} photoUrls={photoUrls} />
      )}

      {/* Upload screen */}
      {phase === 'upload' && (
        <div
          className="h-full flex flex-col items-center justify-center p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)' }}
        >
          <BackButton onClick={goBack} className="absolute top-5 left-5 z-20" />
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-sm mb-6 text-center">
              <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 11, color: '#0ea5e9', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
                ENDING
              </p>
              <h2 style={{ fontFamily: 'Jua, sans-serif', fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', color: '#1e293b', margin: 0 }}>
                오늘 하루 마무리 📸
              </h2>
            </div>
            <UploadUI wasRefreshed={wasRefreshed} onPhotos={handlePhotos} />
            <button
              onClick={() => setPhase('summary')}
              style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginTop: 20, padding: '8px 12px', textDecoration: 'underline' }}
            >
              사진 없이 요약 카드 보기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
