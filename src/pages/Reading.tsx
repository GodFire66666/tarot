import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTarotReading } from '../hooks/useTarotReading';
import CardSpread from '../components/CardSpread';
import ReadingResult from '../components/ReadingResult';
import AIReading from '../components/AIReading';
import styles from './Reading.module.css';

interface ReadingState {
  spread: 'single' | 'three-card';
  question: string;
}

export default function Reading() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReadingState | null;
  const { result, drawCards } = useTarotReading();
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
      return;
    }
    drawCards(state.spread, state.question);
  }, [state, drawCards, navigate]);

  if (!result) return null;

  const allFlipped = flippedSet.size === result.cards.length;

  const handleFlip = (index: number) => {
    setFlippedSet((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleRestart = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.reading}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {result.spread === 'single' ? '今日指引' : '过去 · 现在 · 未来'}
        </h1>
        {result.question && (
          <p className={styles.question}>「{result.question}」</p>
        )}
        <p className={styles.hint}>
          {allFlipped ? '所有牌已揭示，请查看解读' : '点击牌背揭示你的命运'}
        </p>
      </header>

      <CardSpread
        cards={result.cards}
        flippedSet={flippedSet}
        onFlip={handleFlip}
      />

      {allFlipped && <ReadingResult cards={result.cards} />}

      {allFlipped && (
        <AIReading cards={result.cards} question={result.question} />
      )}

      <footer className={styles.footer}>
        <button className={styles.restartBtn} onClick={handleRestart}>
          再次占卜
        </button>
      </footer>
    </div>
  );
}
