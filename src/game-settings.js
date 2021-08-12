import { choices, choicesMapper } from "./constants";
import { getSettlementResult } from "./helpers/result-helper";
import generateResult from "./helpers/shuffleNumbers";
import getBetLogsRepository from "./models/bet-logs";
import getBetRepository from "./models/bets";
import getRoundRepository from "./models/rounds";

export default [
    {
        id: 36,
        name: "KenoMatchOne",
        durations: {
            wholeRound: 60,
            halfTimePlacingBets: 52,
            halfTimeLockingBet: 30,
            finishHalfTime: 25,
            placingBets: 18,
            lockingBet: 5,
        },
        choices,
        choicesMapper,
        defaultBetTracks: {},
        repositories: {
            roundsRepository: getRoundRepository("kenomatchone_phien"),
            betsRepository: getBetRepository("kenomatchone_cuoc"),
            betLogsRepository: getBetLogsRepository("kenomatchone_log"),
        },
        generateResult: (excludeNumbers) => generateResult(10, 80, excludeNumbers),
        settle: getSettlementResult,
    },
    {
        id: 37,
        name: "KenoMatchTwo",
        durations: {
            wholeRound: 60,
            halfTimePlacingBets: 52,
            halfTimeLockingBet: 30,
            finishHalfTime: 25,
            placingBets: 18,
            lockingBet: 5,
        },
        choices,
        choicesMapper,
        defaultBetTracks: {},
        repositories: {
            roundsRepository: getRoundRepository("kenomatchtwo_phien"),
            betsRepository: getBetRepository("kenomatchtwo_cuoc"),
            betLogsRepository: getBetLogsRepository("kenomatchtwo_log"),
        },
        generateResult: (excludeNumbers) => generateResult(10, 80, excludeNumbers),
        settle: getSettlementResult,
    },
];
