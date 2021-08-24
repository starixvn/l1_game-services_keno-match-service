import { Core } from "sc-game-base";

import { KenoMatchApp } from "../src/app";

describe("Keno match app instance", () => {
    const app = new KenoMatchApp("Keno Match", {});
    it("inherit Core.BaseGameApp", () => {
        expect(app instanceof Core.BaseGameApp).toBeTruthy();
    });
});
