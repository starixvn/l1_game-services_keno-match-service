import shuffleNumbers from "./shuffleNumbers";

export const generateResult = (numberOfPicked, numberOfSeeds) => {
    const home = shuffleNumbers(numberOfPicked, numberOfSeeds);
    const away = shuffleNumbers(numberOfPicked, numberOfPicked);

    return { home, away };
};

const fullTimeRuleEntries = Object.entries({
    home: ({ totalHome, totalAway }) => totalHome > totalAway,
    away: ({ totalHome, totalAway }) => totalHome < totalAway,
    draw: ({ totalHome, totalAway }) => totalHome === totalAway,
    over: ({ totalHome, totalAway }) => totalHome + totalAway >= 1621,
    under: ({ totalHome, totalAway }) => totalHome + totalAway < 1621,
    odd: ({ totalHome, totalAway }) => (totalHome + totalAway) % 2 === 1,
    even: ({ totalHome, totalAway }) => (totalHome + totalAway) % 2 === 0,
});

const halfTimeRuleEntries = Object.entries({
    home: ({ totalHome, totalAway }) => totalHome > totalAway,
    away: ({ totalHome, totalAway }) => totalHome < totalAway,
    draw: ({ totalHome, totalAway }) => totalHome === totalAway,
    over: ({ totalHome, totalAway }) => totalHome + totalAway >= 811,
    under: ({ totalHome, totalAway }) => totalHome + totalAway < 811,
    odd: ({ totalHome, totalAway }) => (totalHome + totalAway) % 2 === 1,
    even: ({ totalHome, totalAway }) => (totalHome + totalAway) % 2 === 0,
});

export const getSettlementResult = (totalPoints, isHalfTime) => {
    const ruleEntries = isHalfTime ? halfTimeRuleEntries : fullTimeRuleEntries;

    return ruleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(totalPoints);

        return result;
    }, {});
};
