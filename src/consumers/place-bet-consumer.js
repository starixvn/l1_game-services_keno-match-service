import { helpers } from "sc-common";
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

        return baseCriteria.concat(criteria);
    }

    composeBetAmountValidationCriteria(player, betChoice, amount, freeBet) {
        const baseCriteria = super.composeBetAmountValidationCriteria(player, betChoice, amount, freeBet);

        if (liveChoices.includes(betChoice)) {
            const { betTracks } = this.gameData.ingame[player.profile.name] || { betTracks: {} };
            const { gameConfigs, liveOdds } = this.gameData;
            const maxBetForChoice = gameConfigs.maxbet / (liveOdds[betChoice] - 1);

            const criteria = [
                {
                    failure: amount > maxBetForChoice || betTracks[betChoice] + amount > maxBetForChoice,
                    notice: this.getNoticeObj(helpers.noticeHelper.maxBetForChoice, { maxBet: maxBetForChoice }),
                },
            ];

            return baseCriteria.concat(criteria);
        }

        return baseCriteria;
    }
}
