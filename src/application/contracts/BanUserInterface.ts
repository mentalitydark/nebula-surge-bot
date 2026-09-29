import type { BanUserDto } from '@/application/dtos/BanUserDto'

export interface BanUserInterface {
  ban(data: BanUserDto): Promise<void>;
}
