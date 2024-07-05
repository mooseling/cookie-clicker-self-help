class AutoPlayer {

    autoClick = true;
    autoClickShimmers = true;
    autoPledge = true;
    autoChristmas = true;
    autoForce = true;
    autoGarden = false; // Got the 1000-plant achievement. The next stage of auto-gardening will be more involved, if we get there.
    autoGodzamok = true;
    autoHarvestLumps = true;

    #running;
    #fastLoopTimeout;
    #fiveSecondLoopTimeout;
    #fifteenMinuteLoopTimeout;
    #godzamokLoopTimeout;


    constructor() {
        this.#running = false;
    }


    run() {
        this.#log('Run');

        if (this.#running) {
            this.#log('Already running. Returning.');
            return;
        }

        this.#running = true;

        this.#log('Starting loops');
        this.#fastLoop();
        this.#fiveSecondLoop();
        this.#fifteenMinuteLoop();
        this.#godzamokLoop();
    }


    stop() {
        this.#log('Stop');

        this.#running = false;
        
        clearTimeout(this.#fastLoopTimeout);
        clearTimeout(this.#fiveSecondLoopTimeout);
        clearTimeout(this.#fifteenMinuteLoopTimeout);
        clearTimeout(this.#godzamokLoopTimeout);
    }


    #fastLoop() {
        if (!this.#running) {
            this.#log('Fastloop: AutoPlayer is not running. Returning.');
            return;
        }

        if (this.autoClick)
            Game.ClickCookie();

        this.#fastLoopTimeout = setTimeout(this.#fastLoop.bind(this), 0);
    }


    #fiveSecondLoop() {
        if (!this.#running) {
            this.#log('5s Loop: AutoPlayer is not running. Returning.');
            return;
        }

        if (this.autoPledge)
            this.#pledgeToTheElders(); // It's safe to call this often, it will check if it's needed
        if (this.autoClickShimmers)
            this.#clickShimmers();
        if (this.autoForce)
            this.#forceTheHandOfFate();
        if (this.autoChristmas)
            this.#stayInChristmas();
        if (this.autoHarvestLumps)
            this.#harvestRipeLumps();

        this.#fiveSecondLoopTimeout = setTimeout(this.#fiveSecondLoop.bind(this), 5000);
    }


    #fifteenMinuteLoop() {
        this.#log('15m Loop: Firing');

        if (!this.#running) {
            this.#log('15m Loop: AutoPlayer is not running. Returning.')
            return;
        }

        if (this.autoGarden) {
            this.#log('15m Loop: Auto-garden is on, replanting bakers wheat');
            this.#replantGardenWithBakersWheat();
        }


        this.#log('Cookies: ' + Game.cookies);

        const grimoire = Game.Objects['Wizard tower'].minigame;
        const magic = grimoire.magic;
        this.#log('Magic: ' + magic);

        this.#fifteenMinuteLoopTimeout = setTimeout(this.#fifteenMinuteLoop.bind(this), 900000);
    }


    #godzamokLoop() {
        if (!this.#running) {
            this.#log('Godzamok Loop: AutoPlayer is not running. Returning.');
            return;
        }

        if (this.autoGodzamok)
            this.#triggerGodzamok();

        // Godzamok lasts 10 seconds, and we really want to rinse it, so timeout for 10.5s
        this.#godzamokLoopTimeout = setTimeout(this.#godzamokLoop.bind(this), 10500);
    }


    #pledgeToTheElders() {
        const elderPledgeButton = document.querySelector('.upgrade[data-id="74"]');
        if (elderPledgeButton && elderPledgeButton.classList.contains('enabled')) {
            this.#log('Pledging to the elders!');
            elderPledgeButton.click();
        }
    }


    // Shimmers are golden cookies and reindeer. We want to auto-click both.
    #clickShimmers() {
        let shimmers = document.getElementById('shimmers').children;
        if (shimmers.length)
            this.#log('Clicking shimmers! There are ' + shimmers.length + ' shimmers.');
        while (shimmers.length) {
            shimmers.item(0)?.click();
            shimmers = document.getElementById('shimmers').children;
        }
    }


    // Magic Meter will read something like "51/121 (+0.03/s)" or "121/121"
    // It fills faster the fuller it is, so we want to wait until we're at max magic to cast anything
    static #MAGIC_REGEX = /^(?<magic>\d+)\/(?<maxMagic>\d+).*$/;

    #forceTheHandOfFate() {
        // We actually no longer use the dom here, because the magic meter does not update reliably
        // Cookie Clicker has its ways of minimising unnecessary work, including updating the GUI when idle
        const grimoire = Game.Objects['Wizard tower'].minigame;
        const magic = grimoire.magic;
        const maxMagic = grimoire.magicM;
        if (magic !== maxMagic)
            return;

        this.#log('Full magic! Casting Force the Hand of Fate!');
        const fthof = grimoire.spells['hand of fate'];
        grimoire.castSpell(fthof);
    }


    #stayInChristmas() {
        const christmasSwitch = document.querySelector('.upgrade[data-id="182"]');
        if (christmasSwitch && christmasSwitch.classList.contains('enabled')) {
            this.#log("Christmas is over! So sad. Let's do it again :)");
            christmasSwitch.click();
        }
    }


    // There's an achievement for harvesting 1000 plants
    // So we continuously harvest and refill the garden with the cheapest, fastest plant: baker's wheat
    // The cost of this is actually kinda steep, but hopefully with golden cookies and auto-clicking, we cover it
    // The timing is based on fertilizer, with average maturation 13 minutes. A fifteen minute loop should give us good harvests.
    #replantGardenWithBakersWheat() {
        const harvestAllButton = document.getElementById('gardenTool-1');
        harvestAllButton.click();
        this.#fillGarden('0');
    }


    #fillGarden(plantId) {
        const gardenTileWrapper = document.getElementById('gardenPlot');
        const tiles = gardenTileWrapper.children;

        this.#log('Found ' + tiles.length + ' garden tiles to fill');

        for (const tile of tiles)
            this.#plantPlant(plantId, tile);
    }


    #plantPlant(plantId, tile) {
        const plantButton = document.getElementById('gardenSeed-' + plantId);
        if (!plantButton)
            return;

        plantButton.click();
        tile.click();
    }


    // Godzamok gives a big click-boost for selling lots of buildings in one go
    // It's massively profitable, and combined with click-frenzies it actually solves the game
    // We will continually re-trigger it, so we get the boost with and without golden cookies
    #triggerGodzamok() {
        // Sell all farms
        document.getElementById('storeBulkSell').click(); // Go into sell mode
        document.getElementById('storeBulkMax').click();  // Switch to sell-all mode
        document.getElementById('product2').click();      // Sell all farms, triggering +850% on clicks

        // Buy farms back to 860. This makes a small profit under normal circumstances
        document.getElementById('storeBulkBuy').click();  // Go back to buy mode
        document.getElementById('storeBulk100').click();  // Switch to buy-100 mode
        document.getElementById('product2').click();      // 100...
        document.getElementById('product2').click();      // 200...
        document.getElementById('product2').click();      // 300...
        document.getElementById('product2').click();      // 400...
        document.getElementById('product2').click();      // 500...
        document.getElementById('product2').click();      // 600...
        document.getElementById('product2').click();      // 700...
        document.getElementById('product2').click();      // 800!
        document.getElementById('storeBulk10').click();   // Switch to buy-10 mode
        document.getElementById('product2').click();      // 810...
        document.getElementById('product2').click();      // 820...
        document.getElementById('product2').click();      // 830...
        document.getElementById('product2').click();      // 840...
        document.getElementById('product2').click();      // 850...
        document.getElementById('product2').click();      // 860!
    }


    // Sugar lump will ripen after ~20 hours, and then fall after another ~1 hour. We save that hour by clicking it when it's ripe.
    #harvestRipeLumps() {
        const lumpAge = Date.now() - Game.lumpT;
        if (lumpAge >= Game.lumpRipeAge) {
            this.#log('Sugar lump is ripe! Harvesting.');
            document.getElementById('lumps')?.click();
        }
    }


    #log(message) {
        const date = new Date();
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        console.log(timeString + ' - ' + message);
    }
}