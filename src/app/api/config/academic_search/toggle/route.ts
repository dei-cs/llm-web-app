import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const apiKey = process.env.BACKEND_API_KEY;
  const baseUrl = process.env.BACKEND_API_URL;
  const body = await request.json();

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: 'Backend configuration missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`${baseUrl}/v1/config/academic_search/toggle?enabled=${body.enabled}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to toggle academic search' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
  }
}
