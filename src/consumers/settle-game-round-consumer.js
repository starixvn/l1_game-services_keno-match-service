import { Core } from "sc-game-base";

import { blueAndRedChoices, firstHalfChoiceMapper, fullTimeChoiceMapper } from "../constants";
import { sumArrayObject } from "../helpers/array-helper";

export class SettleGameRoundConsumer extends Core.BaseEventConsumers.SettleGameRoundConsumer {
    async settleRound() {
        const round = await this.roundsRepository.findOne({ id: this.gameData.roundId }).lean().exec();

        if (round) {
            this.gameData.roundId = round.id + 1;

            await this.settleBets(round);
            await this.roundsRepository.updateOne({ id: round.id }, { settled: true });
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
                    betResult.winningByChoices = { ...firstHalfBetResult.winningByChoices, ...fullTimeBetResult.winningByChoices };

                    bet.betwin = betResult.totalWin - betResult.refund;
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
                        const refund = this.isBLueOrRedChoice(specificChoice) && settlementResult.tie ? betAmount : 0;
                        const winAmount = win ? betAmount * originalOdds : refund;

                        result.totalBetAmount += betAmount;
                        result.totalWin += winAmount;
                        result.refund += refund;

                        if (winAmount > 0) {
                            result.winningByChoices[specificChoice] = winAmount;
                            result.netWin += winAmount - betAmount;
                        } else {
                            result.winningByChoices[specificChoice] = refund;
                            result.totalLost += betAmount - refund;
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

    isBLueOrRedChoice(choice) {
        return blueAndRedChoices.includes(choice);
    }
}
