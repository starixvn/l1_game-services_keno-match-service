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
        configName: "kenomatch1",
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
    gameConfigsRepository.updateOne = jest.fn();

    /** @type {mongoose.Model}*/
    const roundsRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {mongoose.Model}*/
    const archiveStatusesRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {mongoose.Model}*/
    const notificationRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {mongoose.Model}*/
    const globalConfigsRepository = stubMongooseModelStupidly(mongoose.Model);

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
        globalConfigsRepository,
    });

    it("should be instance of Core.Crons.BaseGameCron", () => {
        expect(gameCron instanceof Core.Crons.BaseGameCron).toBeTruthy();
    });

    describe("checkGameStatus tests", () => {
        it("game is enabled, should update gameData.gameConfigs and call publishStartGame", async () => {
            const gameConfigs = { enabled: true };
            gameData.disabled = false;
            gameData.remainingTime = definition.durations.wholeRound;
            gameConfigsRepository.findOne().lean().exec.mockReturnValueOnce({ enabled: true });

            await gameCron.checkGameStatus();

            expect(gameData.gameConfigs).toEqual(gameConfigs);
            expect(gameStatusPublisher.publishStartGame).toHaveBeenCalled();
        });

        it("game is disabled, should reset gameData.remainingTime, update game configs and call publishDisableGameStatus", async () => {
            const gameConfigs = { enabled: false };
            gameData.disabled = false;
            gameData.remainingTime = definition.durations.wholeRound;
            gameConfigsRepository.findOne().lean().exec.mockReturnValueOnce(gameConfigs);

            await gameCron.checkGameStatus();

            expect(gameData.gameConfigs).toEqual(gameConfigs);
            expect(gameData.remainingTime).toEqual(definition.durations.wholeRound);
            expect(gameConfigsRepository.updateOne).toHaveBeenCalled();
            expect(gameStatusPublisher.publishDisableGameStatus).toHaveBeenCalled();
        });

        it("game is currently disabled, then being enabled, should call publishEnablingGameStatus", async () => {
            const gameConfigs = { enabled: true };
            gameData.disabled = true;
            gameData.remainingTime = definition.durations.wholeRound;
            gameConfigsRepository.findOne().lean().exec.mockReturnValueOnce(gameConfigs);

            await gameCron.checkGameStatus();

            expect(gameData.gameConfigs).toEqual(gameConfigs);
            expect(gameStatusPublisher.publishEnablingGameStatus).toHaveBeenCalled();
        });
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

    describe("start tests", () => {
        it("should call getLastArchiveRound when last round doesn't exist", async () => {
            // arrange
            roundsRepository.findOne().lean().exec.mockReturnValueOnce(null);
            spyOn(gameCron, "getLastArchiveRound");

            // act
            await gameCron.start();

            // arrange
            expect(gameCron.getLastArchiveRound).toHaveBeenCalled();
        });

        it("should increase round id when last round was settled", async () => {
            // arrange
            roundsRepository.findOne().lean().exec.mockReturnValueOnce({ id: 1, settled: true });

            // act
            await gameCron.start();

            // arrange
            expect(gameData.roundId).toStrictEqual(2);
        });

        it("should keep round id when last round is running", async () => {
            // arrange
            roundsRepository.findOne().lean().exec.mockReturnValueOnce({ id: 1, settled: false });

            // act
            await gameCron.start();

            // arrange
            expect(gameData.roundId).toStrictEqual(1);
        });
    });
});
