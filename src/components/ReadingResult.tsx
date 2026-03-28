import type { DrawnCard } from '../types/tarot';
import styles from './ReadingResult.module.css';

interface ReadingResultProps {
  cards: DrawnCard[];
}

export default function ReadingResult({ cards }: ReadingResultProps) {
  return (
    <section className={styles.results}>
      <h2 className={styles.title}>牌面解读</h2>
      <div className={styles.cardResults}>
        {cards.map((drawn, index) => (
          <article
            key={index}
            className={styles.resultCard}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <header className={styles.resultHeader}>
              {drawn.position && (
                <span className={styles.position}>{drawn.position}</span>
              )}
              <h3 className={styles.cardName}>
                {drawn.card.name}
                <span className={styles.cardNameEn}> {drawn.card.nameEn}</span>
              </h3>
              <span className={`${styles.orientation} ${drawn.isReversed ? styles.orientationReversed : ''}`}>
                {drawn.isReversed ? '逆位' : '正位'}
              </span>
            </header>

            <div className={styles.keywords}>
              {drawn.card.keywords.map((kw, i) => (
                <span key={i} className={styles.keyword}>
                  {kw}
                </span>
              ))}
            </div>

            <p className={styles.interpretation}>
              {drawn.isReversed ? drawn.card.reversed : drawn.card.upright}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
