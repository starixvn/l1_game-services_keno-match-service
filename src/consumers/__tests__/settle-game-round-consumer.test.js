import { stub, stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { logger } from "sc-common";
import { Core } from "sc-game-base";

import { choices, choicesMapper } from "../../constants";
import { GameData } from "../../game-data";
import { RoundResultPublisher } from "../../publishers";
import { SettleGameRoundConsumer } from "../settle-game-round-consumer";

describe("settle game round consumer instance", () => {
    // arrange
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

    /** @type {mongoose.Model}*/
    const roundsRepository = { findOne: () => {}, updateOne: jest.fn() };

    /** @type {RoundResultPublisher}*/
    const roundResultPublisher = stub(RoundResultPublisher);

    /** @type {Core.BaseEventPublishers.UserBetResultPublisher}*/
    const userBetResultPublisher = stub(Core.BaseEventPublishers.UserBetResultPublisher);

    const endGame = jest.fn();

    /** @type {logger}*/
    const logService = stub(logger);

    /** @type {mongoose.Model}*/
    const betsRepository = stubMongooseModelStupidly(mongoose.Model);
    const consumer = new SettleGameRoundConsumer({
        definition: definition,
        gameData: gameData,
        roundResultPublisher: roundResultPublisher,
        userBetResultPublisher: userBetResultPublisher,
        endGame: endGame,
        roundsRepository: roundsRepository,
        betsRepository: betsRepository,
        logService: logService,
    });

    it("should instance of Core.BaseEventConsumers.SettleGameRoundConsumer", () => {
        expect(consumer instanceof Core.BaseEventConsumers.SettleGameRoundConsumer).toBeTruthy();
    });

    describe("settleRound tests", () => {
        it("should not call settleBets when current round not found", async () => {
            // arrange
            spyOn(roundsRepository, "findOne").and.callFake(() => {
                return {
                    lean: () => {
                        return {
                            exec: () => {
                                return null;
                            },
                        };
                    },
                };
            });
            spyOn(consumer, "settleBets");

            // act
            await consumer.settleRound();

            // assert
            expect(consumer.settleBets).not.toHaveBeenCalled();
        });

        it("should call settleBets and settle round when current round exist", async () => {
            // arrange
            const round = { id: 1, save: jest.fn(), settled: false };
            spyOn(roundsRepository, "findOne").and.callFake(() => {
                return {
                    lean: () => {
                        return {
                            exec: () => {
                                return round;
                            },
                        };
                    },
                };
            });
            spyOn(consumer, "settleBets");

            // act
            await consumer.settleRound();

            // assert
            expect(consumer.settleBets).toHaveBeenCalled();
            expect(roundsRepository.updateOne).toHaveBeenCalled();
        });
    });

    describe("settleBets tests_", () => {
        it("always_calls queryBets and publishRoundResult", async () => {
            // arrange
            const round = { id: 1, fullTime: {}, firstHalf: {}, odds: {} };
            spyOn(consumer, "queryBets");

            // act
            await consumer.settleBets(round);

            // assert
            expect(consumer.queryBets).toHaveBeenCalled();
            expect(roundResultPublisher.publishRoundResult).toHaveBeenCalled();
        });

        it("existing bets_should settle bet and call end game", async () => {
            const round = {
                id: 1,

                fullTime: { settlementResult: { blue: false, red: true, tie: false, over: false, under: true, odd: true, even: false } },
                firstHalf: { settlementResult: { blue: false, red: true, tie: false, over: false, under: true, odd: true, even: false } },
                odds: {
                    fhBlue: 1.96,
                    fhRed: 1.96,
                    fhOver: 1.96,
                    fhUnder: 1.96,
                    fhOdd: 1.96,
                    fhEven: 1.96,
                    ftBlue: 1.96,
                    ftRed: 1.96,
                    ftOver: 1.96,
                    ftUnder: 1.96,
                    ftOdd: 1.96,
                    ftEven: 1.96,
                    liveFTOdd: 1.96,
                    liveFTEven: 1.96,
                    liveFTBlue: 2.03,
                    liveFTRed: 1.99,
                    liveFTOver: 2.64,
                    liveFTUnder: 1.61,
                },
            };
            spyOn(consumer, "queryBets").and.callFake(() => [
                {
                    uid: 1,
                    name: "aaaa",
                    phien: 1,
                    fhBlue: 10,
                    fhEven: 10,
                    fhOdd: 10,
                    fhOver: 10,
                    fhRed: 10,
                    fhUnder: 10,
                    ftBlue: 0,
                    ftEven: 0,
                    ftOdd: 0,
                    ftOver: 0,
                    ftRed: 0,
                    ftUnder: 0,
                    liveFTBlue: 0,
                    liveFTEven: 0,
                    liveFTOdd: 0,
                    liveFTOver: 0,
                    liveFTRed: 0,
                    liveFTUnder: 0,
                    save: jest.fn(),
                },
            ]);
            spyOn(consumer, "callEndGame");

            // act
            await consumer.settleBets(round);

            // assert
            expect(consumer.queryBets).toHaveBeenCalled();
            expect(roundResultPublisher.publishRoundResult).toHaveBeenCalled();
        });
    });
});
