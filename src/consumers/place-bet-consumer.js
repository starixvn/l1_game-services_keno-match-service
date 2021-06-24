import { helpers } from "sc-common";
import { Core } from "sc-game-base";

import { inRunningChoices, preLiveChoices } from "../constants";

export class PlaceBetConsumer extends Core.BaseEventConsumers.PlaceBetConsumer {
    composeBettingTimeValidationCriteria(roundId) {
        const configs = this.gameData.gameConfigs;

        return [
            {
                failure: !configs.enabled,
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
            {
                failure: roundId !== this.gameData.roundId,
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet, { gameRoundId: roundId }),
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
                notice: this.getNoticeObj(helpers.noticeHelper.placeBetNextRound),
            },
        ];
    }

    composeBetChoiceValidationCriteria(betChoice) {
        const baseCriteria = super.composeBetChoiceValidationCriteria(betChoice);

        const criteria = [
            {
                failure:
                    this.gameData.remainingTime >= this.definition.durations.lockingBet &&
                    this.gameData.remainingTime < this.definition.durations.placingBets &&
                    !inRunningChoices.includes(betChoice),
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
            {
                failure:
                    this.gameData.remainingTime >= this.definition.durations.halfTimeLockingBet &&
                    this.gameData.remainingTime < this.definition.durations.halfTimePlacingBets &&
                    !preLiveChoices.includes(betChoice),
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
        ];

        return baseCriteria.concat(criteria);
    }
}
