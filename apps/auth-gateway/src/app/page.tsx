export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        color: '#ffffff',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            fontSize: '13px',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '999px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              background: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 10px #22c55e',
            }}
          />
          GATEWAY OPERATIONAL
        </div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            marginBottom: '10px',
            background: 'linear-gradient(to right, #38bdf8, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Memory Arena Auth Gateway
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          This serverless relay handles zero-config LINE OAuth authentications for standalone Memory Arena installations worldwide.
        </p>

        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#94a3b8',
            textAlign: 'left',
          }}
        >
          <div>⚡ Status: 200 OK</div>
          <div>☁️ Relay: Active (Vercel Serverless)</div>
          <div>🔒 TLS: HTTPS Enforced</div>
        </div>
      </div>
    </main>
  );
}
