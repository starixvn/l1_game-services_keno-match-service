import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";
import gameSettings from "./stubs/game-settings";

export const placeBetTest = () => {
    describe("place bet", () => {
        const getTimeOutFistHalfToBet = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime <= durations.firstHalfLockingBet) {
                timeout = durations.wholeRound - durations.firstHalfPlacingBets + remainingTime + 2;
            } else if (remainingTime >= durations.firstHalfPlacingBets) {
                timeout = remainingTime - durations.firstHalfPlacingBets + 2;
            }

            return timeout;
        };

        const getTimeOutFulTimeToBet = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime <= durations.lockingBet) {
                timeout = durations.wholeRound - durations.placingBets + remainingTime + 2;
            } else if (remainingTime >= durations.placingBets) {
                timeout = remainingTime - durations.placingBets + 2;
            }

            return timeout;
        };

        const getTimeOutToBetInvalid = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime >= durations.lockingBet && remainingTime <= durations.placingBets) {
                timeout = remainingTime - durations.lockingBet + 1;
            }

            return timeout;
        };

        describe("when place bet in placing bet first half  time", () => {
            it("should return own bet data", (done) => {
                // Arrange
                const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
                client.handleSignedInEvent(() => {
                    client.sendInGameEvent();
                });
                let receivedRemainingTime = false;

                // Act
                client.on(socketOptions.gameName, (inGameData) => {
                    if (inGameData.remainingTime && !receivedRemainingTime) {
                        receivedRemainingTime = true;
                        setTimeout(() => {
                            console.log("betChoice: 'fhBlue', amount: 100");
                            client.emit(eventTypes.bet, { betChoice: "fhBlue", amount: 100 });
                        }, getTimeOutFistHalfToBet(inGameData.remainingTime, gameSettings[0].durations) * 1000);
                    }
                });

                // Assert
                client.on(socketOptions.gameName, (data) => {
                    if (data.endBet) {
                        expect(data.betChoice).toBe("fhBlue");
                        expect(data.endBet).toBe(100);
                        expect(data.ownBets).toEqual({ fhBlue: 100 });

                        client.close();
                        done();
                    }
                });
            });
        });

        describe("when place bet in placing bet full time", () => {
            it("should return own bet data", (done) => {
                // Arrange
                const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
                client.handleSignedInEvent(() => {
                    client.sendInGameEvent();
                });
                let receivedRemainingTime = false;

                // Act
                client.on(socketOptions.gameName, (inGameData) => {
                    if (inGameData.remainingTime && !receivedRemainingTime) {
                        receivedRemainingTime = true;
                        setTimeout(() => {
                            console.log("betChoice: 'liveFTBlue', amount: 100");
                            client.emit(eventTypes.bet, { betChoice: "liveFTBlue", amount: 100 });
                        }, getTimeOutFulTimeToBet(inGameData.remainingTime, gameSettings[0].durations) * 1000);
                    }
                });

                // Assert
                client.on(socketOptions.gameName, (data) => {
                    if (data.endBet) {
                        expect(data.betChoice).toBe("liveFTBlue");
                        expect(data.endBet).toBe(100);
                        expect(data.ownBets).toEqual({ fhBlue: 100, liveFTBlue: 100 });

                        client.close();
                        done();
                    }
                });
            });
        });

        describe("when place bet NOT in placing bet time", () => {
            it("should return invalid", (done) => {
                // Arrange
                const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
                client.handleSignedInEvent(() => {
                    client.sendInGameEvent();
                });
                let receivedRemainingTime = false;

                // Act
                client.on(socketOptions.gameName, (inGameData) => {
                    if (inGameData.remainingTime && !receivedRemainingTime) {
                        receivedRemainingTime = true;
                        setTimeout(() => {
                            client.emit(eventTypes.bet, { betChoice: "fhOdd", amount: 100 });
                        }, getTimeOutToBetInvalid(inGameData.remainingTime, gameSettings[0].durations) * 1000);
                    }
                });

                // Assert
                client.on(socketOptions.gameName, (data) => {
                    if (data.endBet) {
                        expect(data.endBet).toBe(-1);

                        client.close();
                        done();
                    }
                });
            });
        });
    });
};
