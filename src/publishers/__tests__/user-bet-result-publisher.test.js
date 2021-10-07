import { GameData } from "../../game-data";
import { UserBetResultPublisher } from "../user-bet-result-publisher";

describe("publish test", () => {
    it("should publish to user", async () => {
        // arrange
        const gameData = new GameData();
        const gameName = "game";

        const publisher = new UserBetResultPublisher(gameName, gameData);
        publisher.publishToUser = jest.fn();
        // act
        await publisher.publish(1, { totalWin: 200 });
        // assert
        expect(publisher.publishToUser).toHaveBeenCalled();
    });

    it("should publish to all users & admins", async () => {
        // arrange
        const gameData = new GameData();
        const gameName = "game";

        const publisher = new UserBetResultPublisher(gameName, gameData);
        publisher.publishToUser = jest.fn();
        // act
        await publisher.publish(1, { totalWin: 0 });
        // assert
        expect(publisher.publishToUser).toHaveBeenCalled();
    });
});
