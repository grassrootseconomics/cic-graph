import { IResolvers } from 'mercurius'
import mercuriusValidation from 'mercurius-validation'

import { login } from './login.resolver'
import { getChallenge } from './challenge.resolver'

const schema = `
  ${mercuriusValidation.graphQLTypeDefs}

  type Challenge {
    challenge: String!
  }

  type LoginResponse {
    status: String!
    token: String
  }

  type Query {
    login(
      message: String! @constraint(type: "string"),
      signature: String! @constraint(type: "string"),
      address: String! @constraint(type: "string", minLength: 42, maxLength: 42),
    ): LoginResponse!
  }

  type Mutation {
    getChallenge(address: String! @constraint(type: "string", minLength: 42, maxLength: 42)): Challenge!
  }
`

const resolvers: IResolvers = {
  Mutation: {
    getChallenge,
  },
  Query: {
    login,
  },
}

export { schema, resolvers }
