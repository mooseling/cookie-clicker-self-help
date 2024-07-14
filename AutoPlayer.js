class AutoPlayer {

    autoClick = true;
    autoClickShimmers = true;
    autoPledge = false; // This should never have been a feature. Pledging cost multiplies by 8 each time!
    autoChristmas = true;
    autoForce = true;
    autoGarden = false; // Got the 1000-plant achievement. The next stage of auto-gardening will be more involved, if we get there.
    autoGodzamok = true;
    autoHarvestLumps = true;
    autoClickFortune = true;
    autoWrinkle = true;

    #running;
    #fastLoopTimeout;
    #fiveSecondLoopTimeout;
    #fifteenMinuteLoopTimeout;
    #godzamokLoopTimeout;

    #math = {};


    constructor() {
        this.#running = false;

        // This is copied from CC. It sets up the random value functions used throughout the game
        // We want our own copy so we can predict force-the-hand-of-fate outcomes
        (function(a,b,_Math,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var e,c=[],d=(typeof a)[0];if(b&&"o"==d)for(e in a)try{c.push(l(a[e],b-1))}catch(f){}return c.length?c:"s"==d?a:a+"\0"}function m(a,b){for(var d,c=a+"",e=0;c.length>e;)b[j&e]=j&(d^=19*b[j&e])+c.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=Math.pow(d,e),h=Math.pow(2,f),i=2*h,j=d-1;_Math.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),_Math.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(Math.random(),b)})(window,[],this.#math,256,6,52);
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
        if (this.autoWrinkle)
            this.#MaintainWrinklerPopulation();


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
        document.getElementById('product2').click();      // 860...
        document.getElementById('product2').click();      // 870...
        document.getElementById('product2').click();      // 880...
        document.getElementById('product2').click();      // 890!
    }


    // Sugar lump will ripen after ~20 hours, and then fall after another ~1 hour. We save that hour by clicking it when it's ripe.
    #harvestRipeLumps() {
        const lumpAge = Date.now() - Game.lumpT;
        if (lumpAge >= Game.lumpRipeAge) {
            this.#log('Sugar lump is ripe! Harvesting.');
            document.getElementById('lumps')?.click();
        }
    }


    #clickFortune() {
        const newsTicker = document.getElementById('commentsText1');
        const fortunes = newsTicker.getElementsByClassName('fortune');

        for (const fortune of fortunes) {
            this.#log('Found a fortune!');
            fortune.click();
        }
    }


    // Popping wrinklers can help unlock eggs and halloween cookies
    // Wrinkler count doesn't affect their spawn rate, so we aim to maintain a high wrinkler count and maximise pops
    #MaintainWrinklerPopulation() {
        const activeWrinklers = Game.wrinklers.filter(wrinkler => wrinkler.phase === 2);
        if (activeWrinklers.length === 12) {
            this.#log("12 Wrinklers! Popping 1.")
            Game.PopRandomWrinkler();
        }
    }


    scryFate(extraSpellsCast = 0) {
        const spellsCastTotal = Game.Objects['Wizard tower'].minigame.spellsCastTotal;
        const nextFate = this.#check_cookies(spellsCastTotal + extraSpellsCast, Game.season, Game.chimeType);
        return nextFate;
    }


    // Stolen from http://fthof-planner.s3-website.us-east-2.amazonaws.com/
    // The original returns a cookie object with various properties. We don't use most of this, so I've simplified the return
    #check_cookies(spells, season, chime) {
        const $scope = {
            on_screen_cookies: 0, // On fthof-planner, this can be changed via GUI
            ascensionMode: 0,     // I used a breakpoint to get this. Perhaps 1 would mean challenge mode?
            dragonflight: false
        }

		this.#math.seedrandom(Game.seed + '/' + spells);
		const roll = this.#math.random()
		if (roll < (1 - 0.15 * ($scope.on_screen_cookies + 1))) {
			/* Random is called a few times in setting up the golden cookie */
			if (chime==1 && $scope.ascensionMode!=1) this.#math.random();
			if (season=='valentines' || season=='easter')
			{
				this.#math.random();
			}
			this.#math.random();
			this.#math.random();
			/**/
			
			var choices=[];
			choices.push('Frenzy','Lucky');
			if (!$scope.dragonflight) choices.push('Click Frenzy');
			if (this.#math.random()<0.1) choices.push('Cookie Storm','Cookie Storm','Blab');
			if (this.#math.random()<0.25) choices.push('Building Special');
			if (this.#math.random()<0.15) choices=['Cookie Storm Drop'];
			if (this.#math.random()<0.0001) choices.push('Free Sugar Lump');
			return this.#choose(choices);
		} else {
			return 'wrath';
		}
	}


    // From CC, used in the fate-prediction code
    #choose(arr) {return arr[Math.floor(this.#math.random()*arr.length)];}


    #log(message) {
        const date = new Date();
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        console.log(timeString + ' - ' + message);
    }
}