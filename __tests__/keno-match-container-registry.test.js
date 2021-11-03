import { MultipleGamesContainerRegistry } from "sc-multiple-games-base";

import KenoMatchContainerRegistry from "../src/keno-match-container-registry";

describe("keno-match-container-registry", () => {
    describe("extends", () => {
        it("inherit MultipleGamesContainerRegistry", () => {
            // arrange
            const serviceContainerRegistry = new KenoMatchContainerRegistry();

            //assert
            expect(serviceContainerRegistry instanceof MultipleGamesContainerRegistry);
        });
    });
});
