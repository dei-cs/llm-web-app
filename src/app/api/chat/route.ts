export const runtime = 'edge';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] };

  const apiKey = process.env.BACKEND_API_KEY || 'dev123';
  const baseUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';

  const upstream = await fetch(`${baseUrl}/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    // model is enforced server-side; no need to send it
    body: JSON.stringify({ messages, stream: true }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => 'Upstream error');
    return new Response(text, { status: upstream.status || 500 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Convert NDJSON -> SSE (OpenAI-like): { choices: [{ delta: { content } }] }
  const sse = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = '';
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            let chunk: any;
            try {
              chunk = JSON.parse(trimmed);
            } catch {
              continue;
            }

            if (chunk.error) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: chunk.error })}\n\n`)
              );
              continue;
            }

            if (chunk.done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }

            const token: string = chunk.message?.content ?? '';
            if (token) {
              const payload = { choices: [{ delta: { content: token } }] };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
              );
            }
          }
        }
        // If loop ended without an explicit done message, still end the stream.
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err: any) {
        const message = err?.message || 'Stream error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(sse, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
