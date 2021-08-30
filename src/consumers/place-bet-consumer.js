import { helpers, logger } from "sc-common";
import { Core } from "sc-game-base";

import { liveChoices, preLiveChoices } from "../constants";

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
                    ) &&
                    !(
                        this.gameData.remainingTime >= this.definition.durations.firstHalfLockingBet &&
                        this.gameData.remainingTime < this.definition.durations.firstHalfPlacingBets
                    ),
                notice: this.getNoticeObj(helpers.noticeHelper.placeBetNextRound),
            },
        ];
    }

    composeBetChoiceValidationCriteria(betChoice) {
        const baseCriteria = super.composeBetChoiceValidationCriteria(betChoice);
        logger.log(baseCriteria);

        const criteria = [
            {
                failure:
                    this.gameData.remainingTime >= this.definition.durations.lockingBet &&
                    this.gameData.remainingTime < this.definition.durations.placingBets &&
                    !liveChoices.includes(betChoice),
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
            {
                failure:
                    this.gameData.remainingTime >= this.definition.durations.firstHalfLockingBet &&
                    this.gameData.remainingTime < this.definition.durations.firstHalfPlacingBets &&
                    !preLiveChoices.includes(betChoice),
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
        ];

        logger.log(criteria);

        return baseCriteria.concat(criteria);
    }
}
