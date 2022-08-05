import generateResult from "../../../src/helpers/shuffleNumbers";

describe("shuffleNumbers", () => {
    const testCases = [{ randomMode: undefined }, { randomMode: 1 }, { randomMode: 2 }, { randomMode: 3 }];
    it.each(testCases)("should return 20 numbers having value between 1 and 80", ({ randomMode }) => {
        const numberOfPicked = 10,
            numberOfSeeds = 80;
        const actualResult = generateResult(randomMode, numberOfPicked, numberOfSeeds);

        expect(actualResult.length).toEqual(numberOfPicked);
        expect(actualResult).toSatisfyAll((number) => number >= 1 && number <= numberOfSeeds);
    });
});
