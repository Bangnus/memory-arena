import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AuthSessionManager } from '@/lib/auth-store';

interface ILineTokenResponse {
  access_token: string;
}

interface ILineProfileResponse {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || 'default_session_1';
  const error = searchParams.get('error');

  if (error || !code) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Login Canceled</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: white;">
        <h2 style="color: #ef4444;">Login Canceled</h2>
        <p>${error || 'No authorization code provided'}</p>
      </body>
      </html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Parse state: format is `${sessionId}_${role}`
  const stateParts = state.split('_');
  const role = stateParts[stateParts.length - 1] || '1';
  const sessionId = stateParts.slice(0, -1).join('_') || 'default_session';

  const channelId = process.env.LINE_CHANNEL_ID || process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '2010838428';
  const channelSecret = process.env.LINE_CHANNEL_SECRET || '8e6f53add73499c477c5e585f4b2d168';
  const gatewayOrigin = new URL(request.url).origin;
  const callbackUrl = process.env.LINE_CALLBACK_URL || `${gatewayOrigin}/api/auth/line/callback`;

  try {
    let lineProfile: {
      userId: string;
      displayName: string;
      pictureUrl?: string;
    };

    if (code.startsWith('mock_')) {
      const mockId = code.replace('mock_', '') || 'player_1';
      lineProfile = {
        userId: `line_user_${mockId}`,
        displayName: `Player ${mockId.toUpperCase()}`,
        pictureUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${mockId}`,
      };
    } else {
      // Exchange code for token
      const tokenResponse = await axios.post<ILineTokenResponse>(
        'https://api.line.me/oauth2/v2.1/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: callbackUrl,
          client_id: channelId,
          client_secret: channelSecret,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Fetch user profile
      const profileResponse = await axios.get<ILineProfileResponse>(
        'https://api.line.me/v2/profile',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      lineProfile = {
        userId: profileResponse.data.userId,
        displayName: profileResponse.data.displayName,
        pictureUrl: profileResponse.data.pictureUrl,
      };
    }

    // Save profile to AuthSessionManager so Desktop App can poll it!
    AuthSessionManager.setPlayer(sessionId, role, {
      lineUserId: lineProfile.userId,
      displayName: lineProfile.displayName,
      pictureUrl: lineProfile.pictureUrl || null,
    });

    const playerNumber = role === '2' ? 2 : 1;

    // Return HTML confirmation view for mobile phone
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Memory Arena - Player ${playerNumber}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #fb923c 100%);
          padding: 20px;
        }
        .card {
          background: #ffffff;
          border-radius: 32px;
          padding: 44px 28px;
          max-width: 380px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 4px solid #bae6fd;
          text-align: center;
          animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .title {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 15px;
          font-weight: 600;
          color: #64748b;
          margin-top: 4px;
          margin-bottom: 28px;
        }
        .avatar-wrapper {
          position: relative;
          width: 96px;
          height: 96px;
          margin: 0 auto 16px;
        }
        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 4px solid #22c55e;
          object-fit: cover;
          box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
        }
        .check-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 32px;
          height: 32px;
          background: #22c55e;
          border: 3px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .player-name {
          font-size: 18px;
          font-weight: 800;
          color: #0284c7;
          margin-bottom: 16px;
        }
        .ready-heading {
          font-family: 'Orbitron', sans-serif;
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 6px;
        }
        .subtext {
          font-size: 15px;
          font-weight: 600;
          color: #475569;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1 class="title">Player ${playerNumber}</h1>
        <div class="subtitle">LINE Authentication Success</div>
        
        ${
          lineProfile.pictureUrl
            ? `
          <div class="avatar-wrapper">
            <img src="${lineProfile.pictureUrl}" alt="${lineProfile.displayName}" class="avatar" />
            <div class="check-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
          <div class="player-name">${lineProfile.displayName}</div>
        `
            : `
          <div style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid #22c55e; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="player-name">${lineProfile.displayName}</div>
        `
        }

        <div class="ready-heading">You are Ready!</div>
        <div class="subtext">Please look at the main screen to start the battle.</div>
      </div>
    </body>
    </html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err: any) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Login Error</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: white;">
        <h2 style="color: #ef4444;">Login Error</h2>
        <p>${err?.message || 'Failed to authenticate with LINE'}</p>
      </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
