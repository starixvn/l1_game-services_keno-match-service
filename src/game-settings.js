import { choices, choicesMapper } from "./constants";
import { getSettlementResult } from "./helpers/result-helper";
import generateResult from "./helpers/shuffleNumbers";
import getBetLogsRepository from "./models/bet-logs";
import getBetRepository from "./models/bets";
import getRoundRepository from "./models/rounds";

export default [
    {
        id: 36,
        name: "KenoMatch1",
        durations: {
            wholeRound: 62,
            firstHalfPlacingBets: 54,
            firstHalfLockingBet: 32,
            finishFirstHalf: 27,
            placingBets: 18,
            lockingBet: 5,
        },
        choices,
        choicesMapper,
        defaultBetTracks: {},
        repositories: {
            roundsRepository: getRoundRepository("kenomatch1_phien"),
            betsRepository: getBetRepository("kenomatch1_one"),
            betLogsRepository: getBetLogsRepository("kenomatch1_cuoc"),
        },
        generateResult: (excludeNumbers) => generateResult(10, 80, excludeNumbers),
        settle: getSettlementResult,
    },
    {
        id: 37,
        name: "KenoMatch2",
        durations: {
            wholeRound: 70,
            firstHalfPlacingBets: 58,
            firstHalfLockingBet: 36,
            finishFirstHalf: 31,
            placingBets: 18,
            lockingBet: 5,
        },
        choices,
        choicesMapper,
        defaultBetTracks: {},
        repositories: {
            roundsRepository: getRoundRepository("kenomatch2_phien"),
            betsRepository: getBetRepository("kenomatch2_one"),
            betLogsRepository: getBetLogsRepository("kenomatch2_cuoc"),
        },
        generateResult: (excludeNumbers) => generateResult(10, 80, excludeNumbers),
        settle: getSettlementResult,
    },
];
