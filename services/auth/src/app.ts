import Redis from 'ioredis'
import Fastify from 'fastify'
import mercurius from 'mercurius'
import fastifyJwt from '@fastify/jwt'
import fastifyRedis from '@fastify/redis'
import mercuriusValidation from 'mercurius-validation'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

import { config } from './config'
import * as graphql from './graphql/graphql'
import hasuraPlugin from './plugins/hasura'

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  connectTimeout: 1000,
  maxRetriesPerRequest: 2,
  db: config.redis.db,
})

const app = Fastify({
  logger: {
    base: null,
  },
}).withTypeProvider<TypeBoxTypeProvider>()

async function startServer() {
  app.register(fastifyRedis, { client: redisClient })
  app.register(fastifyJwt, {
    secret: {
      private: config.jwt.private,
      public: config.jwt.public,
    },
    sign: {
      algorithm: 'EdDSA',
      expiresIn: config.jwt.expiry,
      iss: 'https://auth.grassecon.org',
    },
  })

  app.register(hasuraPlugin, {
    endpoint: config.hasura.endpoint,
    backendToken: config.hasura.backendToken,
  })

  app.register(mercurius, {
    schema: graphql.schema,
    resolvers: graphql.resolvers,
    graphiql: true,
  })

  app.register(mercuriusValidation)

  await app.ready()
  await app.listen({ port: config.server.port })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await app.close()
      return process.exit(0)
    })
  }
}

startServer()
