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
  hasura: {
    endpoint: process.env.HASURA_ENDPOINT ?? 'http://localhost:8080/v1/graphql',
    backendToken:
      process.env.HASURA_BACKEND_TOKEN ??
      'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2dyYXBoLmdyYXNzZWNvbi5vcmciOnsieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJiYWNrZW5kIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6ImJhY2tlbmQifSwiaXNzIjoiaHR0cHM6Ly9hdXRoLmdyYXNzZWNvbi5vcmciLCJpYXQiOjE2NTg0OTgzMjMsImV4cCI6MTcyMTU3MDMyM30.QMGWKxMy8RS8YBY8sJjS2H5BdE-2WXwE4TdGk6E7fm7_BoFLm4A1r96BJ1uMydp10M6gn-s3tXAGowX5pE7gDg',
  },
}
