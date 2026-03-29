interface Env {
  AI_API_KEY: string;
  ASSETS: Fetcher;
}

const TARGET_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

async function handleAIRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = env.AI_API_KEY || 'a814c6e6-3bfd-4d04-bca6-fa1e68afdafc';
  const body = await request.json();
  const isStream = (body as Record<string, unknown>)?.stream === true;

  try {
    const response = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(text, { status: response.status });
    }

    if (isStream && response.body) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'AI 服务请求失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API 路由：/api/ai
    if (url.pathname === '/api/ai') {
      return handleAIRequest(request, env);
    }

    // 其他请求交给静态资源
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
