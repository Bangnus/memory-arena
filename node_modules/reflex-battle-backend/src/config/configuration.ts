export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/memory_arena?schema=public',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-memory-arena',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  line: {
    channelId: process.env.LINE_CHANNEL_ID || 'dummy-channel-id',
    channelSecret: process.env.LINE_CHANNEL_SECRET || 'dummy-channel-secret',
    callbackUrl:
      process.env.LINE_CALLBACK_URL ||
      'http://localhost:3000/api/v1/auth/line/callback',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
});
