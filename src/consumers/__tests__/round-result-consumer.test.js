import { stub, stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";

import { choices, choicesMapper } from "../../constants";
import { GameData } from "../../game-data";
import { RoundResultPublisher } from "../../publishers";
import { RoundResultConsumer } from "../round-result-consumer";

describe("Round result consumer instance", () => {
    // arrange
    const definition = {
        id: 36,
        name: "KenoMatch1",
        durations: {
            wholeRound: 77,
            firstHalfPlacingBets: 69,
            firstHalfLockingBet: 39,
            finishFirstHalf: 34,
            placingBets: 25,
            lockingBet: 5,
        },
        choices,
        choicesMapper,
        defaultBetTracks: {},
    };
    const gameData = new GameData(0);

    /** @type {mongoose.Model}*/
    const globalConfigsRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {mongoose.Model}*/
    const roundsRepository = stubMongooseModelStupidly(mongoose.Model);

    /** @type {RoundResultPublisher}*/
    const roundResultPublisher = stub(RoundResultPublisher);

    const roundResultConsumer = new RoundResultConsumer(
        gameData,
        definition,
        globalConfigsRepository,
        roundsRepository,
        roundResultPublisher
    );

    beforeEach(() => {
        gameData.roundId = 1;
        gameData.gameConfigs = { enabled: true };
        gameData.settlementResultFromAdmin = {};
        definition.generateResult = jest.fn(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        definition.settle = jest.fn();
    });

    describe("generateFirstHalfResult tests", () => {
        it("should not call generateResult when set result from admin", async () => {
            // arrange
            gameData.roundId = 2;
            gameData.settlementResultFromAdmin = {
                roundId: 2,
                result: {
                    firstHalf: {
                        result: { blue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], red: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
                    },
                },
            };
            globalConfigsRepository.findOne().lean().exec.mockReturnValueOnce({ blueRed: {}, overUnder: {} });

            // act
            await roundResultConsumer.generateFirstHalfResult();

            // assert
            expect(definition.generateResult).not.toHaveBeenCalled();
        });

        it("should call generateResult when not set result from admin", async () => {
            // arrange
            gameData.roundId = 2;
            globalConfigsRepository.findOne().lean().exec.mockReturnValueOnce({ blueRed: {}, overUnder: {} });

            // act
            await roundResultConsumer.generateFirstHalfResult();

            // assert
            expect(definition.generateResult).toHaveBeenCalledTimes(2);
            expect(definition.settle).toHaveBeenCalled();
            expect(roundResultPublisher.publishMD5).toHaveBeenCalled();
        });
    });

    describe("generateFullTimeResult tests", () => {
        it("should not call generateResult when set result from admin", () => {
            // arrange
            gameData.roundId = 2;
            gameData.settlementResultFromAdmin = {
                roundId: 2,
                result: {
                    fullTime: {
                        result: { blue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], red: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
                    },
                },
            };

            // act
            roundResultConsumer.generateFullTimeResult({});

            // assert
            expect(definition.generateResult).not.toHaveBeenCalled();
        });

        it("should call generateResult when not set result from admin", () => {
            // arrange
            gameData.roundId = 2;
            gameData.settlementResultFromAdmin = {};

            // act
            roundResultConsumer.generateFullTimeResult({});

            // assert
            expect(definition.generateResult).toHaveBeenCalledTimes(2);
        });
    });

    describe("handleFinishFistHalf tests", () => {
        it("should call specific methods", async () => {
            // arrange
            gameData.firstHalfResult = {
                result: { blue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], red: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
                totalRed: 55,
                totalBlue: 55,
            };

            // act
            await roundResultConsumer.handleFinishFistHalf();

            // assert
            expect(roundResultPublisher.publishFirstHalfResult).toHaveBeenCalled();
            expect(roundResultPublisher.publishToAllUsers).toHaveBeenCalled();
            expect(roundResultPublisher.publishMD5).toHaveBeenCalled();
        });
    });
});
