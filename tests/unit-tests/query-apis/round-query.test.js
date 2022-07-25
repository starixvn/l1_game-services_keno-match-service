import { stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";

import { RoundQuery } from "../../../src/query-apis";

jest.mock("../../../src/helpers/crypto-helper.js");
describe("round query test", () => {
    /** @type {mongoose.Model}*/
    const roundsRepository = stubMongooseModelStupidly(mongoose.Model);

    const roundQuery = new RoundQuery(roundsRepository);
    beforeEach(() => {
        spyOn(roundQuery, "convertResult");
        spyOn(roundQuery, "convertSettlementResult");
    });

    describe("getList_", () => {
        it("always_calls roundsRepository", async () => {
            // arrange
            const rounds = [{ id: 1, firstHalf: {}, fullTime: {} }];
            roundsRepository.find().lean().exec.mockReturnValueOnce(rounds);

            // act
            await roundQuery.getList(10, {});

            // assert
            expect(roundsRepository.find().lean().exec).toHaveBeenCalled();
        });
    });

    describe("getOne test", () => {
        it("should call roundsRepository", async () => {
            // arrange
            const round = { id: 1 };
            roundsRepository.findOne().lean().exec.mockReturnValueOnce(round);

            // act
            await roundQuery.getOne(1);

            // assert
            expect(roundsRepository.findOne().lean().exec).toHaveBeenCalled();
        });
    });
});
