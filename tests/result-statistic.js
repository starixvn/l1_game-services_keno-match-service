import { generateResult, getSettlementResult } from "../src/helpers/result-helper";
import { sumArrayNumber } from "../src/helpers/array-helper";

export const hedgeBetGroups = [["blue", "red"], ["over", "under"], ["even", "odd"], ["tie"]];

function run() {
    const totalRounds = 100_000;
    const streaks = {
        firstHalf: {
            blue: {},
            red: {},
            tie: {},
            over: {},

            under: {},
            odd: {},
            even: {},
        },
        fullTime: {
            blue: {},
            red: {},
            tie: {},
            over: {},

            under: {},
            odd: {},
            even: {},
        },
    };

    const streakNumber = 4;
    const longestStreak = 4;
    let occurrencesFirstHalf = {},
        occurrencesFullTime = {};
    let prevFirstHalfResult = {},
        prevFullTimeResult = {};

    const stats = {
        firstHalf: {},
        fullTime: {},
        streaks: {
            total: 0,
            firstHalf: { blue: 0, red: 0, tie: 0, over: 0, under: 0, odd: 0, even: 0 },
            fullTime: { blue: 0, red: 0, tie: 0, over: 0, under: 0, odd: 0, even: 0 },
        },
    };

    const randomMode = 1;

    for (let index = 0; index < totalRounds; index++) {
        const firstHalfResult = { blue: generateResult(randomMode), red: generateResult(randomMode) };

        const totalFistHalfBlue = sumArrayNumber(firstHalfResult.blue);
        const totalFistHalfRed = sumArrayNumber(firstHalfResult.red);
        const fistHalfsettlement = getSettlementResult({ totalBlue: totalFistHalfBlue, totalRed: totalFistHalfRed }, true);

        const fullTimeResult = {
            blue: generateResult(randomMode, firstHalfResult.blue),
            red: generateResult(randomMode, firstHalfResult.red),
        };
        const totalFullTimeBlue = sumArrayNumber(fullTimeResult.blue) + totalFistHalfBlue;
        const totalFullTimeRed = sumArrayNumber(fullTimeResult.red) + totalFistHalfRed;
        const fullTimesettlement = getSettlementResult({ totalBlue: totalFullTimeBlue, totalRed: totalFullTimeRed }, false);

        hedgeBetGroups.forEach((group) => {
            const currentFirstHalfWinningOption = group.find((choice) => fistHalfsettlement[choice]);
            const currentFullTimeWinningOption = group.find((choice) => fullTimesettlement[choice]);

            if (prevFirstHalfResult[currentFirstHalfWinningOption]) {
                occurrencesFirstHalf[currentFirstHalfWinningOption]++;
            } else {
                if (occurrencesFirstHalf[currentFirstHalfWinningOption] >= streakNumber) {
                    stats.streaks.total++;
                    stats.streaks.firstHalf[currentFirstHalfWinningOption]++;

                    if (occurrencesFirstHalf[currentFirstHalfWinningOption] >= longestStreak) {
                        streaks.firstHalf[currentFirstHalfWinningOption][occurrencesFirstHalf[currentFirstHalfWinningOption]] =
                            streaks.firstHalf[currentFirstHalfWinningOption][occurrencesFirstHalf[currentFirstHalfWinningOption]] ?? 0;
                        streaks.firstHalf[currentFirstHalfWinningOption][occurrencesFirstHalf[currentFirstHalfWinningOption]]++;
                    }
                }

                occurrencesFirstHalf[currentFirstHalfWinningOption] = 1;
            }

            if (prevFullTimeResult[currentFullTimeWinningOption]) {
                occurrencesFullTime[currentFullTimeWinningOption]++;
            } else {
                if (occurrencesFullTime[currentFullTimeWinningOption] >= streakNumber) {
                    stats.streaks.total++;
                    stats.streaks.fullTime[currentFullTimeWinningOption]++;

                    if (occurrencesFullTime[currentFullTimeWinningOption] >= longestStreak) {
                        streaks.fullTime[currentFullTimeWinningOption][occurrencesFullTime[currentFullTimeWinningOption]] =
                            streaks.fullTime[currentFullTimeWinningOption][occurrencesFullTime[currentFullTimeWinningOption]] ?? 0;
                        streaks.fullTime[currentFullTimeWinningOption][occurrencesFullTime[currentFullTimeWinningOption]]++;
                    }
                }

                occurrencesFullTime[currentFullTimeWinningOption] = 1;
            }
        });

        prevFirstHalfResult = fistHalfsettlement;
        prevFullTimeResult = fullTimesettlement;

        Object.keys(fistHalfsettlement).reduce((choiceResults, choice) => {
            stats.firstHalf[choice] = stats.firstHalf[choice] ?? { count: 0, ratio: 0 };
            stats.firstHalf[choice].count += fistHalfsettlement[choice] ? 1 : 0;
            stats.firstHalf[choice].ratio = stats.firstHalf[choice].count / totalRounds;
        }, {});

        Object.keys(fullTimesettlement).reduce((choiceResults, choice) => {
            stats.fullTime[choice] = stats.fullTime[choice] ?? { count: 0, ratio: 0 };
            stats.fullTime[choice].count += fullTimesettlement[choice] ? 1 : 0;
            stats.fullTime[choice].ratio = stats.fullTime[choice].count / totalRounds;
        }, {});
    }
    console.log(`======== Run ${totalRounds} rounds ========`);

    console.log(stats);
    console.log(`Longest streaks (>=${longestStreak}): `);
    console.log(JSON.stringify(streaks));
}
run();
