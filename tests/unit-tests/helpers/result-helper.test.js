import { getSettlementResult } from "../../../src/helpers/result-helper";

describe("getSettlementResult test", () => {
    it("when totalRed greater than totalBlue, should return red is true", () => {
        // arrange
        const totalPoint = { totalBlue: 310, totalRed: 320 };

        // act
        const expectedResult = getSettlementResult(totalPoint, true);

        // assert
        expect(expectedResult.red).toBeTrue();
        expect(expectedResult.blue).toBeFalse();
    });

    it("when totalBlue greater than totalRed, should return blue is true", () => {
        // arrange
        const totalPoint = { totalBlue: 320, totalRed: 310 };

        // act
        const expectedResult = getSettlementResult(totalPoint, true);

        // assert
        expect(expectedResult.blue).toBeTrue();
        expect(expectedResult.red).toBeFalse();
    });

    it("when totalBlue equal than totalRed, should return tie is true", () => {
        // arrange
        const totalPoint = { totalBlue: 320, totalRed: 320 };

        // act
        const expectedResult = getSettlementResult(totalPoint, true);

        // assert
        expect(expectedResult.tie).toBeTrue();
        expect(expectedResult.blue).toBeFalse();
        expect(expectedResult.red).toBeFalse();
    });

    it("when sum of totalBlue and totalRed greater than or equal 811 in first half, should return over is true", () => {
        // arrange
        const totalPoint = { totalBlue: 420, totalRed: 420 };

        // act
        const expectedResult = getSettlementResult(totalPoint, true);

        // assert
        expect(expectedResult.over).toBeTrue();
        expect(expectedResult.under).toBeFalse();
    });

    it("when sum of totalBlue and totalRed less than 811 in first half, should return under is true", () => {
        // arrange
        const totalPoint = { totalBlue: 320, totalRed: 320 };

        // act
        const expectedResult = getSettlementResult(totalPoint, true);

        // assert
        expect(expectedResult.under).toBeTrue();
        expect(expectedResult.over).toBeFalse();
    });

    it("when sum of totalBlue and totalRed greater than or equal 1621 in full time, should return over is true", () => {
        // arrange
        const totalPoint = { totalBlue: 800, totalRed: 900 };

        // act
        const expectedResult = getSettlementResult(totalPoint, false);

        // assert
        expect(expectedResult.over).toBeTrue();
        expect(expectedResult.under).toBeFalse();
    });

    it("when sum of totalBlue and totalRed less than 1621 in full time, should return under is true", () => {
        // arrange
        const totalPoint = { totalBlue: 800, totalRed: 800 };

        // act
        const expectedResult = getSettlementResult(totalPoint, false);

        // assert
        expect(expectedResult.under).toBeTrue();
        expect(expectedResult.over).toBeFalse();
    });
});
