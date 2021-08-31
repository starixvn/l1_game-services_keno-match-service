import { stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { Core } from "sc-game-base";
import AdminPublisher from "sc-game-base/src/core/event-publishers/admin-publisher";

import { GameData } from "../../game-data";
import { AdminMonitorConsumer } from "../admin-monitor-consumer";

jest.mock("sc-game-base/src/core/event-publishers/admin-publisher");

describe("Admin monitor consumer instance", () => {
    const gameData = new GameData(30);

    const adminPublisher = new AdminPublisher("", gameData);

    /** @type {mongoose.Model}*/
    const roundsRepository = stubMongooseModelStupidly(mongoose.Model);

    const consumer = new AdminMonitorConsumer({}, gameData, adminPublisher, roundsRepository);
    const socketClient = {
        emit: jest.fn(),
    };

    it("should extends Core AdminMonitorConsumer", () => {
        expect(consumer instanceof Core.BaseEventConsumers.AdminMonitorConsumer).toBeTruthy();
    });

    describe("consume", () => {
        it("when last round doesn't exist", async () => {
            // arrange
            roundsRepository.findOne().lean().exec.mockReturnValueOnce(null);

            // act
            await consumer.consume(socketClient);

            // assert
            expect(adminPublisher.publishToAdmin).not.toHaveBeenCalled();
        });

        it("when last round exist", async () => {
            // arrange
            roundsRepository.findOne().lean().exec.mockReturnValueOnce({ id: 1, result: {}, settlementResult: {} });

            // act
            await consumer.consume(socketClient);

            // assert
            expect(adminPublisher.publishToAdmin).toHaveBeenCalled();
        });
    });
});
