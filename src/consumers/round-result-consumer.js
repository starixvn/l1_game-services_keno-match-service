import mongoose from "mongoose";
import { GameDefinition } from "sc-multiple-games-base";

import { GameData } from "../game-data";
import { sumArrayNumber } from "../helpers/array-helper";
import { createHashMD5, randomString } from "../helpers/crypto-helper";
import { RoundResultPublisher } from "../publishers";

export class RoundResultConsumer {
    /**
     * @param {GameData} gameData
     * @param {GameDefinition} definition
     *  @param {mongoose.Model} globalConfigsRepository
     * @param {mongoose.Model} roundsRepository
     * @param {RoundResultPublisher} roundResultPublisher
     */
    constructor(gameData, definition, globalConfigsRepository, roundsRepository, roundResultPublisher) {
        this.gameData = gameData;
        this.definition = definition;
        this.globalConfigsRepository = globalConfigsRepository;
        this.roundsRepository = roundsRepository;
        this.roundResultPublisher = roundResultPublisher;
    }

    async generateFirstHalfResult() {
        const resultFromAdmin = this.gameData.settlementResultFromAdmin;

        const result =
            this.gameData.roundId === resultFromAdmin.roundId
                ? resultFromAdmin.result.firstHalf.result
                : { blue: this.definition.generateResult(), red: this.definition.generateResult() };

        const totalBlue = sumArrayNumber(result.blue);
        const totalRed = sumArrayNumber(result.red);
        const sum = totalBlue + totalRed;
        const settlementResult = this.definition.settle({ totalBlue, totalRed }, true);

        const liveOdds = await this.globalConfigsRepository.findOne({ type: "kenomatch_liveodds" }, "blueRed overUnder").lean().exec();
        this.gameData.liveOdds = { ...liveOdds.blueRed[totalBlue - totalRed], ...liveOdds.overUnder[sum] };
        const odds = { ...this.gameData.gameConfigs.odds, ...this.gameData.liveOdds };

        const resultKey = `[${totalBlue};${totalRed}]${randomString()}`;
        const md5 = createHashMD5(resultKey);

        await this.roundsRepository.create({
            id: this.gameData.roundId,
            odds,
            firstHalf: { result, sum, settlementResult, resultKey, md5, time: new Date() },
            time: new Date(),
        });

        this.gameData.currentMD5 = md5;
        this.gameData.firstHalfResult = { result, settlementResult, totalRed, totalBlue, resultKey };
        this.roundResultPublisher.publishMD5(md5);
    }

    handleFinishFistHalf() {
        const { firstHalfResult, liveOdds } = this.gameData;
        this.roundResultPublisher.publishFirstHalfResult(firstHalfResult);
        this.roundResultPublisher.publishToAllUsers({ liveOdds });
    }

    async generateFullTimeResult() {
        const { roundId, firstHalfResult, settlementResultFromAdmin: resultFromAdmin } = this.gameData;
        const result = firstHalfResult.result;
        const fullTimeResult =
            roundId === resultFromAdmin.roundId
                ? resultFromAdmin.result.fullTime.result
                : { blue: this.definition.generateResult(result?.blue), red: this.definition.generateResult(result?.red) };

        const totalBlue = sumArrayNumber(fullTimeResult.blue) + firstHalfResult.totalBlue;
        const totalRed = sumArrayNumber(fullTimeResult.red) + firstHalfResult.totalRed;
        const sum = totalBlue + totalRed;
        const settlementResult = this.definition.settle({ totalBlue, totalRed }, false);
        const resultKey = `[${totalBlue};${totalRed}]${randomString()}`;
        const md5 = createHashMD5(resultKey);
        this.gameData.currentMD5 = md5;
        const update = {
            fullTime: {
                result: fullTimeResult,
                sum,
                settlementResult,
                resultKey,
                md5,
                time: new Date(),
            },
        };
        await this.roundsRepository.updateOne(
            {
                id: roundId,
            },
            update
        );

        this.roundResultPublisher.publishMD5(md5);
    }
}
