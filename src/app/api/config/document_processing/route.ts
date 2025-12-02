import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const apiKey = process.env.BACKEND_API_KEY;
  const baseUrl = process.env.BACKEND_API_URL;

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: 'Backend configuration missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`${baseUrl}/v1/config/document_processing`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch document processing config' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const apiKey = process.env.BACKEND_API_KEY;
  const baseUrl = process.env.BACKEND_API_URL;
  const body = await request.json();

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: 'Backend configuration missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`${baseUrl}/v1/config/document_processing/chunking`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to update document processing config' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
  }
}
