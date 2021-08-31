import { stub, stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
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
    const roundsRepository = { findOne: () => {} };

    /** @type {RoundResultPublisher}*/
    const roundResultPublisher = stub(RoundResultPublisher);

    /** @type {Core.BaseEventPublishers.UserBetResultPublisher}*/
    const userBetResultPublisher = stub(Core.BaseEventPublishers.UserBetResultPublisher);

    const endGame = jest.fn();

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
    });

    it("should instance of Core.BaseEventConsumers.SettleGameRoundConsumer", () => {
        expect(consumer instanceof Core.BaseEventConsumers.SettleGameRoundConsumer).toBeTruthy();
    });

    describe("settleRound tests", () => {
        it("should not call settleBets when current round not found", async () => {
            // arrange
            spyOn(roundsRepository, "findOne").and.callFake(() => {
                return {
                    exec: () => {
                        return null;
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
                    exec: () => {
                        return round;
                    },
                };
            });
            spyOn(consumer, "settleBets");

            // act
            await consumer.settleRound();

            // assert
            expect(consumer.settleBets).toHaveBeenCalled();
            expect(round.save).toHaveBeenCalled();
            expect(round.settled).toBeTruthy();
        });
    });
});
