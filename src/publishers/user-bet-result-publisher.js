import { Core } from "sc-game-base";

export class UserBetResultPublisher extends Core.BaseEventPublishers.UserBetResultPublisher {
    async publish(userId, betResult) {
        const status = { winningByChoices: betResult.winningByChoices };

        if (betResult.totalWin + betResult.refund > 0) {
            status.win = true;
            status.bet = betResult.totalWin + betResult.refund;
        } else {
            status.win = false;
            status.bet = betResult.totalLost;
        }

        await this.publishToUser(userId, { status });
    }
}
