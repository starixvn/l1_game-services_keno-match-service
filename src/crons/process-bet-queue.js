import { helpers } from "sc-common";
import { Core } from "sc-game-base";

export class ProcessBetQueue extends Core.Crons.ProcessBetQueue {
    composeBettingTimeValidationCriteria(roundId) {
        return [
            {
                failure: roundId !== this.gameData.roundId,
                notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
            },
            {
                failure:
                    !(
                        this.gameData.remainingTime >= this.definition.durations.lockingBet &&
                        this.gameData.remainingTime < this.definition.durations.placingBets
                    ) ||
                    !(
                        this.gameData.remainingTime >= this.definition.durations.halfTimeLockingBet &&
                        this.gameData.remainingTime < this.definition.durations.halfTimePlacingBets
                    ),
                notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
            },
        ];
    }
}
