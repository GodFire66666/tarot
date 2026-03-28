import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = process.env.AI_API_KEY || 'a814c6e6-3bfd-4d04-bca6-fa1e68afdafc';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isStream = req.body?.stream === true;

  try {
    const response = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    // 流式响应
    if (isStream && response.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }

      res.end();
    } else {
      // 非流式响应
      const data = await response.json();
      res.status(200).json(data);
    }
  } catch (error) {
    console.error('AI proxy error:', error);
    res.status(500).json({ error: 'AI 服务请求失败' });
  }
}
