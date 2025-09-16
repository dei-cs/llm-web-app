'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

type Role = 'system' | 'user' | 'assistant';
type Message = { role: Role; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content:
        'You are a helpful assistant. Keep replies brief unless asked for detail.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const userText = input.trim();
    if (!userText || isStreaming) return;

    const nextMessages = [...messages, { role: 'user' as const, content: userText }];
    setMessages(nextMessages);
    setInput('');
    setIsStreaming(true);

    try {
      // Start request
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || 'Network error');
      }

      // Create a placeholder assistant message we’ll stream tokens into
      let assistant = { role: 'assistant' as const, content: '' };
      setMessages((prev) => [...prev, assistant]);

      // Read SSE: lines begin with "data: ..."
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const payload = trimmed.slice(5).trim(); // after "data:"
          if (payload === '[DONE]') {
            break;
          }

          try {
            const json = JSON.parse(payload);
            const token = json.choices?.[0]?.delta?.content ?? '';
            if (token) {
              assistant = { ...assistant, content: assistant.content + token };
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = assistant;
                return copy;
              });
            }
          } catch {
            // ignore non-JSON keep-alives
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={viewportRef}
        className="h-[60vh] overflow-auto rounded-2xl border bg-white p-4 shadow-sm"
      >
        {messages
          .filter((m) => m.role !== 'system')
          .map((m, i) => (
            <div
              key={i}
              className={clsx(
                'mb-3 rounded-xl px-3 py-2 whitespace-pre-wrap',
                m.role === 'user'
                  ? 'bg-neutral-100 self-end'
                  : 'bg-blue-50'
              )}
            >
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                {m.role}
              </div>
              <div className="text-sm">{m.content}</div>
            </div>
          ))}
        {isStreaming && (
          <div className="text-xs text-neutral-500 animate-pulse">thinking…</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2 shadow-sm outline-none focus:ring"
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
        />
        <button
          className="rounded-xl bg-black px-4 py-2 text-white shadow-sm disabled:opacity-50"
          disabled={isStreaming || !input.trim()}
        >
          Send
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
