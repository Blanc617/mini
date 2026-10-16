export interface Restaurant {
  id: string;
  menu: string;
  emoji: string;
  name: string;
  intro: string;
  mapUrl: string;
  imageUrl?: string;
  imageUrls?: string[];
  recommended?: string[];
  rating?: string;
  reviewCount?: string;
  tagline?: string;
  hours?: string;
}

// 어떤 캡슐을 뽑아도 항상 이 결과가 나온다
export const fixedRestaurant: Restaurant = {
  id: 'fixed',
  menu: '파스타 & 피자',
  emoji: '🍝',
  name: '슬로우파크',
  intro: '종로구',
  recommended: ['풍기 피자', '상하이 파스타'],
  mapUrl: 'https://map.naver.com/p/entry/place/33875115?c=15.00,0,0,0,dh&placePath=%2Fhome%3Ffrom%3Dmap%26fromPanelNum%3D1%26additionalHeight%3D76%26timestamp%3D202610161849%26locale%3Dko%26svcName%3Dmap_pcv5',
  imageUrls: ['/slowpark1.png', '/slowpark2.png', '/slowpark3.png'],
  rating: '4.7',
  reviewCount: '리뷰 200+',
  tagline: '조용하고 감성적인 이탈리안 다이닝',
  hours: '매일 11:30 - 22:00 (브레이크 15:00 - 17:00)',
};

// 캡슐 색깔만 다르게 보여주기 위한 더미 목록 (실제 결과에는 사용되지 않음)
export const restaurants: Restaurant[] = [
  { id: 'r1', menu: '떡볶이', emoji: '🌶️', name: '', intro: '', mapUrl: '' },
  { id: 'r2', menu: '떡볶이', emoji: '🌶️', name: '', intro: '', mapUrl: '' },
  { id: 'r3', menu: '파스타', emoji: '🍝', name: '', intro: '', mapUrl: '' },
  { id: 'r4', menu: '파스타', emoji: '🍝', name: '', intro: '', mapUrl: '' },
  { id: 'r5', menu: '마라샹궈', emoji: '🥘', name: '', intro: '', mapUrl: '' },
  { id: 'r6', menu: '마라샹궈', emoji: '🥘', name: '', intro: '', mapUrl: '' },
  { id: 'r7', menu: '닭갈비', emoji: '🍗', name: '', intro: '', mapUrl: '' },
  { id: 'r8', menu: '닭갈비', emoji: '🍗', name: '', intro: '', mapUrl: '' },
];
