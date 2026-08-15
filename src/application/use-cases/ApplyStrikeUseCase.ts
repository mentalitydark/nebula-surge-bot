import { UseCaseInterface } from "@/application/contracts";

export enum StrikeAction {
  ADD_STRIKE,
  REMOVE_STRIKE,
  BAN,
  NOTHING
}

interface ApplyStrikeUseCaseInput {
  strikeCurrentLevel: number;
  strikeMaxLevel: number;
  increment: boolean;
}

export class ApplyStrikeUseCase implements UseCaseInterface<ApplyStrikeUseCaseInput, StrikeAction> {

  public execute(input: ApplyStrikeUseCaseInput): StrikeAction {
    const { strikeCurrentLevel, strikeMaxLevel, increment } = input;

    const nextStrikeLevel = increment ? strikeCurrentLevel + 1 : strikeCurrentLevel - 1;

    if (nextStrikeLevel > strikeMaxLevel) {
      return StrikeAction.BAN;
    }

    if (nextStrikeLevel < 0) {
      return StrikeAction.NOTHING;
    }

    if (increment) {
      return StrikeAction.ADD_STRIKE;
    }

    return StrikeAction.REMOVE_STRIKE;
  }

}