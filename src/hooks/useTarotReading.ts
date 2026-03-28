import { useState, useCallback } from 'react';
import { tarotCards } from '../data/cards';
import type { DrawnCard, ReadingResult } from '../types/tarot';

type SpreadType = 'single' | 'three-card';

const POSITIONS: Record<SpreadType, string[]> = {
  single: ['指引'],
  'three-card': ['过去', '现在', '未来'],
};

/** Fisher-Yates 洗牌算法 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useTarotReading() {
  const [result, setResult] = useState<ReadingResult | null>(null);

  const drawCards = useCallback((spread: SpreadType, question: string) => {
    const count = spread === 'single' ? 1 : 3;
    const positions = POSITIONS[spread];
    const shuffled = shuffle(tarotCards);
    const drawn: DrawnCard[] = shuffled.slice(0, count).map((card, i) => ({
      card,
      isReversed: Math.random() < 0.5,
      position: positions[i],
    }));

    setResult({
      spread,
      question,
      cards: drawn,
      timestamp: new Date(),
    });
  }, []);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { result, drawCards, reset };
}
