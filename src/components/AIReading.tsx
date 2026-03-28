import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { DrawnCard } from '../types/tarot';
import { useAIReading } from '../hooks/useAIReading';
import styles from './AIReading.module.css';

interface AIReadingProps {
  cards: DrawnCard[];
  question: string;
}

export default function AIReading({ cards, question }: AIReadingProps) {
  const { loading, content, error, done, startReading } = useAIReading();
  const hasStarted = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 组件挂载时自动触发
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startReading(cards, question);
    }
  }, [cards, question, startReading]);

  // 流式输出时自动滚动到底部
  useEffect(() => {
    if (content && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [content]);

  const handleRetry = () => {
    startReading(cards, question);
  };

  // 加载中且无内容
  if (loading && !content) {
    return (
      <section className={styles.aiReading}>
        <h2 className={styles.title}>命运的启示</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingOrb}>
            <div className={styles.orbInner} />
          </div>
          <p className={styles.loadingText}>命运正在揭示...</p>
        </div>
      </section>
    );
  }

  // 错误状态
  if (error && !content) {
    return (
      <section className={styles.aiReading}>
        <h2 className={styles.title}>命运的启示</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>
            占卜师暂时无法回应... {error}
          </p>
          <button className={styles.retryBtn} onClick={handleRetry}>
            再次感应
          </button>
        </div>
      </section>
    );
  }

  // 有内容（流式输出中或已完成）
  if (content) {
    return (
      <section className={styles.aiReading}>
        <h2 className={styles.title}>命运的启示</h2>
        <div className={styles.contentCard} ref={contentRef}>
          <div className={styles.content}>
            <ReactMarkdown>{content}</ReactMarkdown>
            {loading && <span className={styles.cursor}>|</span>}
          </div>
          {error && (
            <div className={styles.errorInline}>
              <p>输出中断：{error}</p>
              <button className={styles.retryBtn} onClick={handleRetry}>
                重试
              </button>
            </div>
          )}
        </div>
        {done && (
          <p className={styles.doneHint}>✦ 占卜完成</p>
        )}
      </section>
    );
  }

  return null;
}
