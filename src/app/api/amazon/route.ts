import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const query = searchParams.get('query');
  const id = searchParams.get('id');
  const token = searchParams.get('token');
  const customApiUrl = searchParams.get('api_url') || 'https://amz.dezalty.com';

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Authorization token is required' }, { status: 400 });
  }

  // Normalize target URL paths
  const base = customApiUrl.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  let targetUrl = `${base}/${path}`;
  
  const params = new URLSearchParams();
  if (query) {
    params.set('query', query);
    params.set('type', 'track');
  }
  if (id) {
    params.set('id', id);
  }

  const queryString = params.toString();
  if (queryString) {
    targetUrl += `?${queryString}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 60 } // cache for 60 seconds
    });

    if (response.status === 401 || response.status === 403 || response.status === 422) {
      return NextResponse.json(
        { error: 'Invalid, expired, or unauthorized access token. Please update your API token in settings.' },
        { status: response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Amazon Music API returned status code ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error;
    console.error('API proxy communication failure:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to the external Amazon Music API' },
      { status: 500 }
    );
  }
}
