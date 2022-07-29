import { Core } from "sc-game-base";
import { GameData } from "./game-data";
import KenoMatchContainerRegistry from "./keno-match-container-registry";

export default class MultipleGamesApp extends Core.BaseGameApp {
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
