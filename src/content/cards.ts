export type CardType = 'wish' | 'penalty';

export interface Card {
  id: string;
  type: CardType;
  title: string;
  desc: string;
  target?: 'jinu' | 'mini';
  emoji: string;
}

export const cards: Card[] = [
  { id: 'wish-delivery', type: 'wish',    emoji: '🍜', title: '배달 쏘기권',         desc: '미니가 정한 배달 음식 1회, 언제 어디서든 지누가 쏜다!' },
  { id: 'wish-massage',  type: 'wish',    emoji: '💆', title: '안마권',              desc: '지누가 15분 안마해줌' },
  { id: 'wish-date',     type: 'wish',    emoji: '📍', title: '다음 데이트 코스 짜기', desc: '다음 데이트 장소나 메뉴 등 데이트 코스를 지누가 100% 정한다' },
  { id: 'wish-any',      type: 'wish',    emoji: '✨', title: '아무 때나 소원 1회',   desc: '지누가 실행할 수 있는 범위 안에서 소원 하나' },
  { id: 'penalty-jinu',  type: 'penalty', emoji: '😈', title: '지누가 10분간 존댓말 쓰기', desc: '지금부터 10분간 지누가 존댓말을 써요', target: 'jinu' },
  { id: 'penalty-mini',  type: 'penalty', emoji: '😈', title: '미니의 애교 3종 세트',  desc: '어떤 애교로 할지는 미니가 정해요', target: 'mini' },
];
