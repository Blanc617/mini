export type RouletteKind = 'night' | 'hat' | 'props' | 'daiso';

export interface RouletteSlot {
  id: string;
  label: string;
  kind: RouletteKind;
  photo: boolean;
  hasWinner: boolean;
  mission: string;
  placeName: string;
  mapUrl: string;
  color: string;
}

export const rouletteSlots: RouletteSlot[] = [
  { id: 'night',  label: '🌃 야경',   kind: 'night', photo: true,  hasWinner: false, mission: '야경 배경으로 인생샷 3장 + 올해 소원 하나를 소리 내어 말하기', placeName: '', mapUrl: '', color: '#6366f1' },
  { id: 'hat',    label: '🧢 모자',   kind: 'hat',   photo: true,  hasWinner: true,  mission: '소품샵에서 서로에게 어울리는 모자를 골라 씌워주고 웃긴 사진 찍기. 사진을 앱에 올리면 GPT가 더 웃긴 컷을 판정 — 승자가 소원권 획득!', placeName: '', mapUrl: '', color: '#f59e0b' },
  { id: 'props',  label: '🛒 소품샵', kind: 'props', photo: true,  hasWinner: true,  mission: '상대방에게 웃긴 액세서리(모자·머리핀 등) 골라 씌우고 사진 찍기 → GPT 판정 승자가 소원권!', placeName: '', mapUrl: '', color: '#ec4899' },
  { id: 'daiso1', label: '🛍️ 다이소', kind: 'daiso', photo: false, hasWinner: false, mission: '각자에게 어울리는 물건을 5천원 이내로 골라주고, 이유도 말하기', placeName: '', mapUrl: '', color: '#10b981' },
  { id: 'daiso2', label: '🛍️ 다이소', kind: 'daiso', photo: false, hasWinner: false, mission: '각자에게 어울리는 물건을 5천원 이내로 골라주고, 이유도 말하기', placeName: '', mapUrl: '', color: '#f97316' },
];
