import type { SettingStrategyValue } from "#domain/strategies/SettingStrategy.js";
import { GuildSettingsKeys, Settings } from "#entities";
import { BadRequestError } from "#errors";
import { MixedSettingStrategy } from "./MixedSettingStrategy.js";

export class AutoBanVoteThresholdSettingStrategy extends MixedSettingStrategy {
  public readonly key = GuildSettingsKeys.AUTO_BAN_VOTE_THRESHOLD;
  public readonly allowMultiple = false;

  public async validate(value: SettingStrategyValue): Promise<number | null> {
    if (this.isNullOrEmpty(value)) {
      return null;
    }

    if (!this.isNumeric(value)) {
      throw new BadRequestError("O valor deve ser um número válido.");
    }

    const numericValue = Number(value);

    if (numericValue < 0) {
      throw new BadRequestError("O valor não pode ser negativo.");
    }

    return numericValue;
  }

  public apply(settings: Settings, value: SettingStrategyValue): Settings {
    if (this.isNullOrEmpty(value)) {
      return settings.delete(this.key);
    }

    return settings.set(this.key, Number(value));
  }
}