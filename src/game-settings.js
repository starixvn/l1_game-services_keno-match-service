import { choices, choicesMapper } from "./constants";
import { getSettlementResult } from "./helpers/result-helper";
import generateResult from "./helpers/shuffleNumbers";
import getBetLogsRepository from "./models/bet-logs";
import getBetRepository from "./models/bets";
import getRoundRepository from "./models/rounds";

export default [
    {
        id: 36,
        name: "MyDinh",
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
            roundsRepository: getRoundRepository("MyDinh_phien"),
            betsRepository: getBetRepository("MyDinh_one"),
            betLogsRepository: getBetLogsRepository("MyDinh_cuoc"),
        },
        generateResult: (excludeNumbers) => generateResult(10, 80, excludeNumbers),
        settle: getSettlementResult,
    },
    {
        id: 37,
        name: "HangDay",
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
            roundsRepository: getRoundRepository("HangDay_phien"),
            betsRepository: getBetRepository("HangDay_one"),
            betLogsRepository: getBetLogsRepository("HangDay_cuoc"),
        },
        generateResult: (excludeNumbers) => generateResult(10, 80, excludeNumbers),
        settle: getSettlementResult,
    },
    {
        id: 38,
        name: "ThongNhat",
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
            roundsRepository: getRoundRepository("ThongNhat_phien"),
            betsRepository: getBetRepository("ThongNhat_one"),
            betLogsRepository: getBetLogsRepository("ThongNhat_cuoc"),
        },
        generateResult: (excludeNumbers) => generateResult(10, 80, excludeNumbers),
        settle: getSettlementResult,
    },
];
