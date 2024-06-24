class AutoPlayer {

    autoClick = true;
    autoClickShimmers = true;
    autoPledge = true;
    autoChristmas = true;
    autoForce = true;
    autoGarden = true;

    #running;
    #fastLoopTimeout;
    #fiveSecondLoopTimeout;
    #fifteenMinuteLoopTimeout;


    constructor() {
        this.#running = false;
    }


    run() {
        if (this.#running)
            return;

        this.#running = true;

        this.#fastLoop();
        this.#fiveSecondLoop();
        this.#fifteenMinuteLoop();
    }


    stop() {
        this.#running = false;
        
        clearTimeout(this.#fastLoopTimeout);
        clearTimeout(this.#fiveSecondLoopTimeout);
        clearTimeout(this.#fifteenMinuteLoopTimeout);
    }


    #fastLoop() {
        if (!this.#running)
            return;

        if (this.autoClick)
            Game.ClickCookie();

        this.#fastLoopTimeout = setTimeout(this.#fastLoop.bind(this), 0);
    }


    #fiveSecondLoop() {
        if (!this.#running)
            return;

        if (this.autoPledge)
            this.#pledgeToTheElders(); // It's safe to call this often, it will check if it's needed
        if (this.autoClickShimmers)
            this.#clickShimmers();
        if (this.autoForce)
            this.#forceTheHandOfFate();
        if (this.autoChristmas)
            this.#stayInChristmas();

        this.#fiveSecondLoopTimeout = setTimeout(this.#fiveSecondLoop.bind(this), 5000);
    }


    #fifteenMinuteLoop() {
        if (!this.#running)
            return;

        if (this.autoGarden)
            this.#replantGardenWithBakersWheat();

        this.#fifteenMinuteLoopTimeout = setTimeout(this.#fifteenMinuteLoop.bind(this), 900000);
    }


    #pledgeToTheElders() {
        const elderPledgeButton = document.querySelector('.upgrade[data-id="74"]');
        if (elderPledgeButton && elderPledgeButton.classList.contains('enabled'))
            elderPledgeButton.click();
    }


    // Shimmers are golden cookies and reindeer. We want to auto-click both.
    #clickShimmers() {
        const shimmers = document.getElementById('shimmers').children;
        for (const shimmer of shimmers)
            shimmer.click();
    }


    // Magic Meter will read something like "51/121 (+0.03/s)" or "121/121"
    // It fills faster the fuller it is, so we want to wait until we're at max magic to cast anything
    static #MAGIC_REGEX = /^(?<magic>\d+)\/(?<maxMagic>\d+).*$/;

    #forceTheHandOfFate() {
        const magicMeterText = document.getElementById('grimoireBarText')?.innerText || '';
        const {magic, maxMagic} = magicMeterText.match(AutoPlayer.#MAGIC_REGEX).groups;
        if (magicMeterText && (magic !== maxMagic)) // If the dom-read fails, we just fall back to casting FTHOF whenever it's ready
            return;

        const forceButton = document.getElementById('grimoireSpell1');
        if (forceButton && forceButton.classList.contains('ready'))
            forceButton.click();
    }


    #stayInChristmas() {
        const christmasSwitch = document.querySelector('.upgrade[data-id="182"]');
        if (christmasSwitch && christmasSwitch.classList.contains('enabled'))
            christmasSwitch.click();
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
}