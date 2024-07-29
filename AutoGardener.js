class AutoGardener {

    running = false;
    loopTimeout;

    QUEENBEET_ID = 20;


    run() {
        this.running = true;
        this.loop();
    }


    stop() {
        this.running = false;
        clearTimeout(this.loopTimeout);
    }


    loop() {
        if (!this.running)
            return;

        this.juicyQueenbeetStrategy();

        this.loopTimeout = setTimeout(this.loop.bind(this), 30_000);
    }


    // The first purpose of this class is to try to unlock Juicy Queenbeets
    juicyQueenbeetStrategy() {
        this.juicyQueenBeetQuadrants.forEach(this.maintainQuadrant.bind(this));
        this.useBestSoilType();
    }


    // We can't just replant individual Queenbeets when they die. They take a long time to mature, and then die quickly.
    // This means, with a simple auto-planter, the quadrant very quickly becomes useless. The queenbeets will be totally out of sync.
    maintainQuadrant({borderTiles, targetTile}) {
        // If any border tiles are empty, a queenbeet has died. We harvest the rest and replant them all.
        const aQueenbeetHasDied = borderTiles.some(coords => {
            const plantId = this.getPlantAt(coords).id;
            return plantId !== this.QUEENBEET_ID; // Could be blank, could be a weed
        });

        if (aQueenbeetHasDied) {
            this.harvestTiles(borderTiles);
            this.plantPlants(borderTiles, this.QUEENBEET_ID)
        }

       this.maintainTargetTile(targetTile);
    }


    maintainTargetTile(coords) {
        const {id, age} = this.getPlantAt(coords);

        if (id === 21) {
            // It's a juicy queenbeet! Is it mature?
            if (age >= this.juicyQueenbeet.mature)
                this.harvestTiles([coords]); // Yes! Harvest! Woohoo!
        } else if (id !== null) {
            // It must be a weed
            this.harvestTiles([coords]); // Pull it out!
        }
    }


    useBestSoilType() {
        const queenbeetMatureAge = this.queenbeet.mature;
        const allQueenbeetsAreMature = this.juicyQueenBeetQuadrants.every(
            ({borderTiles}) => borderTiles.every(coords => this.getPlantAt(coords).age >= queenbeetMatureAge));
        
        const bestSoil = allQueenbeetsAreMature
         ? 4 // Woodchips: increased mutation
         : 1 // Fertilizer: age quickly

        // We could directly set the soil type, but there's some game logic in the click-handler. We want to make sure we're not cheating.
        if (this.garden.soil !== bestSoil)
            document.getElementById('gardenSoil-'+bestSoil).click();
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
        tiles.forEach(([y, x]) => this.garden.useTool(plantId, x, y));
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


    get garden() {
        return Game.Objects.Farm.minigame;
    }

    get queenbeet() {
        return this.garden.plants.queenbeet;
    }

    get juicyQueenbeet() {
        return this.garden.plants.queenbeetLump;
    }
}