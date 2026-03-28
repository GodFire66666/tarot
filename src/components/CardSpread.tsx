import { useState } from 'react';
import type { DrawnCard, TarotCard } from '../types/tarot';
import styles from './CardSpread.module.css';

interface CardSpreadProps {
  cards: DrawnCard[];
  flippedSet: Set<number>;
  onFlip: (index: number) => void;
}

/** 根据牌类型返回符号、颜色 */
function getCardVisual(card: TarotCard) {
  if (card.arcana === 'major') {
    return { symbol: '✧', label: String(card.id).padStart(2, '0'), color1: '#C9A84C', color2: '#6B4FA0' };
  }
  switch (card.suit) {
    case 'wands':
      return { symbol: '🜂', label: '♣', color1: '#C9A84C', color2: '#8B4513' };
    case 'cups':
      return { symbol: '🜄', label: '♥', color1: '#5B8FB9', color2: '#2E4057' };
    case 'swords':
      return { symbol: '🜁', label: '♠', color1: '#9CA3AF', color2: '#374151' };
    case 'pentacles':
      return { symbol: '🜃', label: '♦', color1: '#C9A84C', color2: '#2D5016' };
    default:
      return { symbol: '☽', label: '', color1: '#C9A84C', color2: '#6B4FA0' };
  }
}

/** 牌面 SVG 插画占位 */
function CardPlaceholder({ card }: { card: TarotCard }) {
  const { symbol, label, color1, color2 } = getCardVisual(card);
  return (
    <div className={styles.cardPlaceholder} style={{ background: `linear-gradient(160deg, ${color2} 0%, #1a1535 50%, ${color2} 100%)` }}>
      <span className={styles.placeholderLabel}>{label}</span>
      <span className={styles.placeholderSymbol} style={{ color: color1 }}>{symbol}</span>
      <span className={styles.placeholderName}>{card.name}</span>
      <span className={styles.placeholderNameEn}>{card.nameEn}</span>
    </div>
  );
}

export default function CardSpread({ cards, flippedSet, onFlip }: CardSpreadProps) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const handleImgError = (index: number) => {
    setImgErrors((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  return (
    <div className={styles.spread}>
      {cards.map((drawn, index) => {
        const isFlipped = flippedSet.has(index);
        const hasImgError = imgErrors.has(index);

        return (
          <div key={index} className={styles.cardSlot}>
            {drawn.position && (
              <p className={styles.position}>{drawn.position}</p>
            )}
            <div
              className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
              onClick={() => !isFlipped && onFlip(index)}
              role="button"
              tabIndex={0}
              aria-label={isFlipped ? drawn.card.name : '点击翻牌'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  !isFlipped && onFlip(index);
                }
              }}
            >
              <div className={styles.cardInner}>
                {/* 牌背 */}
                <div className={styles.cardBack}>
                  <div className={styles.cardBackPattern}>
                    <div className={styles.cardBackSymbol}>✦</div>
                  </div>
                </div>

                {/* 牌面 */}
                <div className={styles.cardFront}>
                  {hasImgError ? (
                    <CardPlaceholder card={drawn.card} />
                  ) : (
                    <img
                      src={drawn.card.image}
                      alt={drawn.card.name}
                      className={styles.cardImage}
                      loading="lazy"
                      onError={() => handleImgError(index)}
                    />
                  )}
                  <p className={styles.cardName}>
                    {drawn.card.name}
                    {drawn.isReversed && (
                      <span className={styles.reversed}> (逆位)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
