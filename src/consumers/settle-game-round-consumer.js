import { Core } from "sc-game-base";

import { fullTimeChoiceMapper, halfTimeChoiceMapper } from "../constants";
import { sumArrayNumber, sumArrayObject } from "../helpers/array-helper";

export class SettleGameRoundConsumer extends Core.BaseEventConsumers.SettleGameRoundConsumer {
    generateHalfTimeResult() {
        const resultFromAdmin = this.gameData.settlementResultFromAdmin;

        return this.gameData.roundId === resultFromAdmin.roundId
            ? resultFromAdmin.result.halfTime.result
            : {
                  blue: this.definition.generateResult(),
                  red: this.definition.generateResult(),
              };
    }

    generateFullTimeResult() {
        const resultFromAdmin = this.gameData.settlementResultFromAdmin;
        const halfTimeResult = this.gameData.halfTimeResult;

        return this.gameData.roundId === resultFromAdmin.roundId
            ? resultFromAdmin.result.fullTime.result
            : {
                blue: this.definition.generateResult(halfTimeResult.blue),
                red: this.definition.generateResult(halfTimeResult.red),
              };
    }

    async handleFinishHalfTime() {
        try {
            const result = this.generateHalfTimeResult();

            const totalBlue = sumArrayNumber(result.blue);
            const totalRed = sumArrayNumber(result.red);
            this.gameData.halfTimeResult = { ...result, totalBlue, totalRed };
            const sum = totalBlue + totalRed;
            const settlementResult = this.definition.settle({ totalBlue, totalRed }, true);
            const { gameConfigs } = this.gameData;
            const liveOdds = { ...this.gameData.liveOdds.blueRed[totalBlue - totalRed], ...this.gameData.liveOdds.overUnder[sum] };
            const odds = { ...gameConfigs.odds, ...liveOdds };
    
            await this.roundsRepository.create({
                id: this.gameData.roundId,
                odds,
                halfTime: { result, sum, settlementResult, time: new Date() },
            });
    
            const payload = { finishHalfTime: { ...this.collectRoundResult(result, settlementResult, this.gameData.roundId), liveOdds } };
            this.roundResultPublisher.publishToAllUsers(payload);
            this.roundResultPublisher.publishToAllAdmins(payload);
        } catch (error) {
            console.log(error);
        }
       
    }

    async settleRound() {
        try {
            const halfTimeResult = this.gameData.halfTimeResult;
            const result = this.generateFullTimeResult();
    
            const totalBlue = sumArrayNumber(result.blue) + halfTimeResult.totalBlue;
            const totalRed = sumArrayNumber(result.red) + halfTimeResult.totalRed;
            const sum = totalBlue + totalRed;
            const settlementResult = this.definition.settle({ totalBlue, totalRed }, false);
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
        } catch (error) {
            console.log(error);
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

        this.roundResultPublisher.publishRoundResult(this.collectRoundResult(fullTime.result, fullTime.settlementResult, roundId));
    }

    calculateBetResult(settlementResult, bet, odds, isHalfTime) {
        const betResult = Object.entries(settlementResult).reduce(
            (result, [choice, win]) => {
                if (!this.isDraw(choice)) {
                    const specificChoice = this.getSpecificChoice(choice, isHalfTime);
                    const betAmount = bet[specificChoice] ?? 0;
                    const originalOdds = odds[choice] || 1;
                    const winAmount = win ? betAmount * originalOdds : 0;
                    const refund = this.isBLueOrRed(specificChoice) && settlementResult.draw ? betAmount : 0;

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

    isBLueOrRed(choice) {
        return ["blue", "red"].includes(choice);
    }

    isDraw(choice) {
        return choice === "draw";
    }
}
