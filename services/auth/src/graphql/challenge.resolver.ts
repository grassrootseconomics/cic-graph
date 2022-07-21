import { generateNonce } from 'siwe'
import { IFieldResolver, MercuriusContext } from 'mercurius'

export const getChallenge: IFieldResolver<unknown, MercuriusContext, { address: string }> = async (
  _root,
  args,
  ctx,
) => {
  const { app } = ctx
  const { address } = args

  const challenge = generateNonce()
  await app.redis.set(address, challenge, 'EX', 120)

  return {
    challenge: challenge,
  }
}
