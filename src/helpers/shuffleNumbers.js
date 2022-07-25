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

const shuffleThenPickByChance = (numberOfPicked, numberOfSeeds, excludeNumbers) => {
    return chance.pickset(generateSeeds(numberOfSeeds, excludeNumbers), numberOfPicked);
};

const shuffleThenPickByRandomJs = (numberOfPicked, numberOfSeeds, excludeNumbers) => {
    return random.shuffle(generateSeeds(numberOfSeeds, excludeNumbers)).slice(0, numberOfPicked);
};

const randomlyPickNumbersByRandomJs = (numberOfPicked, numberOfSeeds, excludeNumbers) => {
    return random.sample(generateSeeds(numberOfSeeds, excludeNumbers), numberOfPicked);
};

const algorithms = [shuffleThenPickByChance, shuffleThenPickByRandomJs, randomlyPickNumbersByRandomJs];

const random1 = (numberOfPicked, numberOfSeeds, excludeNumbers) => {
    const randomSelection = chance.natural({
        min: 0,
        max: algorithms.length - 1,
    });

    return algorithms[randomSelection](numberOfPicked, numberOfSeeds, excludeNumbers);
};

const random2 = (numberOfPicked, numberOfSeeds, excludeNumbers) => {
    return d3Shuffle(d3Shuffle(d3Shuffle(generateSeeds(numberOfSeeds, excludeNumbers)))).slice(0, numberOfPicked);
};

const random3 = (numberOfPicked, numberOfSeeds, excludeNumbers) =>
    _.shuffle(_.shuffle(_.shuffle(generateSeeds(numberOfSeeds, excludeNumbers)))).slice(0, numberOfPicked);

const randomModes = {
    1: [random1],
    2: [random2],
    3: [random3],
};

export default (randomMode, numberOfPicked, numberOfSeeds, excludeNumbers) => {
    const randomShuffles = randomModes[randomMode] || randomModes[1];
    const result = chance.pickone(randomShuffles)(numberOfPicked, numberOfSeeds, excludeNumbers);
    return result.sort((pre, next) => pre - next);
};
