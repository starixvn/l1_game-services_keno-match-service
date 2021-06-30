import { Core } from "sc-game-base";

import { KenoSoccerApp } from "../src/app";

describe("Keno soccer app instance", () => {
    const app = new KenoSoccerApp("Keno Soccer", {});
    it("inherit Core.BaseGameApp", () => {
        expect(app instanceof Core.BaseGameApp).toBeTruthy();
    });
});
