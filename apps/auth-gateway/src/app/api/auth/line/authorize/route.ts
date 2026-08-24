import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || 'default_session';
  const role = searchParams.get('role') || '1';

  const channelId = process.env.LINE_CHANNEL_ID || process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '2010838428';
  const gatewayOrigin = new URL(request.url).origin;
  const callbackUrl = process.env.LINE_CALLBACK_URL || `${gatewayOrigin}/api/auth/line/callback`;

  const state = `${sessionId}_${role}`;
  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${encodeURIComponent(state)}&scope=profile%20openid`;

  return NextResponse.redirect(lineAuthUrl);
}
