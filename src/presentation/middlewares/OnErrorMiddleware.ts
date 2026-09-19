import { type GuardFunction } from 'discordx'
import { container } from 'tsyringe'

import { APPLICATION_TOKENS } from '@/application/container/tokens'
import { type LoggerInterface } from '@/application/contracts'

export const OnErrorMiddleware: GuardFunction = async (_, __, next) => {
  try {
    await next()
  } catch (error) {
    try {
      const isError = error instanceof Error

      const logger = container.resolve<LoggerInterface>(APPLICATION_TOKENS.LoggerInterface)

      logger.error(isError ? error : String(error))
    } catch {
      console.error('Failed to log error:', error)
    }
  }
}
