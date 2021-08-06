import { Core } from "sc-game-base";

import appConfigs from "./app-configs";
import gameSettings from "./game-settings";
import KenoSoccerContainerRegistry from "./keno-soccer-container-registry";

const run = async () => {
    const definition = new Core.GameDefinition(gameSettings, gameSettings.generateResult, gameSettings.settle);
    const gameData = new Core.GameData(gameSettings.durations.wholeRound);
    const container = new KenoSoccerContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp(container);

    await app.run();
};

run();
