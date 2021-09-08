import Chance from "chance";
import { MersenneTwister19937, Random } from "random-js";

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

export default (numberOfPicked, numberOfSeeds, excludeNumbers) => {
    const randomSelection = chance.natural({ min: 0, max: algorithms.length - 1 });
    const result = algorithms[randomSelection](numberOfPicked, numberOfSeeds, excludeNumbers);
    result.sort((pre, next) => pre - next);

    return result;
};
