export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  image: string;
  keywords: string[];
  upright: string;
  reversed: string;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position?: string;
}

export interface ReadingResult {
  spread: 'single' | 'three-card';
  question: string;
  cards: DrawnCard[];
  timestamp: Date;
}
