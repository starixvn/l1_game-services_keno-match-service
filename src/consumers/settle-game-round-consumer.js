import { Core } from "sc-game-base";

import { fullTimeChoiceMapper, halfTimeChoiceMapper } from "../constants";
import { sumArrayNumber, sumArrayObject } from "../helpers/array-helper";

export class SettleGameRoundConsumer extends Core.BaseEventConsumers.SettleGameRoundConsumer {
    async handleFinishHalfTime() {
        const result = {
            home: this.definition.generateResult(),
            away: this.definition.generateResult(),
        };
        this.gameData.halfTimeResult = result;
        const totalHome = sumArrayNumber(result.home);
        const totalAway = sumArrayNumber(result.away);
        const sum = totalHome + totalAway;
        const settlementResult = this.definition.settle({ totalHome, totalAway }, true);
        const { gameConfigs, liveOdds } = this.gameData;
        const odds = { ...gameConfigs.odds, ...liveOdds.homeAway[totalHome - totalAway], ...liveOdds.overUnder[sum] };

        await this.roundsRepository.create({
            id: this.gameData.roundId,
            odds,
            halfTime: { result, sum, settlementResult, time: new Date() },
        });

        this.roundResultPublisher.publishRoundResult(this.collectRoundResult(result, settlementResult, `${this.gameData.roundId}-1`));
    }

    async settleRound() {
        const halfTimeResult = this.gameData.halfTimeResult;
        const result = {
            home: this.definition.generateResult(halfTimeResult.home),
            away: this.definition.generateResult(halfTimeResult.away),
        };
        const totalHome = sumArrayNumber(result.home);
        const totalAway = sumArrayNumber(result.away);
        const sum = totalHome + totalAway;
        const settlementResult = this.definition.settle({ totalHome, totalAway }, false);
        const update = {
            fullTime: {
                result,
                sum,
                settlementResult,
                time: new Date(),
            },
        };
        const round = await this.roundsRepository.findOneAndUpdate(
            {
                id: this.gameData.roundId,
            },
            update,
            { new: true }
        );

        if (round) {
            this.gameData.roundId = round.id + 1;

            await this.settleBets(round);
        }
    }

    async settleBets(round) {
        const { id: roundId, fullTime, halfTime, odds } = round;
        const bets = await this.queryBets(roundId);

        if (bets && bets.length) {
            await Promise.all(
                bets.map(async (bet) => {
                    const halfTimeBetResult = this.calculateBetResult(halfTime.settlementResult, bet, odds, true);
                    const fullTimeBetResult = this.calculateBetResult(fullTime.settlementResult, bet, odds, false);
                    const betResult = sumArrayObject([halfTimeBetResult, fullTimeBetResult]);

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

        this.roundResultPublisher.publishRoundResult(this.collectRoundResult(fullTime.result, fullTime.settlementResult, `${roundId}-2`));
    }

    calculateBetResult(settlementResult, bet, odds, isHalfTime) {
        const betResult = Object.entries(settlementResult).reduce(
            (result, [choice, win]) => {
                if (!this.isDraw(choice)) {
                    const specificChoice = this.getSpecificChoice(choice, isHalfTime);
                    const betAmount = bet[specificChoice] ?? 0;
                    const originalOdds = odds[choice] || 1;
                    const winAmount = win ? betAmount * originalOdds : 0;
                    const refund = this.isHomeOrAway(specificChoice) && settlementResult.draw ? betAmount : 0;

                    result.totalBetAmount += betAmount;
                    result.totalWin += winAmount;
                    result.winningByChoices[choice] = winAmount;
                    result.refund += refund;

                    if (winAmount > 0) {
                        result.netWin += winAmount - betAmount;
                    } else {
                        result.totalLost += betAmount;
                    }
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

    getSpecificChoice(choice, isHalfTime) {
        const choiceMapper = isHalfTime ? halfTimeChoiceMapper : fullTimeChoiceMapper;

        return choiceMapper[choice];
    }

    isHomeOrAway(choice) {
        return ["home", "away"].includes(choice);
    }

    isDraw(choice) {
        return choice === "draw";
    }
}
