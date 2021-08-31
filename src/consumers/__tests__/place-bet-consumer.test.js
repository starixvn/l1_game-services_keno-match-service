import { stub } from "jest-micro-auto-stub";
import { helpers } from "sc-common";
import { Core } from "sc-game-base";

import { choices, choicesMapper, liveChoices, preLiveChoices } from "../../constants";
import { GameData } from "../../game-data";
import { PlaceBetConsumer } from "../place-bet-consumer";

describe("Place Bet consumer instance", () => {
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
    gameData.roundId = 1;
    gameData.gameConfigs = {};
    const baseEventPublisher = stub(Core.BaseEventPublishers.BaseEventPublisher);
    const consumer = new PlaceBetConsumer(definition, gameData, baseEventPublisher);

    beforeAll(() => {
        // arrange
        spyOn(Core.BaseEventConsumers.PlaceBetConsumer.prototype, "composeBetChoiceValidationCriteria").and.callFake(() => []);
    });

    it("should extends Core PlaceBetConsumer", () => {
        // assert
        expect(consumer instanceof Core.BaseEventConsumers.PlaceBetConsumer).toBeTruthy();
    });

    describe("composeBettingTimeValidationCriteria tests", () => {
        beforeEach(() => {
            gameData.remainingTime = 0;
            gameData.roundId = 1;
            gameData.gameConfigs = { enabled: true };
        });

        it("should return invalidBet notice when game was disabled", () => {
            // arrange
            gameData.gameConfigs.enabled = false;

            // act
            var actualResult = consumer.composeBettingTimeValidationCriteria(1);

            // assert
            expect(actualResult.filter((x) => x.failure)[0]).toStrictEqual({
                failure: true,
                notice: { errorCode: helpers.noticeHelper.invalidBet },
            });
        });

        it("should return invalidBet notice when round id is different with running round", () => {
            // arrange
            gameData.roundId = 2;

            // act
            var actualResult = consumer.composeBettingTimeValidationCriteria(1);

            // assert
            expect(actualResult.filter((x) => x.failure)[0]).toStrictEqual({
                failure: true,
                notice: { errorCode: helpers.noticeHelper.invalidBet, gameRoundId: 1 },
            });
        });

        [60, 30, 4].forEach((remainingTime) => {
            it(`should return placeBetNextRound when placing bet in invalid time (${remainingTime})`, () => {
                // arrange
                gameData.remainingTime = remainingTime;

                // act
                var actualResult = consumer.composeBettingTimeValidationCriteria(1);

                // assert
                expect(actualResult.filter((x) => x.failure)[0]).toStrictEqual({
                    failure: true,
                    notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
                });
            });
        });

        [50, 15].forEach((remainingTime) => {
            it(`should not return any notice when placing bet in valid time (${remainingTime})`, () => {
                // arrange
                gameData.remainingTime = remainingTime;

                // act
                var actualResult = consumer.composeBettingTimeValidationCriteria(1);

                // assert
                expect(actualResult.filter((x) => x.failure).length).toBe(0);
            });
        });
    });

    describe("composeBetChoiceValidationCriteria tests", () => {
        it("should call super.composeBetChoiceValidationCriteria", () => {
            // act
            consumer.composeBetChoiceValidationCriteria("fhBlue");

            // assert
            expect(Core.BaseEventConsumers.PlaceBetConsumer.prototype.composeBetChoiceValidationCriteria).toHaveBeenCalled();
        });

        liveChoices.forEach((choice) => {
            it(`should return invalid bet when placing bet live choice (${choice}) in first half duration`, () => {
                //arrange
                gameData.remainingTime = 50;

                // act
                var actualResult = consumer.composeBetChoiceValidationCriteria(choice);

                // assert
                expect(actualResult.filter((x) => x.failure)[0]).toStrictEqual({
                    failure: true,
                    notice: { errorCode: helpers.noticeHelper.invalidBet },
                });
            });
        });

        preLiveChoices.forEach((choice) => {
            it(`should return invalid bet when placing bet pre-live choice (${choice}) in full time duration`, () => {
                //arrange
                gameData.remainingTime = 15;

                // act
                var actualResult = consumer.composeBetChoiceValidationCriteria(choice);

                // assert
                expect(actualResult.filter((x) => x.failure)[0]).toStrictEqual({
                    failure: true,
                    notice: { errorCode: helpers.noticeHelper.invalidBet },
                });
            });
        });
    });
});
