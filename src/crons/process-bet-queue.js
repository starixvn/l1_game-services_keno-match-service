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

    async insertBetLog(player, roundId, bet) {
        try {
            const newBetLog = {
                uid: player.UID,
                name: player.profile.name,
                phien: roundId,
                time: new Date(),
                choice: this.definition.choicesMapper[bet.betChoice],
                amount: bet.amount,
                freeBet: bet.freeBet,
                clientSentTime: bet.clientSentTime,
                receivedTime: bet.receivedTime,
            };
    
            if (player.session) {
                newBetLog.memberId = player.session.memberId;
                newBetLog.siteId = player.session.siteId;
            }
    
            await this.betLogsRepository.create(newBetLog);
        } catch (error) {
            console.log(error);
        }    
    }
}
