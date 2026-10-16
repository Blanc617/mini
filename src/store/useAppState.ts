import { useState, useEffect } from 'react';

export type Chapter = 'opening' | 'ch1' | 'ch1-result' | 'ch2' | 'ch3' | 'bonus' | 'ending';

export interface AppState {
  chapter: Chapter;
  history: Chapter[];
  ch1: { startLane: number | null; resultRevealed: boolean; bridges: boolean[][] | null };
  escapeRoom: { comment: string | null };
  ch2: { capsuleAssignment: string[]; pickedIndex: number | null; restaurantId: string | null };
  ch3: { slotId: string | null; winner: 'jinu' | 'mini' | null };
  bonus: { deck: string[]; pickedCardIds: string[] };
  ending: { photoCount: number };
}

export interface ScreenProps {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  advance: (chapter: Chapter) => void;
  goBack: () => void;
  resetState: () => void;
}

const STORAGE_KEY = 'hmd:state:v1';

const defaultState: AppState = {
  chapter: 'opening',
  history: [],
  ch1: { startLane: null, resultRevealed: false, bridges: null },
  escapeRoom: { comment: null },
  ch2: { capsuleAssignment: [], pickedIndex: null, restaurantId: null },
  ch3: { slotId: null, winner: null },
  bonus: { deck: [], pickedCardIds: [] },
  ending: { photoCount: 0 },
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppState>;
      return {
        ...defaultState,
        ...saved,
        ch1: { ...defaultState.ch1, ...(saved.ch1 ?? {}) },
        escapeRoom: { comment: (saved.escapeRoom as { comment?: string | null })?.comment ?? null },
        ch2: { ...defaultState.ch2, ...(saved.ch2 ?? {}) },
        ch3: { ...defaultState.ch3, ...(saved.ch3 ?? {}) },
        bonus: { ...defaultState.bonus, ...(saved.bonus ?? {}) },
        ending: { ...defaultState.ending, ...(saved.ending ?? {}) },
      };
    }
  } catch { /* ignore */ }
  return defaultState;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = (patch: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...patch }));
  };

  const resetState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  };

  const advance = (chapter: Chapter) => {
    setState(prev => ({ ...prev, chapter, history: [...prev.history, prev.chapter] }));
  };

  const goBack = () => {
    setState(prev => {
      if (prev.history.length > 0) {
        const history = [...prev.history];
        const chapter = history.pop()!;
        return { ...prev, chapter, history };
      }
      // history가 비어있을 때 fallback: 챕터 순서 기준으로 한 단계 앞으로
      const order: Chapter[] = ['opening', 'ch1', 'ch1-result', 'ch2', 'ch3', 'bonus', 'ending'];
      const idx = order.indexOf(prev.chapter);
      if (idx > 0) {
        return { ...prev, chapter: order[idx - 1] };
      }
      return prev;
    });
  };

  return { state, update, resetState, advance, goBack };
}
