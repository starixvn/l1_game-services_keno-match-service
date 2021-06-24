import { asClass, asValue } from "awilix";
import { Core } from "sc-game-base";
import { GameDefinition, MultipleGamesContainerRegistry } from "sc-multiple-games-base";

import { PlaceBetConsumer, SettleGameRoundConsumer } from "./consumers";
import { GameCron, ProcessBetQueue } from "./crons";

export default class KenoSoccerContainerRegistry extends MultipleGamesContainerRegistry {
    /**
     * @param {object} appConfigs
     * @param {GameDefinition} definition
     * @param {Core.GameData} gameData
     * @returns
     */
    register(appConfigs, definition, gameData) {
        super.register(appConfigs, definition, gameData);

        this.registerRepositories(definition.repositories);

        return this.container;
    }

    registerRepositories(repositories) {
        this.container.register({
            roundsRepository: asValue(repositories.roundsRepository),
            betsRepository: asValue(repositories.betsRepository),
            betLogsRepository: asValue(repositories.betLogsRepository),
            tempBetsRepository: asValue(repositories.tempBetsRepository),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            gameCron: asClass(GameCron).singleton().proxy(),
            processBetQueue: asClass(ProcessBetQueue).singleton().proxy(),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
            settleGameRoundConsumer: asClass(SettleGameRoundConsumer).singleton().proxy(),
        });
    }
}
