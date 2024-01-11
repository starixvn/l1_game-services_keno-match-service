import Chance from "chance";
import { MersenneTwister19937, Random } from "random-js";
import { shuffle as d3Shuffle } from "d3-array";
import _ from "lodash";

const chance = new Chance();
const random = new Random(MersenneTwister19937.autoSeed());
const generateSeeds = (numberOfSeeds, excludeNumbers) => {
    const result = [...Array(numberOfSeeds + 1).keys()].slice(1);

    if (excludeNumbers && excludeNumbers.length) {
        return result.filter((n) => !excludeNumbers.includes(n));
    }

    return result;
};

const random1 = (numberOfPicked, numberOfSeeds, excludeNumbers) =>
    chance.shuffle(chance.shuffle(chance.shuffle(generateSeeds(numberOfSeeds, excludeNumbers)))).slice(0, numberOfPicked);

const random2 = (numberOfPicked, numberOfSeeds, excludeNumbers) => {
    return d3Shuffle(d3Shuffle(d3Shuffle(generateSeeds(numberOfSeeds, excludeNumbers)))).slice(0, numberOfPicked);
};

const random3 = (numberOfPicked, numberOfSeeds, excludeNumbers) =>
    _.shuffle(_.shuffle(_.shuffle(generateSeeds(numberOfSeeds, excludeNumbers)))).slice(0, numberOfPicked);

const random4 = (numberOfPicked, numberOfSeeds, excludeNumbers) =>
    chance.pickset(generateSeeds(numberOfSeeds, excludeNumbers), numberOfPicked);

const random5 = (numberOfPicked, numberOfSeeds, excludeNumbers) =>
    random.shuffle([...generateSeeds(numberOfSeeds, excludeNumbers)]).slice(0, numberOfPicked);

const random6 = (numberOfPicked, numberOfSeeds, excludeNumbers) =>
    random.sample(generateSeeds(numberOfSeeds, excludeNumbers), numberOfPicked);

export const randomModes = {
    1: [random1, random2, random3, random4],
    2: [random3, random4, random5, random6],
    3: [random1, random2, random5, random6],
};

export default (randomMode, numberOfPicked, numberOfSeeds, excludeNumbers) => {
    const randomShuffles = randomModes[randomMode] || randomModes[1];
    const result = chance.pickone(randomShuffles)(numberOfPicked, numberOfSeeds, excludeNumbers);
    return result.sort((pre, next) => pre - next);
};
