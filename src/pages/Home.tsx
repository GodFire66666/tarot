import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

type SpreadType = 'single' | 'three-card';

export default function Home() {
  const [question, setQuestion] = useState('');
  const navigate = useNavigate();

  const handleSelect = (spread: SpreadType) => {
    navigate('/reading', { state: { spread, question: question.trim() } });
  };

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <div className={styles.titleDecor}>◇</div>
        <h1 className={styles.title}>塔罗占卜</h1>
        <div className={styles.titleLine} />
        <p className={styles.subtitle}>探索命运的指引，聆听内心的声音</p>
      </header>

      <section className={styles.questionSection}>
        <label className={styles.questionLabel} htmlFor="question">
          你想问什么？
        </label>
        <input
          id="question"
          className={styles.questionInput}
          type="text"
          placeholder="在心中默念你的问题，也可以留空…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={100}
        />
      </section>

      <section className={styles.spreads}>
        <button
          className={styles.spreadCard}
          onClick={() => handleSelect('single')}
        >
          <div className={styles.spreadIcon}>🂠</div>
          <h2 className={styles.spreadTitle}>单张牌</h2>
          <p className={styles.spreadDesc}>今日指引</p>
          <p className={styles.spreadHint}>抽取一张牌，获得简洁的启示</p>
        </button>

        <button
          className={styles.spreadCard}
          onClick={() => handleSelect('three-card')}
        >
          <div className={styles.spreadIcon}>🂠🂠🂠</div>
          <h2 className={styles.spreadTitle}>三张牌</h2>
          <p className={styles.spreadDesc}>过去 · 现在 · 未来</p>
          <p className={styles.spreadHint}>三张牌揭示时间线上的脉络</p>
        </button>
      </section>

      <footer className={styles.footer}>
        <p>塔罗牌是一面映照内心的镜子</p>
      </footer>
    </div>
  );
}
