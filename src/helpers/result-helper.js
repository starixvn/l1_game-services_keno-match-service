const fullTimeRuleEntries = Object.entries({
    blue: ({ totalBlue, totalRed }) => totalBlue > totalRed,
    red: ({ totalBlue, totalRed }) => totalBlue < totalRed,
    draw: ({ totalBlue, totalRed }) => totalBlue === totalRed,
    over: ({ totalBlue, totalRed }) => totalBlue + totalRed >= 1621,
    under: ({ totalBlue, totalRed }) => totalBlue + totalRed < 1621,
    odd: ({ totalBlue, totalRed }) => (totalBlue + totalRed) % 2 === 1,
    even: ({ totalBlue, totalRed }) => (totalBlue + totalRed) % 2 === 0,
});

const halfTimeRuleEntries = Object.entries({
    blue: ({ totalBlue, totalRed }) => totalBlue > totalRed,
    red: ({ totalBlue, totalRed }) => totalBlue < totalRed,
    draw: ({ totalBlue, totalRed }) => totalBlue === totalRed,
    over: ({ totalBlue, totalRed }) => totalBlue + totalRed >= 811,
    under: ({ totalBlue, totalRed }) => totalBlue + totalRed < 811,
    odd: ({ totalBlue, totalRed }) => (totalBlue + totalRed) % 2 === 1,
    even: ({ totalBlue, totalRed }) => (totalBlue + totalRed) % 2 === 0,
});

export const getSettlementResult = (totalPoints, isHalfTime) => {
    const ruleEntries = isHalfTime ? halfTimeRuleEntries : fullTimeRuleEntries;

    return ruleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(totalPoints);

        return result;
    }, {});
};
