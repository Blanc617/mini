import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { ScreenProps } from '../store/useAppState';
import { ladder } from '../content/escapeLadder';
import BackButton from '../components/BackButton';

// ─── Constants ───────────────────────────────────────────────────────────────
const LANES = 5;
const PAD_X = 30;
const SPACING = 60; // (300 - 60) / 4
const TOP_Y = 44;
const BOT_Y = 310;
const ROWS = 13;
const ROW_H = (BOT_Y - TOP_Y) / ROWS; // ≈ 20.5
const STEP_MS = 170;
const CONFETTI_COLORS = ['#38bdf8', '#fbbf24', '#f472b6', '#34d399'];

const LOSER_FALLBACKS = ['볼링', '노래방', '보드게임', '오락실'];

function laneX(i: number) {
  return PAD_X + i * SPACING;
}

function rowY(r: number) {
  return TOP_Y + r * ROW_H;
}

// ─── Bridge generation ───────────────────────────────────────────────────────
// bridges[row][lane] = true means bridge going right from lane to lane+1
function generateBridges(): boolean[][] {
  const bridges: boolean[][] = Array.from({ length: ROWS }, () =>
    Array(LANES - 1).fill(false)
  );
  for (let r = 0; r < ROWS; r++) {
    for (let lane = 0; lane < LANES - 1; lane++) {
      // Don't place if adjacent bridge already placed this row
      if (!bridges[r][lane] && (lane === 0 || !bridges[r][lane - 1])) {
        bridges[r][lane] = Math.random() < 0.45;
      }
    }
  }
  return bridges;
}

// ─── Path tracing ────────────────────────────────────────────────────────────
function getPathPoints(
  startLane: number,
  bridges: boolean[][]
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  let lane = startLane;
  pts.push({ x: laneX(lane), y: TOP_Y });

  for (let r = 0; r < ROWS; r++) {
    const bridgeY = rowY(r) + ROW_H * 0.5;
    if (lane < LANES - 1 && bridges[r]?.[lane]) {
      pts.push({ x: laneX(lane), y: bridgeY });
      pts.push({ x: laneX(lane + 1), y: bridgeY });
      lane++;
    } else if (lane > 0 && bridges[r]?.[lane - 1]) {
      pts.push({ x: laneX(lane), y: bridgeY });
      pts.push({ x: laneX(lane - 1), y: bridgeY });
      lane--;
    }
    pts.push({ x: laneX(lane), y: rowY(r + 1) });
  }

  pts.push({ x: laneX(lane), y: BOT_Y });
  return pts;
}

// ─── Destination computation ─────────────────────────────────────────────────
function computeDestination(startLane: number, bridges: boolean[][]): number {
  const pts = getPathPoints(startLane, bridges);
  const last = pts[pts.length - 1];
  return Math.round((last.x - PAD_X) / SPACING);
}

// ─── Label helpers ────────────────────────────────────────────────────────────
function getLoserLabel(idx: number): string {
  const loser = ladder.losers[idx];
  if (loser && loser.title) return `${loser.title}`;
  return LOSER_FALLBACKS[idx] ?? '???';
}

function truncate(text: string, max = 5): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// ─── Confetti ────────────────────────────────────────────────────────────────
function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.55 },
    colors: CONFETTI_COLORS,
  });
}

// ─── EscapeResult sub-component ──────────────────────────────────────────────
interface EscapeResultProps {
  state: ScreenProps['state'];
  update: ScreenProps['update'];
  advance: ScreenProps['advance'];
  goBack: ScreenProps['goBack'];
}

function EscapeResult({ state, update, advance, goBack }: EscapeResultProps) {
  const [comment, setComment] = useState<string>(state.escapeRoom.comment ?? '');

  const canAdvance = comment.trim().length > 0;

  function handleAdvance() {
    update({ escapeRoom: { comment: comment.trim() } });
    advance('ch2');
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center p-6 relative"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)' }}
    >
      <BackButton onClick={goBack} className="absolute top-5 left-5 z-20" />

      <motion.div
        className="w-full max-w-xs bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/80"
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160 }}
      >
        <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}>
          <p className="font-noto text-sky-400 text-xs tracking-widest mb-1">CHAPTER 1 RESULT</p>
          <h2 className="font-jua text-2xl text-slate-700">{ladder.fixedResult.title} 어땠어요? 🔒</h2>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <p className="font-noto text-slate-500 text-xs mb-2">짧게 소감을 남겨봐요</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="예) 너무 좋았어! 또 오고 싶다 🥰"
              rows={3}
              className="w-full bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 font-noto text-slate-700 text-sm focus:outline-none focus:border-sky-400 resize-none"
            />
          </div>

          <button
            disabled={!canAdvance}
            onClick={handleAdvance}
            className={`w-full font-jua text-xl py-4 rounded-2xl shadow-md transition-all ${
              canAdvance
                ? 'bg-sky-500 text-white active:scale-95'
                : 'bg-sky-100 text-sky-300 cursor-not-allowed'
            }`}
          >
            다음 퀘스트로 →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── LadderGame sub-component ─────────────────────────────────────────────────
interface LadderGameProps {
  state: ScreenProps['state'];
  update: ScreenProps['update'];
  advance: ScreenProps['advance'];
  goBack: ScreenProps['goBack'];
}

function LadderGame({ state, update, advance, goBack }: LadderGameProps) {
  // ── Stable bridge layout (persisted to AppState)
  const [bridges] = useState<boolean[][]>(() =>
    (state.ch1.bridges && state.ch1.bridges.length === ROWS)
      ? state.ch1.bridges
      : generateBridges()
  );

  useEffect(() => {
    if (!state.ch1.bridges || state.ch1.bridges.length !== ROWS) {
      update({ ch1: { ...state.ch1, bridges, startLane: null, resultRevealed: false } });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Destination labels: fixed result for the picked lane, losers for rest
  const loserLabels = [getLoserLabel(0), getLoserLabel(1), getLoserLabel(2), getLoserLabel(3)];

  // ── Local phase state
  type Phase = 'idle' | 'animating' | 'revealed';
  const getInitialPhase = (): Phase => {
    if (state.ch1.startLane !== null) return 'revealed';
    return 'idle';
  };

  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const [selectedLane, setSelectedLane] = useState<number | null>(state.ch1.startLane);

  // Dot animation position
  const [dotPos, setDotPos] = useState<{ x: number; y: number }>({ x: laneX(0), y: TOP_Y });
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);

  // Destination labels per lane index — only set once revealed
  const [destLabels, setDestLabels] = useState<string[] | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute destination labels given a chosen lane
  function buildDestLabels(chosenLane: number): string[] {
    const dest = computeDestination(chosenLane, bridges);
    const winnerLabel = ladder.fixedResult.shortTitle ?? ladder.fixedResult.title;
    const labels = Array(LANES).fill('');
    labels[dest] = winnerLabel;
    let loserIdx = 0;
    for (let i = 0; i < LANES; i++) {
      if (i !== dest) {
        labels[i] = loserLabels[loserIdx++];
      }
    }
    return labels;
  }

  // On mount: if already revealed (resume), populate dest labels immediately
  useEffect(() => {
    if (phase === 'revealed' && selectedLane !== null) {
      const pts = getPathPoints(selectedLane, bridges);
      setPathPoints(pts);
      setDotPos(pts[pts.length - 1]);
      setDestLabels(buildDestLabels(selectedLane));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAnimation(lane: number) {
    if (intervalRef.current) return;
    const pts = getPathPoints(lane, bridges);
    setPathPoints(pts);
    setDotPos(pts[0]);
    setPhase('animating');
    setSelectedLane(lane);

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= pts.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setDotPos(pts[pts.length - 1]);
        setTimeout(() => {
          const labels = buildDestLabels(lane);
          setDestLabels(labels);
          setPhase('revealed');
          update({ ch1: { startLane: lane, resultRevealed: true, bridges } });
          fireConfetti();
        }, 300);
      } else {
        setDotPos(pts[idx]);
      }
    }, STEP_MS);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const isAnimating = phase === 'animating';
  const isRevealed = phase === 'revealed';

  return (
    <div
      className="h-full flex flex-col items-center justify-start p-4 pt-8 relative overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 50%, #f0f9ff 100%)' }}
    >
      {/* Back button — shown in pick and revealed phases, not during animation */}
      {(phase === 'idle' || phase === 'revealed') && (
        <BackButton onClick={goBack} className="absolute top-5 left-5 z-20" />
      )}

      {/* Header */}
      <div className="w-full max-w-sm mb-4">
        <p className="font-noto text-sky-500 text-sm font-bold text-center mb-1">CHAPTER 1 · 첫 번째 활동 뽑기</p>
        <h2 className="font-jua text-2xl text-slate-700 text-center">사다리타기 🪜</h2>
        <p className="font-noto text-slate-500 text-sm text-center mt-1">
          {phase === 'idle' && '1~5번 중 하나를 골라 사다리를 타고 내려가요'}
          {phase === 'animating' && '내려가는 중...!'}
          {phase === 'revealed' && '결과가 나왔어요 🎉'}
        </p>
      </div>

      {/* SVG Ladder */}
      <svg
        viewBox="0 0 300 360"
        className="w-full max-w-sm mx-auto"
        style={{ userSelect: 'none', maxHeight: isRevealed ? 220 : undefined }}
      >
        {/* ── Vertical lanes ── */}
        {Array.from({ length: LANES }, (_, i) => (
          <line
            key={`vline-${i}`}
            x1={laneX(i)}
            y1={TOP_Y}
            x2={laneX(i)}
            y2={BOT_Y}
            stroke="#94a3b8"
            strokeWidth={2.5}
          />
        ))}

        {/* ── Bridges ── */}
        {bridges.map((row, r) =>
          row.map((hasBridge, lane) =>
            hasBridge ? (
              <line
                key={`bridge-${r}-${lane}`}
                x1={laneX(lane)}
                y1={rowY(r) + ROW_H * 0.5}
                x2={laneX(lane + 1)}
                y2={rowY(r) + ROW_H * 0.5}
                stroke="#64748b"
                strokeWidth={2.5}
              />
            ) : null
          )
        )}

        {/* ── Chosen path polyline ── */}
        {pathPoints.length > 0 && (
          <polyline
            points={pathPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={3}
            opacity={isRevealed ? 1 : 0.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* ── Top lane picker circles ── */}
        {Array.from({ length: LANES }, (_, i) => {
          const isPicked = selectedLane === i;
          return (
            <g
              key={`top-${i}`}
              style={{ cursor: phase === 'idle' ? 'pointer' : 'default' }}
              onClick={() => phase === 'idle' && startAnimation(i)}
            >
              <circle
                cx={laneX(i)}
                cy={22}
                r={18}
                fill={isPicked ? '#0ea5e9' : '#e0f2fe'}
                stroke={isPicked ? '#0284c7' : '#bae6fd'}
                strokeWidth={1.5}
              />
              <text
                x={laneX(i)}
                y={27}
                textAnchor="middle"
                fontSize={13}
                fontFamily="Jua, sans-serif"
                fill={isPicked ? '#fff' : '#38bdf8'}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* ── Bottom destination boxes ── */}
        {Array.from({ length: LANES }, (_, i) => {
          const cx = laneX(i);
          const winnerLabel = ladder.fixedResult.shortTitle ?? ladder.fixedResult.title;
          const isWinner = destLabels !== null && destLabels[i] === winnerLabel;
          const label = destLabels ? destLabels[i] : '?';
          const isUserDest =
            selectedLane !== null &&
            isRevealed &&
            computeDestination(selectedLane, bridges) === i;

          return (
            <g key={`dest-${i}`}>
              <rect
                x={cx - 26}
                y={318}
                width={52}
                height={28}
                rx={6}
                fill={
                  !isRevealed
                    ? '#f0f9ff'
                    : isUserDest && isWinner
                    ? '#0ea5e9'
                    : 'rgba(255,255,255,0.7)'
                }
                stroke={
                  !isRevealed
                    ? '#bae6fd'
                    : isUserDest && isWinner
                    ? '#0284c7'
                    : '#94a3b8'
                }
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={336}
                textAnchor="middle"
                fontSize={isRevealed && !isWinner ? 8 : 10}
                fontFamily="Noto Sans KR, sans-serif"
                fill={isRevealed && isUserDest && isWinner ? '#fff' : '#64748b'}
              >
                {isRevealed ? truncate(label, 5) : '?'}
              </text>
            </g>
          );
        })}

        {/* ── Animated dot ── */}
        {(isAnimating || isRevealed) && selectedLane !== null && (
          <motion.circle
            cx={dotPos.x}
            cy={dotPos.y}
            r={9}
            fill="#0ea5e9"
            stroke="white"
            strokeWidth={2}
            animate={{ cx: dotPos.x, cy: dotPos.y }}
            transition={{ duration: 0.15, ease: 'linear' }}
          />
        )}
      </svg>

      {/* ── Result card (post-reveal) ── */}
      {isRevealed && destLabels && (
        <motion.div
          className="w-full max-w-sm mt-4 bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/80"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 160 }}
        >
          <div className="p-5 pb-4" style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}>
            <p className="font-noto text-sky-400 text-xs tracking-widest mb-1">RESULT ✨</p>
            <h3 className="font-jua text-xl text-slate-700">
              {ladder.fixedResult.title} 확정! 🎉
            </h3>
          </div>
          <div className="p-5">
            {ladder.fixedResult.desc && (
              <p className="font-noto text-slate-600 text-sm leading-relaxed mb-4">
                {ladder.fixedResult.desc}
              </p>
            )}
            {ladder.fixedResult.shopName && (
              <p className="font-noto text-slate-600 text-sm mb-1">
                📍 {ladder.fixedResult.shopName}
                {ladder.fixedResult.theme ? ` — ${ladder.fixedResult.theme}` : ''}
              </p>
            )}
            {ladder.fixedResult.time && (
              <p className="font-noto text-slate-500 text-sm mb-4">
                ⏰ {ladder.fixedResult.time}
              </p>
            )}
            {state.chapter !== 'ch1-result' && (
              <button
                onClick={() => advance('ch1-result')}
                className="w-full font-jua text-xl text-white py-4 rounded-2xl shadow-md active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
              >
                {ladder.fixedResult.title} 하러 가기 →
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Ch1Intro ────────────────────────────────────────────────────────────────
function Ch1Intro({ onStart, goBack }: { onStart: () => void; goBack: () => void }) {
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
        {/* 카드 헤더 */}
        <div
          className="rounded-t-3xl p-6 pb-5 text-center"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
        >
          <p className="font-noto text-white/70 text-sm tracking-widest mb-1">CHAPTER 1</p>
          <p className="font-jua text-2xl text-white mb-1">첫 번째 활동 뽑기</p>
          <p className="font-noto text-white/80 text-sm">사다리타기 🪜</p>
        </div>

        {/* 카드 바디 */}
        <div className="bg-white/70 backdrop-blur-md rounded-b-3xl p-6 shadow-xl border border-white/80 border-t-0">
          <p className="font-noto text-slate-600 text-sm leading-relaxed mb-5">
            사다리타기로 오늘의 <span className="text-sky-500 font-bold">첫 번째 활동</span>이 결정돼요.<br /><br />
            1~5번 중 하나를 골라 사다리를 타고 내려가면 활동이 공개됩니다. 뭐가 나올지는 아무도 몰라요! 🤫
          </p>

          <motion.button
            onClick={onStart}
            whileTap={{ scale: 0.95 }}
            className="w-full font-jua text-xl text-white py-4 rounded-2xl shadow-md"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
          >
            사다리 타러 가기 →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Chapter1 (root export) ──────────────────────────────────────────────────
export default function Chapter1({ state, update, advance, goBack }: ScreenProps) {
  // 이미 사다리를 탄 경우엔 인트로 스킵
  const [showIntro, setShowIntro] = useState(state.ch1.startLane === null);

  if (state.chapter === 'ch1-result') {
    return <EscapeResult state={state} update={update} advance={advance} goBack={goBack} />;
  }
  if (showIntro) {
    return <Ch1Intro onStart={() => setShowIntro(false)} goBack={goBack} />;
  }
  return <LadderGame state={state} update={update} advance={advance} goBack={goBack} />;
}
