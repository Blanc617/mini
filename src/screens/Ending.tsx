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
const TITLE_SLIDE_DURATION = 3000;
const CONTROLS_HIDE_DELAY = 2000;

// ─── Title Slide (index 0) ────────────────────────────────────────────────────

function TitleSlide({ photoUrls }: { photoUrls: string[] }) {
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    if (photoUrls.length <= 1) return;
    const id = setInterval(() => setPhotoIdx(p => (p + 1) % photoUrls.length), 2500);
    return () => clearInterval(id);
  }, [photoUrls]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(160deg, #fdf6ec 0%, #fef3e2 60%, #fdf0e0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 필름 그레인 오버레이 */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        opacity: 0.6,
      }} />

      {/* 상단 필름 구멍 */}
      <div style={{ position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingInline: 12 }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ width: 14, height: 10, borderRadius: 3, background: 'rgba(180,140,100,0.25)' }} />
        ))}
      </div>
      {/* 하단 필름 구멍 */}
      <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingInline: 12 }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ width: 14, height: 10, borderRadius: 3, background: 'rgba(180,140,100,0.25)' }} />
        ))}
      </div>

      {/* 생일 스탬프 — 카드 바로 위 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: -3 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 160 }}
        style={{
          border: '2px solid rgba(140,80,30,0.45)',
          borderRadius: 6,
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          background: 'rgba(255,255,255,0.5)',
        }}
      >
        <span style={{ fontSize: 14 }}>🎂</span>
        <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(120,60,20,0.8)', letterSpacing: '0.15em' }}>MINI'S BIRTHDAY</span>
      </motion.div>

      {/* 폴라로이드 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 140 }}
        style={{
          background: 'white',
          borderRadius: 4,
          padding: '20px 20px 52px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 260,
        }}
      >
        {/* 사진 영역 */}
        <div style={{
          width: 220,
          height: 220,
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 14,
          position: 'relative',
          background: 'linear-gradient(135deg, #fde8c8, #fcd5a0)',
        }}>
          {photoUrls.length > 0 ? (
            <>
              {photoUrls.map((url, i) => (
                <motion.img
                  key={i}
                  src={url}
                  alt="오늘의 사진"
                  animate={{ opacity: i === photoIdx ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                />
              ))}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ fontSize: 40 }}>📸</span>
              <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 11, color: 'rgba(120,80,40,0.7)' }}>오늘의 필름</span>
            </div>
          )}
        </div>

        {/* 폴라로이드 하단 텍스트 */}
        <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 18, color: '#5c3d1e', letterSpacing: 2 }}>
          미니의 하루
        </span>
        <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 11, color: 'rgba(120,80,40,0.6)', marginTop: 4, letterSpacing: '0.12em' }}>
          2026. 10. 17
        </span>
      </motion.div>

      {/* 서브텍스트 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 11, color: 'rgba(140,100,60,0.6)', marginTop: 12, letterSpacing: '0.15em' }}
      >
        오늘 하루의 기록 🎞️
      </motion.p>
    </div>
  );
}

// ─── Photo Polaroid Slide ────────────────────────────────────────────────────

function PhotoPolaroidSlide({ url, num, total }: { url: string; num: number; total: number }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #fdf6ec 0%, #fef3e2 60%, #fdf0e0 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 필름 그레인 */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        opacity: 0.6,
      }} />
      {/* 상단 필름 구멍 */}
      <div style={{ position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingInline: 12 }}>
        {[...Array(7)].map((_, i) => <div key={i} style={{ width: 14, height: 10, borderRadius: 3, background: 'rgba(180,140,100,0.25)' }} />)}
      </div>
      {/* 하단 필름 구멍 */}
      <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingInline: 12 }}>
        {[...Array(7)].map((_, i) => <div key={i} style={{ width: 14, height: 10, borderRadius: 3, background: 'rgba(180,140,100,0.25)' }} />)}
      </div>

      {/* 사진 번호 */}
      <div style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, color: 'rgba(120,80,40,0.6)', letterSpacing: '0.15em', marginBottom: 16 }}>
        {num} / {total}
      </div>

      {/* 폴라로이드 카드 */}
      <div style={{
        background: 'white', borderRadius: 4, padding: '20px 20px 52px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', width: 260,
        transform: 'rotate(1.5deg)',
      }}>
        <div style={{ width: 220, height: 220, borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 18, color: '#5c3d1e', letterSpacing: 2 }}>미니의 하루</span>
        <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 11, color: 'rgba(120,80,40,0.6)', marginTop: 4, letterSpacing: '0.12em' }}>2026. 10. 17</span>
      </div>
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
  const [photoIdx, setPhotoIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => {
    setPhotoIdx(p => {
      if (p + 1 >= photoUrls.length) { onEnd(); return p; }
      return p + 1;
    });
  }, [photoUrls.length, onEnd]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(goNext, SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [photoIdx, paused, goNext]);

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const x = e.clientX;
    const w = (e.currentTarget as HTMLDivElement).offsetWidth;
    if (x < w / 3) {
      setPhotoIdx(p => Math.max(0, p - 1));
    } else if (x > (w * 2) / 3) {
      goNext();
    } else {
      setPaused(p => !p);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, overflow: 'hidden', cursor: 'pointer',
        background: 'linear-gradient(160deg, #fdf6ec 0%, #fef3e2 60%, #fdf0e0 100%)' }}
      onClick={handleTap}
    >
      {/* 필름 그레인 */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        opacity: 0.6 }} />

      {/* 상단 필름 구멍 */}
      <div style={{ position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingInline: 12, pointerEvents: 'none' }}>
        {[...Array(7)].map((_, i) => <div key={i} style={{ width: 14, height: 10, borderRadius: 3, background: 'rgba(180,140,100,0.25)' }} />)}
      </div>
      {/* 하단 필름 구멍 */}
      <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingInline: 12, pointerEvents: 'none' }}>
        {[...Array(7)].map((_, i) => <div key={i} style={{ width: 14, height: 10, borderRadius: 3, background: 'rgba(180,140,100,0.25)' }} />)}
      </div>

      {/* 스탬프 + 폴라로이드 카드 묶음 — 카드 바로 위에 스탬프 */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>

        {/* 생일 스탬프 */}
        <div style={{ transform: 'rotate(-3deg)', marginBottom: 10,
          border: '2px solid rgba(140,80,30,0.45)', borderRadius: 6, padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 14 }}>🎂</span>
          <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(120,60,20,0.8)', letterSpacing: '0.15em' }}>MINI'S BIRTHDAY</span>
        </div>

        {/* 폴라로이드 카드 — 고정 프레임 */}
        <div style={{ transform: 'rotate(-2deg)', pointerEvents: 'auto',
          background: 'white', borderRadius: 4, padding: '20px 20px 52px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: 260 }}>

        {/* 사진 영역 — 사진만 교체 */}
        <div style={{ width: 220, height: 220, borderRadius: 2, overflow: 'hidden', marginBottom: 14, position: 'relative', background: '#fde8c8' }}>
          {photoUrls.map((url, i) => (
            <motion.img
              key={i}
              src={url}
              alt=""
              animate={{ opacity: i === photoIdx ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ))}
        </div>

        <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 18, color: '#5c3d1e', letterSpacing: 2 }}>미니의 하루</span>
        <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 11, color: 'rgba(120,80,40,0.6)', marginTop: 4, letterSpacing: '0.12em' }}>2026. 10. 17</span>
        </div>{/* 폴라로이드 카드 끝 */}
      </div>{/* 스탬프+카드 wrapper 끝 */}

      {/* 사진 카운터 */}
      <div style={{ position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, color: 'rgba(140,100,60,0.7)', letterSpacing: '0.15em', pointerEvents: 'none' }}>
        {photoIdx + 1} / {photoUrls.length}
      </div>

      {/* 뒤로 버튼 */}
      <button onClick={(e) => { e.stopPropagation(); onBack(); }}
        style={{ position: 'absolute', top: 16, left: 16, zIndex: 10,
          width: 40, height: 40, borderRadius: '50%', background: 'rgba(140,100,60,0.15)',
          border: '1px solid rgba(140,100,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9L11 14" stroke="rgba(100,60,20,0.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 요약 버튼 */}
      <button onClick={(e) => { e.stopPropagation(); onEnd(); }}
        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10,
          fontFamily: 'Jua, sans-serif', fontSize: 13, color: 'rgba(100,60,20,0.8)',
          background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(140,100,60,0.3)',
          borderRadius: 20, padding: '7px 14px', cursor: 'pointer' }}>
        요약 보기
      </button>

      {/* 일시정지 표시 */}
      {paused && (
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, color: 'rgba(140,100,60,0.6)', pointerEvents: 'none' }}>
          ⏸ 일시정지
        </div>
      )}
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

// ─── Video generation ────────────────────────────────────────────────────────

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function generateVideo(photoUrls: string[]): Promise<void> {
  const W = 540, H = 960;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  await document.fonts.ready;

  const images = await Promise.all(photoUrls.map(url => new Promise<HTMLImageElement>(res => {
    const img = new Image(); img.onload = () => res(img); img.src = url;
  })));

  const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.start(100);

  const wait = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

  // 카드 고정 좌표
  const cW = 260, cH = 346, cX = (W - cW) / 2, cY = (H - cH) / 2;
  const pS = 220, pX = cX + 20, pY = cY + 20;

  function drawStatic() {
    // 배경
    ctx.fillStyle = '#fef3e2';
    ctx.fillRect(0, 0, W, H);
    // 필름 구멍
    for (let i = 0; i < 7; i++) {
      const x = 24 + i * (W - 48) / 6;
      ctx.fillStyle = 'rgba(180,140,100,0.25)';
      rr(ctx, x - 7, 14, 14, 10, 3); ctx.fill();
      rr(ctx, x - 7, H - 24, 14, 10, 3); ctx.fill();
    }
    // 생일 스탬프 — 카드 바로 위 (cY - 10gap - 17halfHeight = 307 - 10 - 17 = 280)
    ctx.save();
    ctx.translate(W / 2, cY - 10 - 17);
    ctx.rotate(-3 * Math.PI / 180);
    ctx.strokeStyle = 'rgba(140,80,30,0.45)'; ctx.lineWidth = 2;
    rr(ctx, -88, -17, 176, 34, 6); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
    ctx.fillStyle = 'rgba(120,60,20,0.8)';
    ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎂  MINI\'S BIRTHDAY', 0, 6);
    ctx.restore();
    // 폴라로이드 카드 (프레임만)
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-2 * Math.PI / 180);
    ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'white';
    rr(ctx, -cW / 2, -cH / 2, cW, cH, 4); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    // 캡션
    const relPY = -cH / 2 + 20 + pS;
    ctx.fillStyle = '#5c3d1e'; ctx.font = '18px "Jua", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('미니의 하루', 0, relPY + 26);
    ctx.fillStyle = 'rgba(120,80,40,0.65)'; ctx.font = '11px "Noto Sans KR", sans-serif';
    ctx.fillText('2026. 10. 17', 0, relPY + 44);
    ctx.restore();
  }

  function drawPhotoInCard(img: HTMLImageElement, alpha = 1) {
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-2 * Math.PI / 180);
    ctx.globalAlpha = alpha;
    const rpX = -cW / 2 + 20, rpY = -cH / 2 + 20;
    ctx.beginPath(); ctx.rect(rpX, rpY, pS, pS); ctx.clip();
    const s = Math.max(pS / img.width, pS / img.height);
    ctx.drawImage(img, rpX + (pS - img.width * s) / 2, rpY + (pS - img.height * s) / 2, img.width * s, img.height * s);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawCounter(idx: number) {
    ctx.fillStyle = 'rgba(140,100,60,0.7)';
    ctx.font = '12px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${idx + 1} / ${images.length}`, W / 2, H - 48);
  }

  // rAF 기반 페이드 (실제 500ms 보장)
  const FADE_MS = 500;
  const HOLD_MS = SLIDE_DURATION; // 2000ms

  const animateFade = (durationMs: number, draw: (t: number) => void) =>
    new Promise<void>(resolve => {
      const start = performance.now();
      function frame() {
        const t = Math.min((performance.now() - start) / durationMs, 1);
        draw(t);
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });

  for (let i = 0; i < images.length; i++) {
    const prev = images[i - 1];
    const curr = images[i];

    // crossfade (첫 장은 fade-in)
    await animateFade(FADE_MS, t => {
      drawStatic();
      if (i > 0) drawPhotoInCard(prev, 1 - t);
      drawPhotoInCard(curr, t);
      drawCounter(i);
    });

    // hold
    drawStatic();
    drawPhotoInCard(curr, 1);
    drawCounter(i);
    await wait(HOLD_MS);
  }

  recorder.stop();

  await new Promise<void>(res => {
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mimeType });
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `mini-day-2026.${ext}`, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.name; a.click();
      URL.revokeObjectURL(url);
      res();
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────

interface SummaryScreenProps {
  state: ScreenProps['state'];
  resetState: () => void;
  goBack: () => void;
  photoUrls: string[];
}

function SummaryScreen({ state, resetState, goBack, photoUrls }: SummaryScreenProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
          {/* 영상 만들기 버튼 */}
          <button
            onClick={async () => {
              if (isGenerating) return;
              setIsGenerating(true);
              await generateVideo(photoUrls);
              setIsGenerating(false);
            }}
            disabled={isGenerating}
            style={{ width: '100%', fontFamily: 'Jua, sans-serif', fontSize: 15, color: 'white', background: isGenerating ? 'rgba(14,165,233,0.5)' : 'linear-gradient(135deg, #38bdf8, #0ea5e9)', border: 'none', borderRadius: 12, padding: '11px 0', cursor: isGenerating ? 'default' : 'pointer', marginTop: 8, boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}
          >
            {isGenerating ? '⏳ 영상 생성 중...' : '🎬 폴라로이드 영상 다운로드'}
          </button>

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
