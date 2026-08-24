import { NextRequest, NextResponse } from 'next/server';
import { AuthSessionManager } from '@/lib/auth-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const role = searchParams.get('role');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (!sessionId || !role) {
    return NextResponse.json(
      { success: false, message: 'Missing sessionId or role' },
      { status: 400, headers }
    );
  }

  const player = AuthSessionManager.consumePlayer(sessionId, role);

  if (!player) {
    return NextResponse.json(
      { success: false, status: 'WAITING' },
      { status: 200, headers }
    );
  }

  return NextResponse.json(
    {
      success: true,
      status: 'READY',
      player: {
        lineUserId: player.lineUserId,
        displayName: player.displayName,
        pictureUrl: player.pictureUrl,
      },
    },
    { status: 200, headers }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
