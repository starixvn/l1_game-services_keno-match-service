import { Core, Table } from "sc-game-base";

import appConfigs from "./app-configs";
import { GameData } from "./game-data";
import gameSettings from "./game-settings";
import { getSettlementResult } from "./helpers/result-helper";
import KenoSoccerContainerRegistry from "./keno-soccer-container-registry";

export class KenoSoccerApp extends Core.BaseGameApp {
    /**
     * @param {GameDefinition[]} definitions
     */
    startGames(definitions) {
        definitions.forEach(async (definition) => {
            const container = new KenoSoccerContainerRegistry().register(
                this.appConfigs,
                definition,
                new GameData(definition.durations.wholeRound)
            );
            await this.startGame(container);
        });
    }
}

const run = async () => {
    const definition = new Table.TableGameDefinition(gameSettings, {}, getSettlementResult);
    const app = new KenoSoccerApp("Keno Soccer", appConfigs);
    await app.run();
    app.startGames(definition);
};

run();
