import { IFieldResolver, MercuriusContext } from 'mercurius'

export const smsVerify: IFieldResolver<unknown, MercuriusContext, { jwt: string }> = async (
  _root,
  _args,
  _ctx,
) => {
  return {
    success: true,
  }
}
