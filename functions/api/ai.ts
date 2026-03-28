interface Env {
  AI_API_KEY: string;
}

const TARGET_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.AI_API_KEY || 'a814c6e6-3bfd-4d04-bca6-fa1e68afdafc';

  const body = await context.request.json();
  const isStream = body?.stream === true;

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
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'AI 服务请求失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
