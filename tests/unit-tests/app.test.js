import { Core } from "sc-game-base";

import MultipleGamesApp from "../../src/multiple-games-app";

describe("Keno match app instance", () => {
    const app = new MultipleGamesApp("Keno Match", {});

    it("inherit Core.BaseGameApp", () => {
        expect(app instanceof Core.BaseGameApp).toBeTruthy();
    });
});
