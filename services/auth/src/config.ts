export const config = {
  server: {
    port: parseInt(process.env.SERVER_PORT ?? '5000'),
  },
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    db: parseInt(process.env.REDIS_DB ?? '0'),
  },
  jwt: {
    expiry: process.env.JWT_EXPIRY ?? '30d',
    public:
      process.env.JWT_PUB_KEY ??
      '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAd+J5AqpZTDZIqyxke+bUJlQ8JZ7anWB9d0ZtcV9EoLs=\n-----END PUBLIC KEY-----',
    private:
      process.env.JWT_PRIV_KEY ??
      '-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIEsykdb59fsltF97KUQyQsYIn5a9v/n5jHuxPcisJXeg\n-----END PRIVATE KEY-----',
  },
}
