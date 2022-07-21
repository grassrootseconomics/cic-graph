import { SiweMessage } from 'siwe'
import Mercurius, { IFieldResolver, MercuriusContext } from 'mercurius'

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
        await app.redis.del(address)

        // TODO: fetch UID from Graph
        const jwtToken = await app.jwt.sign({
          uid: 1,
          'grassrootseconomics.org': {
            'x-hasura-allowed-roles': ['anonymous', 'user'],
            'x-hasura-default-role': 'user',
            'x-hasura-user-id': 1,
          },
        })

        return {
          token: jwtToken,
        }
      } else {
        throw new Mercurius.ErrorWithProps('Address in signature mismatch')
      }
    } catch (error) {
      app.log.error(error)
      throw new Mercurius.ErrorWithProps('Bad signature/message')
    }
  } else {
    throw new Mercurius.ErrorWithProps('Challenge expired')
  }
}