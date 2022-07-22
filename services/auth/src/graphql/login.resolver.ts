import { SiweMessage } from 'siwe'
import { gql } from 'graphql-request'
import Mercurius, { IFieldResolver, MercuriusContext } from 'mercurius'

const fetchUserDetails = gql`
  query UserDetails($address: String!) {
    accounts(where: { blockchain_address: { _eq: $address } }) {
      id
      user_identifier
      user {
        activated
      }
    }
  }
`

export const login: IFieldResolver<
  unknown,
  MercuriusContext,
  { message: string; signature: string; address: string }
> = async (_root, args, ctx) => {
  const { app } = ctx
  const { message, signature, address } = args

  const addressChallenge = await app.redis.get(address)
  const signedMessage = new SiweMessage(message)

  if (addressChallenge) {
    try {
      const verificationResult = await signedMessage.verify({
        signature: signature,
        nonce: addressChallenge,
      })

      if (verificationResult.data.address === address) {
        const getUserDetails = await app.hasura.graphql(fetchUserDetails, {
          address: address,
        })

        if (getUserDetails.accounts.length < 1) {
          return {
            status: 'Blockchain account not registered',
            token: null,
          }
        } else if (!getUserDetails.accounts[0].user.activated) {
          return {
            status: 'Account not activated',
            token: null,
          }
        }

        const jwtToken = await app.jwt.sign({
          uid: 1,
          'https://graph.grassecon.org': {
            'x-hasura-allowed-roles': ['anonymous', 'user'],
            'x-hasura-default-role': 'user',
            'x-hasura-user-id': String(getUserDetails.accounts[0].user_identifier),
            'x-hasura-account-id': String(getUserDetails.accounts[0].id),
          },
        })

        return {
          status: 'Login successful',
          token: jwtToken,
        }
      } else {
        throw new Mercurius.ErrorWithProps('Address in signature mismatch')
      }
    } catch (error) {
      app.log.error(error)
      throw new Mercurius.ErrorWithProps('Bad signature/message')
    } finally {
      await app.redis.del(address)
    }
  } else {
    throw new Mercurius.ErrorWithProps('Challenge expired')
  }
}
