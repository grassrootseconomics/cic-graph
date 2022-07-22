import fp from 'fastify-plugin'
import { GraphQLClient } from 'graphql-request'
import { FastifyPluginAsync } from 'fastify'

interface HasuraPluginOptions {
  endpoint: string
  backendToken: string
}

interface AuthVariables {
  address: string
}

interface AuthReponse {
  accounts: Array<{
    id: number
    user_identifier: number
    user: {
      activated: boolean
    }
  }>
}

declare module 'fastify' {
  interface FastifyInstance {
    hasura: {
      graphql: (query: string, variables: AuthVariables) => Promise<AuthReponse>
    }
  }
}

const hasuraPlugin: FastifyPluginAsync<HasuraPluginOptions> = async (fastify, options) => {
  if (!options.backendToken || !options.endpoint) {
    throw new Error('Missing required Hasura plugin options')
  }

  const graphqlClient = new GraphQLClient(options.endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.backendToken}`,
    },
  })

  fastify.decorate('hasura', {
    graphql: async (query: string, variables: string) => {
      try {
        const hasuraResponse = await graphqlClient.request(query, variables)

        if (hasuraResponse.length === 0) {
          fastify.log.error('Invalid response from Hasura endpoint')
        }

        return hasuraResponse
      } catch (err) {
        fastify.log.error(err)
      }
    },
  })
}

export default fp(hasuraPlugin, '4.x')
