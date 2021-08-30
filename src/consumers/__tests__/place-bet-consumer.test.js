import { stub } from "jest-micro-auto-stub";
import { helpers } from "sc-common";
import { Core } from "sc-game-base";

import { choices, choicesMapper } from "../../constants";
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

    it("should extends Core PlaceBetConsumer", () => {
        // act
        const consumer = new PlaceBetConsumer(definition, gameData, baseEventPublisher);

        // assert
        expect(consumer instanceof Core.BaseEventConsumers.PlaceBetConsumer);
    });

    describe("composeBettingTimeValidationCriteria tests", () => {
        const consumer = new PlaceBetConsumer(definition, gameData, baseEventPublisher);

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
});
