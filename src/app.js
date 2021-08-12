import { Core } from "sc-game-base";
import { GameDefinition } from "sc-multiple-games-base";

import appConfigs from "./app-configs";
import { GameData } from "./game-data";
import gameSettings from "./game-settings";
import KenoMatchContainerRegistry from "./keno-match-container-registry";

export class KenoMatchApp extends Core.BaseGameApp {
    /**
     * @param {GameDefinition[]} definitions
     */
    startGames(definitions) {
        definitions.forEach(async (definition) => {
            const container = new KenoMatchContainerRegistry().register(
                this.appConfigs,
                definition,
                new GameData(definition.durations.wholeRound)
            );
            await this.startGame(container);
        });
    }
}

const run = async () => {
    const definitions = gameSettings.map((gameSetting) => new GameDefinition(gameSetting));
    const app = new KenoMatchApp("Keno Match", appConfigs);
    await app.run();
    app.startGames(definitions);
};

run();
