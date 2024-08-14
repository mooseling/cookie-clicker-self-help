class AutoGardener {

    running = false;
    loopTimeout;

    QUEENBEET_ID = 20;


    run() {
        this.log("Run!");

        this.running = true;
        this.loop();
    }


    stop() {
        this.log("Stop!");

        this.running = false;
        clearTimeout(this.loopTimeout);
    }


    loop() {
        if (!this.running)
            return;

        this.log("Pottering...");

        this.juicyQueenbeetStrategy();

        this.loopTimeout = setTimeout(this.loop.bind(this), 170_000); // Every 2m50s, enough to catch each garden tick
    }


    // The first purpose of this class is to try to unlock Juicy Queenbeets
    juicyQueenbeetStrategy() {
        this.juicyQueenBeetQuadrants.forEach((quadrant, index) => this.maintainQuadrant(quadrant, index));
        this.useBestSoilType();
    }


    // We can't just replant individual Queenbeets when they die. They take a long time to mature, and then die quickly.
    // This means, with a simple auto-planter, the quadrant very quickly becomes useless. The queenbeets will be totally out of sync.
    maintainQuadrant({borderTiles, targetTile}, quadrantIndex) {
        // If any border tiles are empty, a queenbeet has died. We harvest the rest and replant them all.
        const aQueenbeetHasDied = borderTiles.some(coords => {
            const plantId = this.getPlantAt(coords).id;
            return plantId !== this.QUEENBEET_ID; // Could be blank, could be a weed
        });

        if (aQueenbeetHasDied) {
            this.log("Replanting border in quadrant " + quadrantIndex);
            this.harvestTiles(borderTiles);
            this.plantPlants(borderTiles, this.QUEENBEET_ID)
        }

       this.maintainTargetTile(targetTile);
    }


    maintainTargetTile(coords) {
        const {id, age} = this.getPlantAt(coords);

        if (id === 21) {
            // It's a juicy queenbeet! Is it mature?
            if (age >= this.juicyQueenbeet.mature) {
                this.log("There's a Juicy Queenbeet! Harvesting!");
                this.harvestTiles([coords]); // Yes! Harvest! Woohoo!
            }
        } else if (id !== null) {
            // It must be a weed
            this.log(`Found a weed or something (id ${id}), pulling it out.`);
            this.harvestTiles([coords]); // Pull it out!
        }
    }


    useBestSoilType() {
        const queenbeetMatureAge = this.queenbeet.mature;
        const anyQuadrantsAreMature = this.juicyQueenBeetQuadrants.some(
            ({borderTiles}) => borderTiles.every(coords => this.getPlantAt(coords).age >= queenbeetMatureAge));
        
        const bestSoil = anyQuadrantsAreMature
         ? 4 // Woodchips: increased mutation
         : 1 // Fertilizer: age quickly

        // We could directly set the soil type, but there's some game logic in the click-handler. We want to make sure we're not cheating.
        if (this.garden.soil !== bestSoil) {
            this.log("Switching soil to " + this.getSoilName(bestSoil));
            document.getElementById('gardenSoil-'+bestSoil).click();
        }
    }


    getSoilName(soilId) {
        switch (soilId) {
            case 1: return 'fertilizer';
            case 4: return 'woodchips';
            default: return soilId + '';
        }
    }


    getPlantAt([y, x]) {
        const [plantIdPlusOne, age] = this.garden.plot[y][x];

        // In the plot, 0 means a blank tile. But baker's wheat has ID 0. So plant IDs in the plot have 1 added to them
        const id = plantIdPlusOne === 0 ? null : plantIdPlusOne - 1;

        return {id, age};
    }


    harvestTiles(tiles) {
        tiles.forEach(([y, x]) => this.garden.harvest(x, y, 1)); // Third param is "manual", and appears unused
    }


    plantPlants(tiles, plantId) {
        tiles.forEach(([y, x]) => this.plantPlant(y, x, plantId));
    }


    plantPlant(y, x, plantId) {
        this.garden.useTool(plantId, x, y);
    }

    
    // coordinates are [y, x], top to bottom, left to right
    juicyQueenBeetQuadrants = [
        {
            borderTiles: [
                [0, 0], [0, 1], [0, 2],
                [1, 0],         [1, 2],
                [2, 0], [2, 1], [2, 2]
            ],
            targetTile: [1, 1]
        },
        {
            borderTiles: [
                [0, 3], [0, 4], [0, 5],
                [1, 3],         [1, 5],
                [2, 3], [2, 4], [2, 5]
            ],
            targetTile: [1, 1]
        },
        {
            borderTiles: [
                [3, 0], [3, 1], [3, 2],
                [4, 0],         [4, 2],
                [5, 0], [5, 1], [5, 2]
            ],
            targetTile: [1, 1]
        },
        {
            borderTiles: [
                [3, 3], [3, 4], [3, 5],
                [4, 3],         [4, 5],
                [5, 3], [5, 4], [5, 5]
            ],
            targetTile: [1, 1]
        },
    ];


    // There's an achievement for harvesting 1000 plants
    // So we continuously harvest and refill the garden with the cheapest, fastest plant: baker's wheat
    // The cost of this is actually kinda steep, but hopefully with golden cookies and auto-clicking, we cover it
    // The timing is based on fertilizer, with average maturation 13 minutes. A fifteen minute loop should give us good harvests.
    replantGardenWithBakersWheat() {
        const harvestAllButton = document.getElementById('gardenTool-1');
        harvestAllButton.click();
        this.fillGarden('0');
    }


    fillGarden(plantId) {
        for (const y of this.garden.plot) {
            for (const x of this.garden.plot[y]) {
                const existingPlantId = this.garden.plot[y][x][0];
                if (!existingPlantId)
                    this.plantPlant(y, x, plantId);
            }
        }
    }


    get garden() {
        return Game.Objects.Farm.minigame;
    }

    get queenbeet() {
        return this.garden.plants.queenbeet;
    }

    get juicyQueenbeet() {
        return this.garden.plants.queenbeetLump;
    }


    log(message, level = 'log') {
        const date = new Date();
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const preamble = timeString + ' - ' + 'AutoGardener';

        switch (level) {
            case 'debug':
                console.debug(preamble + ' - ' + message);
            default:
                console.log(preamble + ' - ' + message);
        }
    }
}