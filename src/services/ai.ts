import type { DrawnCard } from '../types/tarot';

const isDev = import.meta.env.DEV;

// 开发环境走 Vite proxy（美团内网 Anthropic），生产环境前端直连豆包 API（支持 CORS）
const DEV_API_URL = '/api/ai/v1/messages';
const PROD_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_URL = isDev ? DEV_API_URL : PROD_API_URL;

const DEV_API_KEY = '2027336794220036113';
const PROD_API_KEY = 'a814c6e6-3bfd-4d04-bca6-fa1e68afdafc';

const DEV_MODEL = 'aws.claude-opus-4.6';
const PROD_MODEL = 'doubao-seed-2-0-pro-260215';
const MODEL = isDev ? DEV_MODEL : PROD_MODEL;

/** 构造塔罗解读 prompt */
function buildPrompt(cards: DrawnCard[], question: string) {
  const cardDescriptions = cards
    .map((drawn) => {
      const orientation = drawn.isReversed ? '逆位' : '正位';
      const posLabel = drawn.position ? `【${drawn.position}】` : '';
      return `${posLabel}${drawn.card.name}（${drawn.card.nameEn}）— ${orientation}\n关键词：${drawn.card.keywords.join('、')}`;
    })
    .join('\n\n');

  const spreadType = cards.length === 1 ? '单张牌' : '三张牌（过去·现在·未来）';

  const userMessage = question
    ? `我的问题是：「${question}」\n\n牌阵类型：${spreadType}\n\n抽到的牌：\n${cardDescriptions}`
    : `我没有特定问题，请给我今日指引。\n\n牌阵类型：${spreadType}\n\n抽到的牌：\n${cardDescriptions}`;

  return userMessage;
}

const SYSTEM_PROMPT = `你是一位经验丰富、充满智慧的塔罗占卜师。你的风格温暖而神秘，善于用优美的语言传达牌面的深层含义。

请根据用户抽到的塔罗牌，给出一段**综合性的深度解读**（不是逐张分析，而是将所有牌的含义融合在一起）。

要求：
- 语言优美流畅，带有神秘感和诗意
- 如果用户有具体问题，围绕问题给出针对性建议
- 如果是三张牌阵，请将过去、现在、未来的脉络串联成一个完整的故事
- 结尾给出一句简短有力的箴言或建议
- 全程使用中文
- 控制在 300-500 字`;

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

/** 构造请求 body */
function buildRequestBody(userMessage: string) {
  if (isDev) {
    return {
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    };
  }
  return {
    model: MODEL,
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  };
}

/** 构造请求 headers */
function buildHeaders(): Record<string, string> {
  if (isDev) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEV_API_KEY}`,
      'anthropic-version': '2023-06-01',
    };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PROD_API_KEY}`,
  };
}

/** 解析 Anthropic SSE */
function parseAnthropicLine(data: string, callbacks: StreamCallbacks): boolean {
  try {
    const parsed = JSON.parse(data);
    if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
      callbacks.onChunk(parsed.delta.text);
    }
    if (parsed.type === 'message_stop') {
      callbacks.onDone();
      return true;
    }
  } catch { /* skip */ }
  return false;
}

/** 解析 OpenAI SSE */
function parseOpenAILine(data: string, callbacks: StreamCallbacks): boolean {
  if (data === '[DONE]') {
    callbacks.onDone();
    return true;
  }
  try {
    const parsed = JSON.parse(data);
    const content = parsed.choices?.[0]?.delta?.content;
    if (content) {
      callbacks.onChunk(content);
    }
    if (parsed.choices?.[0]?.finish_reason === 'stop') {
      callbacks.onDone();
      return true;
    }
  } catch { /* skip */ }
  return false;
}

/** 流式调用 AI 解读 */
export async function streamAIReading(
  cards: DrawnCard[],
  question: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
) {
  const userMessage = buildPrompt(cards, question);
  const parseLine = isDev ? parseAnthropicLine : parseOpenAILine;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(buildRequestBody(userMessage)),
      signal,
    });

    if (!response.ok) {
      throw new Error(`AI 服务请求失败 (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          const finished = parseLine(data, callbacks);
          if (finished) return;
        }
      }
    }

    callbacks.onDone();
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    callbacks.onError(err as Error);
  }
}
