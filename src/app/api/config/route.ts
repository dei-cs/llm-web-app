import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const apiKey = process.env.BACKEND_API_KEY;
  const baseUrl = process.env.BACKEND_API_URL;

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: 'Backend configuration missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`${baseUrl}/v1/config`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch config' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
  }
}
