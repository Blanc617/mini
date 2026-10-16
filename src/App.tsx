import { useRef, useState, Component } from 'react';
import type { ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const msg = (this.state.error as Error).message;
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 13, color: '#dc2626', background: '#fff', height: '100vh', overflowY: 'auto' }}>
          <b>앱 오류 발생</b><br />{msg}<br />
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#64748b', marginTop: 12 }}>
            {(this.state.error as Error).stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import { useAppState } from './store/useAppState';
import Opening from './screens/Opening';
import Chapter1 from './screens/Chapter1';
import Chapter2 from './screens/Chapter2';
import Chapter3 from './screens/Chapter3';
import Bonus from './screens/Bonus';
import Ending from './screens/Ending';
import type { Chapter } from './store/useAppState';

const CHAPTERS: Chapter[] = ['opening', 'ch1', 'ch1-result', 'ch2', 'ch3', 'bonus', 'ending'];

// 개발자 비상 메뉴 — 화면 우상단 영역을 5번 연속 탭하면 열림
function DevMenu({ onJump, onReset }: { onJump: (c: Chapter) => void; onReset: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-10"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div className="bg-white rounded-3xl p-5 w-72 shadow-2xl">
        <p className="text-center font-bold text-slate-700 mb-3">🛠 개발자 메뉴</p>
        <div className="flex flex-col gap-2 mb-4">
          {CHAPTERS.map((c) => (
            <button
              key={c}
              onClick={() => onJump(c)}
              className="text-left text-sm bg-slate-100 hover:bg-sky-50 text-slate-700 px-4 py-2 rounded-xl"
            >
              → {c}
            </button>
          ))}
        </div>
        <button
          onClick={onReset}
          className="w-full bg-red-50 text-red-500 text-sm py-2 rounded-xl border border-red-200"
        >
          전체 초기화
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { state, update, resetState, advance, goBack } = useAppState();
  const [devOpen, setDevOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Jump without pushing to history — clears history and resets that chapter's state
  const jumpTo = (c: Chapter) => {
    const patch: Parameters<typeof update>[0] = { chapter: c, history: [] };
    if (c === 'ch1') patch.ch1 = { startLane: null, resultRevealed: false, bridges: null };
    if (c === 'ch2') patch.ch2 = { capsuleAssignment: [], pickedIndex: null, restaurantId: null };
    if (c === 'ch3') patch.ch3 = { slotId: null, winner: null };
    if (c === 'bonus') patch.bonus = { deck: [], pickedCardIds: [] };
    if (c === 'ending') patch.ending = { photoCount: 0 };
    update(patch);
  };

  // 우하단 50×50 영역 5번 탭 → 개발자 메뉴
  const handleDevTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      setDevOpen(true);
    }
  };

  const screenProps = { state, update, advance, goBack, resetState };

  return (
    <div className="phone-outer">
      {/* Volume buttons (desktop only) */}
      <div className="phone-vol-btns" />

      <div className="phone-inner">
        {/* 처음부터 다시하기 버튼 — 모든 화면 우상단 */}
        <button
          onClick={() => setResetConfirmOpen(true)}
          className="fixed top-4 right-4 z-30 w-9 h-9 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-white/50 active:scale-90 transition-transform"
          aria-label="처음부터 다시하기"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 8a5.5 5.5 0 1 0 1.1-3.3" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M2.5 4v3.5H6" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 처음부터 다시하기 확인 팝업 */}
        {resetConfirmOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          >
            <div className="bg-white rounded-3xl p-6 w-72 shadow-2xl flex flex-col items-center gap-4">
              <p className="font-jua text-xl text-slate-700 text-center">처음부터 다시할까요?</p>
              <p className="font-noto text-slate-400 text-sm text-center">지금까지 진행한 내용이 모두 사라져요.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-jua text-base bg-slate-100 text-slate-500 active:scale-95 transition-transform"
                >
                  취소
                </button>
                <button
                  onClick={() => { resetState(); setResetConfirmOpen(false); }}
                  className="flex-1 py-3 rounded-2xl font-jua text-base bg-sky-500 text-white shadow-md active:scale-95 transition-transform"
                >
                  다시 시작
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 개발자 메뉴 탭 영역 (우하단 50×50) */}
        <div
          className="fixed bottom-0 right-0 w-14 h-14 z-40"
          onPointerDown={handleDevTap}
          style={{ touchAction: 'none' }}
        />

        {devOpen && (
          <DevMenu
            onJump={(c) => { jumpTo(c); setDevOpen(false); }}
            onReset={() => { resetState(); setDevOpen(false); }}
          />
        )}

        {(() => {
          switch (state.chapter) {
            case 'opening':    return <Opening {...screenProps} />;
            case 'ch1':
            case 'ch1-result': return <Chapter1 {...screenProps} />;
            case 'ch2':        return <Chapter2 {...screenProps} />;
            case 'ch3':        return <Chapter3 {...screenProps} />;
            case 'bonus':      return <Bonus {...screenProps} />;
            case 'ending':     return <Ending {...screenProps} />;
            default:           return <Opening {...screenProps} />;
          }
        })()}
      </div>
    </div>
  );
}
