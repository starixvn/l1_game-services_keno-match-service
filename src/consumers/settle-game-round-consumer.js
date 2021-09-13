import { Core } from "sc-game-base";

import { blueAndRedChoices, firstHalfChoiceMapper, fullTimeChoiceMapper } from "../constants";
import { sumArrayObject } from "../helpers/array-helper";

export class SettleGameRoundConsumer extends Core.BaseEventConsumers.SettleGameRoundConsumer {
    constructor({
        definition,
        gameData,
        roundResultPublisher,
        userBetResultPublisher,
        endGame,
        roundsRepository,
        betsRepository,
        logService,
    }) {
        super({ definition, gameData, roundResultPublisher, userBetResultPublisher, endGame, roundsRepository, betsRepository });
        this.logService = logService;
    }

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
        const firstHalfSettlementResult = firstHalf.settlementResult;

        const bets = await this.queryBets(roundId);
        console.log(roundId);

        if (bets && bets.length) {
            await Promise.all(
                bets.map(async (bet) => {
                    const firstHalfBetResult = this.calculateBetResult(firstHalfSettlementResult, bet, odds, true);
                    //this.logService.log(firstHalfBetResult);
                    //const fullTimeBetResult = this.calculateBetResult(fullTime.settlementResult, bet, odds, false);
                    //this.logService.log(fullTimeBetResult);
                    const fullTimeBetResult = {};
                    const betResult = sumArrayObject([firstHalfBetResult, fullTimeBetResult]);
                    //this.logService.log(betResult);

                    bet.betwin = betResult.totalWin;
                    bet.refund = betResult.refund;
                    bet.thanhtoan = true;
                    bet.odds = odds;

                    //this.logService.log(bet);

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
        //this.logService.log(settlementResult);
        this.logService.log(settlementResult);
        this.logService.log(Object.entries(settlementResult));
        const betResult = Object.entries(settlementResult).reduce(
            (result, [choice, win]) => {
                console.log(`${choice}:${win}`);
                //this.logService.log(`${choice}:${win}`);
                const specificChoices = this.getSpecificChoices(choice, isFirstHalf);

                if (specificChoices && specificChoices.length) {
                    specificChoices.forEach((specificChoice) => {
                        const betAmount = bet[specificChoice] ?? 0;
                        const originalOdds = odds[specificChoice] || 1;
                        const winAmount = win ? betAmount * originalOdds : 0;
                        //this.logService.log(`winAmount:${winAmount}`);
                        const refund = this.isBLueOrRedChoice(specificChoice) && settlementResult.tie ? betAmount : 0;
                        //this.logService.log(`refund:${refund}`);

                        result.totalBetAmount += betAmount;
                        result.totalWin += winAmount - refund;
                        //this.logService.log(`totalWin:${result.totalWin}`);

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
        this.logService.log(`choice:${choice}`);
        this.logService.log(`isFirstHalf:${isFirstHalf}`);
        const choiceMapper = isFirstHalf ? firstHalfChoiceMapper : fullTimeChoiceMapper;

        return choiceMapper[choice];
    }

    isBLueOrRedChoice(choice) {
        return blueAndRedChoices.includes(choice);
    }
}
