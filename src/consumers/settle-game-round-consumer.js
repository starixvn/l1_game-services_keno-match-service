import { Core } from "sc-game-base";

import { firstHalfChoiceMapper, fullTimeChoiceMapper } from "../constants";
import { sumArrayObject } from "../helpers/array-helper";

export class SettleGameRoundConsumer extends Core.BaseEventConsumers.SettleGameRoundConsumer {
    async settleRound() {
        const round = await this.roundsRepository.findOne({ id: this.gameData.roundId }).exec();

        if (round) {
            this.gameData.roundId = round.id + 1;

            await this.settleBets(round);
            round.settled = true;
            await round.save();
        }
    }

    async settleBets(round) {
        const { id: roundId, fullTime, firstHalf, odds } = round;
        const bets = await this.queryBets(roundId);

        if (bets && bets.length) {
            await Promise.all(
                bets.map(async (bet) => {
                    const firstHalfBetResult = this.calculateBetResult(firstHalf.settlementResult, bet, odds, true);
                    const fullTimeBetResult = this.calculateBetResult(fullTime.settlementResult, bet, odds, false);
                    const betResult = sumArrayObject([firstHalfBetResult, fullTimeBetResult]);

                    bet.betwin = betResult.totalWin;
                    bet.refund = betResult.refund;
                    bet.thanhtoan = true;
                    bet.odds = odds;

                    await bet.save();
                    await this.callEndGame(bet, roundId, fullTime.time, betResult);

                    this.captureBetResult(bet.uid, betResult);
                    await this.userBetResultPublisher.publish(bet.uid, betResult);
                })
            );
        }

        this.roundResultPublisher.publishRoundResult({
            result: fullTime.result,
            settlementResult: fullTime.settlementResult,
            resultKey: fullTime.resultKey,
            roundId,
        });
    }

    calculateBetResult(settlementResult, bet, odds, isFirstHalf) {
        const betResult = Object.entries(settlementResult).reduce(
            (result, [choice, win]) => {
                const specificChoices = this.getSpecificChoices(choice, isFirstHalf);

                if (specificChoices && specificChoices.length) {
                    specificChoices.forEach((specificChoice) => {
                        const betAmount = bet[specificChoice] ?? 0;
                        const originalOdds = odds[specificChoice] || 1;
                        const winAmount = win ? betAmount * originalOdds : 0;
                        const refund = this.isBLueOrRed(specificChoice) && settlementResult.tie ? betAmount : 0;

                        result.totalBetAmount += betAmount;
                        result.totalWin += winAmount;
                        result.winningByChoices[specificChoice] = winAmount;
                        result.refund += refund;
                        if (winAmount > 0) {
                            result.netWin += winAmount - betAmount;
                        } else {
                            result.totalLost += betAmount;
                        }
                    });
                }

                return result;
            },
            {
                totalBetAmount: 0,
                totalWin: 0,
                netWin: 0,
                totalLost: 0,
                refund: 0,
                winningByChoices: {},
            }
        );

        betResult.totalWin = parseFloat(betResult.totalWin.toFixed(2));
        betResult.netWin = parseFloat(betResult.netWin.toFixed(2));

        return betResult;
    }

    getSpecificChoices(choice, isFirstHalf) {
        const choiceMapper = isFirstHalf ? firstHalfChoiceMapper : fullTimeChoiceMapper;

        return choiceMapper[choice];
    }

    isBLueOrRed(choice) {
        return ["blue", "red"].includes(choice);
    }

    isTie(choice) {
        return choice === "tie";
    }
}
