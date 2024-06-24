class AutoPlayer {

    autoClick = true;
    autoClickShimmers = true;
    autoPledge = true;
    autoChristmas = true;
    autoForce = true;

    #running;
    #fastLoopTimeout;
    #slowLoopTimeout;


    constructor() {
        this.#running = false;
    }


    run() {
        if (this.#running)
            return;

        this.#running = true;

        this.#fastLoop();
        this.#slowLoop();
    }


    stop() {
        this.#running = false;
        
        clearTimeout(this.#fastLoopTimeout);
        clearTimeout(this.#slowLoopTimeout);
    }


    #fastLoop() {
        if (!this.#running)
            return;

        if (this.autoClick)
            Game.ClickCookie();

        this.#fastLoopTimeout = setTimeout(this.#fastLoop.bind(this), 0);
    }


    #slowLoop() {
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

        this.#slowLoopTimeout = setTimeout(this.#slowLoop.bind(this), 5000);
    }


    #pledgeToTheElders() {
        const elderPledgeButton = document.querySelector('.upgrade[data-id="74"]');
        if (elderPledgeButton.classList.contains('enabled'))
            elderPledgeButton.click();
    }


    // Shimmers are golden cookies and reindeer. We want to auto-click both.
    #clickShimmers() {
        const shimmers = document.getElementById('shimmers').children;
        for (const shimmer of shimmers)
            shimmer.click();
    }


    #forceTheHandOfFate() {
        const forceButton = document.getElementById('grimoireSpell1');
        if (forceButton)
            forceButton.click();
    }


    #stayInChristmas() {
        const christmasSwitch = document.querySelector('.upgrade[data-id="182"]');
        if (christmasSwitch.classList.contains('enabled'))
            christmasSwitch.click();
    }
}