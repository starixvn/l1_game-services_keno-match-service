import { stub, stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { logger } from "sc-common";
import { Core } from "sc-game-base";

import { choices, choicesMapper } from "../../constants";
import { RoundResultConsumer, SettleGameRoundConsumer } from "../../consumers";
import { GameData } from "../../game-data";
import { GameCron } from "../game-cron";

describe("game cron instance", () => {
    const definition = {
        id: 36,
        name: "KenoMatch1",
        durations: {
            wholeRound: 62,
            firstHalfPlacingBets: 54,
            firstHalfLockingBet: 32,
            finishFirstHalf: 27,
            placingBets: 18,
            lockingBet: 5,
        },
        choices,
        choicesMapper,
        defaultBetTracks: {},
    };

    const gameData = new GameData(0);

    /** @type {logger}*/
    const logService = stub(logger);

    /** @type {mongoose.Model}*/
    const betsRepository = stubMongooseModelStupidly(mongoose.Model);
    betsRepository.updateOne = jest.fn();

    /** @type {mongoose.Model}*/
    const betLogsRepository = stubMongooseModelStupidly(mongoose.Model);
    betLogsRepository.create = jest.fn();

    /** @type {mongoose.Model}*/
    const userInfosRepository = stubMongooseModelStupidly(mongoose.Model);
    userInfosRepository.updateOne = jest.fn();

    const bot = stub(Core.Crons.BaseBot);

    /** @type {SettleGameRoundConsumer}*/
    const settleGameRoundConsumer = stub(SettleGameRoundConsumer);

    /** @type {Core.BaseEventPublishers.GameStatusPublisher}*/
    const gameStatusPublisher = stub(Core.BaseEventPublishers.GameStatusPublisher);

    /** @type {Core.BaseEventPublishers.RunningRoundInfoPublisher}*/
    const runningRoundInfoPublisher = stub(Core.BaseEventPublishers.RunningRoundInfoPublisher);

    /** @type {mongoose.Model}*/
    const gameConfigsRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {mongoose.Model}*/
    const roundsRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {mongoose.Model}*/
    const archiveStatusesRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {mongoose.Model}*/
    const notificationRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {RoundResultConsumer}*/
    const roundResultConsumer = stub(RoundResultConsumer);

    const gameCron = new GameCron({
        definition,
        gameData,
        bot,
        settleGameRoundConsumer,
        gameStatusPublisher,
        runningRoundInfoPublisher,
        logService,
        gameConfigsRepository,
        roundsRepository,
        archiveStatusesRepository,
        notificationRepository,
        roundResultConsumer,
    });

    it("should be instance of Core.Crons.BaseGameCron", () => {
        expect(gameCron instanceof Core.Crons.BaseGameCron).toBeTruthy();
    });

    describe("proceed tests", () => {
        it("should call checkGameStatus after each round", async () => {
            // arrange
            gameData.disabled = false;
            gameData.remainingTime = definition.durations.wholeRound;
            gameCron.checkGameStatus = jest.fn();

            // act
            await gameCron.proceed();

            // assert
            expect(gameCron.checkGameStatus).toHaveBeenCalled();
        });

        it("should call resetForNewRound and generate first half at starting round", async () => {
            // arrange
            gameData.disabled = false;
            gameData.remainingTime = definition.durations.firstHalfPlacingBets + 1;

            jest.spyOn(gameCron, "resetForNewRound");

            // act
            await gameCron.proceed();

            // assert
            expect(gameCron.resetForNewRound).toHaveBeenCalled();
            expect(roundResultConsumer.generateFirstHalfResult).toHaveBeenCalled();
        });

        it("should call handleFinishFistHalf at finish half time", async () => {
            // arrange
            gameData.disabled = false;
            gameData.remainingTime = definition.durations.finishFirstHalf + 1;

            // act
            await gameCron.proceed();

            // assert
            expect(roundResultConsumer.handleFinishFistHalf).toHaveBeenCalled();
        });

        it("should call generate fulltime result at placing bet time", async () => {
            // arrange
            gameData.disabled = false;
            gameData.remainingTime = definition.durations.placingBets + 1;

            // act
            await gameCron.proceed();

            // assert
            expect(roundResultConsumer.generateFullTimeResult).toHaveBeenCalled();
        });

        it("should call settleRound when remainingTime is less than 0", async () => {
            // arrange
            gameData.disabled = false;
            gameData.remainingTime = 0;

            // act
            await gameCron.proceed();

            // assert
            expect(gameData.remainingTime).toEqual(definition.durations.wholeRound);
            expect(settleGameRoundConsumer.settleRound).toHaveBeenCalled();
        });

        it("should call runningRoundInfoPublisher.publish when remaining time is in placing bet time", async () => {
            // arrange
            gameData.disabled = false;
            gameData.remainingTime = definition.durations.placingBets;

            gameCron.checkGameStatus = jest.fn();

            // act
            await gameCron.proceed();

            // assert
            expect(runningRoundInfoPublisher.publish).toHaveBeenCalled();
        });
    });
});
