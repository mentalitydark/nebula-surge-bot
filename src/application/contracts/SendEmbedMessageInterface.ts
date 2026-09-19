import type { SendEmbedMessageDto } from '@/application/dtos'

export interface SendEmbedMessageInterface {
  send(data: SendEmbedMessageDto): Promise<void>
}
