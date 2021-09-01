export const choices = [
    "fhBlue",
    "fhRed",
    "fhOver",
    "fhUnder",
    "fhEven",
    "fhOdd",
    "ftBlue",
    "ftRed",
    "ftOver",
    "ftUnder",
    "ftEven",
    "ftOdd",
    "liveFTBlue",
    "liveFTRed",
    "liveFTOver",
    "liveFTUnder",
];

export const preLiveChoices = [
    "fhBlue",
    "fhRed",
    "fhOver",
    "fhUnder",
    "fhEven",
    "fhOdd",
    "ftBlue",
    "ftRed",
    "ftOver",
    "ftUnder",
    "ftEven",
    "ftOdd",
];

export const firstHalfChoiceMapper = {
    blue: ["fhBlue"],
    red: ["fhRed"],
    over: ["fhOver"],
    under: ["fhUnder"],
    odd: ["fhOdd"],
    even: ["fhEven"],
};

export const fullTimeChoiceMapper = {
    blue: ["ftBlue", "liveFTBlue"],
    red: ["ftRed", "liveFTRed"],
    over: ["ftOver", "liveFTOver"],
    under: ["ftUnder", "liveFTUnder"],
    odd: ["ftOver"],
    even: ["ftEven"],
};

export const liveChoices = ["liveFTBlue", "liveFTRed", "liveFTOver", "liveFTUnder"];

export const choicesMapper = {
    fhBlue: 1,
    fhRed: 2,
    fhOver: 3,
    fhUnder: 4,
    fhEven: 5,
    fhOdd: 6,
    ftBlue: 7,
    ftRed: 8,
    ftOver: 9,
    ftUnder: 10,
    ftEven: 11,
    ftOdd: 12,
    liveFTBlue: 13,
    liveFTRed: 14,
    liveFTOver: 15,
    liveFTUnder: 16,
};
