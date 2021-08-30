const fullTimeRuleEntries = Object.entries({
    blue: ({ totalBlue, totalRed }) => totalBlue > totalRed,
    red: ({ totalBlue, totalRed }) => totalBlue < totalRed,
    tie: ({ totalBlue, totalRed }) => totalBlue === totalRed,
    over: ({ totalBlue, totalRed }) => totalBlue + totalRed >= 1621,
    under: ({ totalBlue, totalRed }) => totalBlue + totalRed < 1621,
    odd: ({ totalBlue, totalRed }) => (totalBlue + totalRed) % 2 === 1,
    even: ({ totalBlue, totalRed }) => (totalBlue + totalRed) % 2 === 0,
});

const firstHalfRuleEntries = Object.entries({
    blue: ({ totalBlue, totalRed }) => totalBlue > totalRed,
    red: ({ totalBlue, totalRed }) => totalBlue < totalRed,
    tie: ({ totalBlue, totalRed }) => totalBlue === totalRed,
    over: ({ totalBlue, totalRed }) => totalBlue + totalRed >= 811,
    under: ({ totalBlue, totalRed }) => totalBlue + totalRed < 811,
    odd: ({ totalBlue, totalRed }) => (totalBlue + totalRed) % 2 === 1,
    even: ({ totalBlue, totalRed }) => (totalBlue + totalRed) % 2 === 0,
});

export const getSettlementResult = (totalPoints, isFirstHalf) => {
    const ruleEntries = isFirstHalf ? firstHalfRuleEntries : fullTimeRuleEntries;

    return ruleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(totalPoints);

        return result;
    }, {});
};
