import { useState, useCallback, useRef } from 'react';
import { streamAIReading } from '../services/ai';
import type { DrawnCard } from '../types/tarot';

interface AIReadingState {
  /** 是否正在请求/流式输出中 */
  loading: boolean;
  /** 累积的 AI 回复文本 */
  content: string;
  /** 错误信息 */
  error: string | null;
  /** 是否已完成输出 */
  done: boolean;
}

export function useAIReading() {
  const [state, setState] = useState<AIReadingState>({
    loading: false,
    content: '',
    error: null,
    done: false,
  });

  const abortRef = useRef<AbortController | null>(null);

  const startReading = useCallback((cards: DrawnCard[], question: string) => {
    // 取消之前的请求
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setState({ loading: true, content: '', error: null, done: false });

    streamAIReading(
      cards,
      question,
      {
        onChunk: (text) => {
          setState((prev) => ({
            ...prev,
            content: prev.content + text,
          }));
        },
        onDone: () => {
          setState((prev) => ({
            ...prev,
            loading: false,
            done: true,
          }));
        },
        onError: (error) => {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message || 'AI 解读失败，请重试',
          }));
        },
      },
      controller.signal,
    );
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  return { ...state, startReading, cancel };
}
