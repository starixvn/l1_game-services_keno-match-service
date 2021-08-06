import { asClass, asValue } from "awilix";
import { Table } from "sc-game-base";

import { AdminMonitorConsumer, PlaceBetConsumer, SettleGameRoundConsumer } from "./consumers";
import { GameCron, ProcessBetQueue } from "./crons";
import { GameData } from "./game-data";
import globalConfigs from "./models/global-configs";

export default class KenoSoccerContainerRegistry  extends Table.TableContainerRegistry {
    /**
     * @param {object} appConfigs
     * @param {GameDefinition} definition
     * @param {GameData} gameData
     */
    register(appConfigs, definition, gameData) {
        super.register(appConfigs, definition, gameData);

        this.registerRepositories(definition.repositories);

        return this.container;
    }

    registerModels() {
        super.registerModels();

        this.container.register({
            globalConfigsRepository: asValue(globalConfigs),
        });
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
            adminMonitorConsumer: asClass(AdminMonitorConsumer).singleton(),
        });
    }
}
