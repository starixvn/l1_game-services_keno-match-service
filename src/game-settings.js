import { choices, choicesMapper } from "./constants";
import { getSettlementResult } from "./helpers/result-helper";
import generateResult from "./helpers/shuffleNumbers";
import getBetLogsRepository from "./models/bet-logs";
import getBetRepository from "./models/bets";
import getRoundRepository from "./models/rounds";

export default [
    {
        id: 37,
        name: "KenoWarMatchOne",
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
            roundsRepository: getRoundRepository("KenoWarMatchOne_phien"),
            betsRepository: getBetRepository("KenoWarMatchOne_one"),
            betLogsRepository: getBetLogsRepository("KenoWarMatchOne_cuoc"),
        },
        generateResult: (excludeNumbers) => generateResult(10, 80, excludeNumbers),
        settle: getSettlementResult,
    },
];
