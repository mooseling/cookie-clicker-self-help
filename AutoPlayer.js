class AutoPlayer {

    autoClick = true;
    autoClickShimmers = true;
    autoPledge = false; // This should never have been a feature. Pledging cost multiplies by 8 each time!
    autoChristmas = true;
    autoGarden = false; // Got the 1000-plant achievement. The next stage of auto-gardening will be more involved, if we get there.
    autoGodzamok = true;
    autoHarvestLumps = true;
    autoClickFortune = true;
    autoWrinkle = true;
    autoEndGame = true;

    godzamokFarmCountNormal = 890;
    godzamokFarmCountEndGame = 970;

    #running;
    #fastLoopTimeout;
    #oftenLoopTimeout;
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
        this.#oftenLoop();
        this.#fifteenMinuteLoop();
        this.#godzamokLoop();
    }


    stop() {
        this.#log('Stop');

        this.#running = false;

        clearTimeout(this.#fastLoopTimeout);
        clearTimeout(this.#oftenLoopTimeout);
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


    #oftenLoop() {
        if (!this.#running) {
            this.#log('Often Loop: AutoPlayer is not running. Returning.');
            return;
        }

        if (this.autoPledge)
            this.#pledgeToTheElders(); // It's safe to call this often, it will check if it's needed
        if (this.autoClickShimmers)
            this.#clickShimmers();
        if (this.autoChristmas)
            this.#stayInChristmas();
        if (this.autoHarvestLumps)
            this.#harvestRipeLumps();
        if (this.autoWrinkle)
            this.#MaintainWrinklerPopulation();
        if (this.autoEndGame)
            this.#endGameLoop()

        this.#oftenLoopTimeout = setTimeout(this.#oftenLoop.bind(this), 3500); // 3.5 seconds for better comboing, and cookie storms
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
    #triggerGodzamok(targetFarmCount = null) {

        // First decide how many farms to sell. We go higher during end game combos.
        // But also, for debugging, this parameter can be set by the caller
        if (targetFarmCount === null) {
            if (this.#goldenComboIsHappening() && Game.buffs['Click frenzy'])
                targetFarmCount = this.godzamokFarmCountEndGame;
            else
                targetFarmCount = this.godzamokFarmCountNormal;
        }

        const farm = Game.Objects.Farm;

        // If the game is in sell-mode, it won't buy things. So we'll just switch it over briefly...
        let inSellMode = Game.buyMode === -1;
        if (inSellMode)
            Game.buyMode === 1;

        if (farm.amount < targetFarmCount)
            farm.buy(targetFarmCount - farm.amount);

        farm.sell(-1); // -1 means all

        farm.buy(targetFarmCount);

        if (inSellMode)
            Game.buyMode = -1; // ...and reset it afterwards
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

    // ================================= End Game =================================
    // At this point, auto-clicking and continously casting Force the Hand of Fate is not making any progress
    // We need to get strategic:
    // 1. Predict the next outcome of Force, and queue up a Click Frenzy by casting other spells
    // 2. Wait for a natural golden cookie combo of Frenzy + Building Special, then cast Force
    // Since we're already auto-clicking and auto-Godzamoking, this should be enough to automate the end game


    #endGameLoop() {
        if (this.#goldenComboIsHappening() && !this.#clickFrenzyIsHappening()) {
            this.#log("Golden combo is happening!");

            const forceCost = this.#grimoire.getSpellCost(this.#forceTheHandOfFate);
            const gamblersCost = this.#grimoire.getSpellCost(this.#gamblersFeverDream);

            let numSpellsRequired;

            // If we have enough magic to potentially reach Force, we start going for it
            // But each time we cast Gambler's we have to recheck magic
            while (
                numSpellsRequired = this.#numSpellsBeforeClickFrenzy(),
                this.#grimoire.magic >= forceCost + numSpellsRequired * gamblersCost) {

                this.#log("Click Frenzy is within reach! Magic: " + this.#grimoire.magic);

                if (numSpellsRequired > 0) {
                    this.#log("Casting Gambler's Fever Dream. Spells needed: " + numSpellsRequired);
                    this.#grimoire.castSpell(this.#gamblersFeverDream);
                } else {
                    this.#log("Click Frenzy is next! Casting Force!");
                    this.#grimoire.castSpell(this.#forceTheHandOfFate);
                }
            }
        }

      // If Force is not queued up, we cast Gambler's Fever Dream to bring it closer
      // But only at max magic because then magic refills faster
      if (this.#scryFate() !== 'Click Frenzy' && this.#magicIsFull()) {
        this.#log("Magic is full and Click Frenzy is not next, casting Gambler's Fever Dream");
        this.#grimoire.castSpell(this.#gamblersFeverDream);
      }
    }


    #goldenComboIsHappening() {
        if (!Game.buffs.Frenzy)
            return false;
        return this.#BUILDING_BUFF_NAMES.some(name => Game.buffs[name]);
    }


    #clickFrenzyIsHappening() {
        return Game.buffs['Click frenzy'] !== undefined;
    }


    #numSpellsBeforeClickFrenzy() {
        for (let spellsToCast = 0; spellsToCast < 20; spellsToCast++) {
            if (this.#scryFate(spellsToCast) === 'Click Frenzy')
                return spellsToCast;
        }
        return 200; // Not true, but fine for our purposes. We won't go for a combo in this case.
    }


    // We used to read the dom to work out magic, but it wasn't reliable. CC optimises GUI updates.
    #magicIsFull() {
        const magic = this.#grimoire.magic;
        const maxMagic = this.#grimoire.magicM;

        return magic === maxMagic;
    }


    #scryFate(extraSpellsCast = 0) {
        const spellsCastTotal = this.#grimoire.spellsCastTotal;
        const chimeIsOn = false; // Chime is on, but Orteil seems to have changed this behaviour
        const nextFate = this.#check_cookies(spellsCastTotal + extraSpellsCast, Game.season, chimeIsOn);
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

        // It's important we use grimoire.getFailChance(). On-screen cookies and Diminished Ineptitude affect it.
        const grimoire = Game.Objects['Wizard tower'].minigame;
        const forceFate = grimoire.spells['hand of fate'];
        const failChance = grimoire.getFailChance(forceFate);

        this.#math.seedrandom(Game.seed + '/' + spells);
        const roll = this.#math.random()
        if (roll < (1 - failChance)) { // If spell succeeds...
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

  	get #grimoire() {
        return Game.Objects['Wizard tower'].minigame;
    }

    get #forceTheHandOfFate() {
      return this.#grimoire.spells['hand of fate'];
    }

    get #gamblersFeverDream() {
      return this.#grimoire.spells['gambler\'s fever dream'];
    }

    #BUILDING_BUFF_NAMES = ["High-five", "Congregation", "Luxuriant harvest", "Ore vein", "Oiled-up", "Juicy profits", "Fervent adoration", "Manabloom", "Delicious lifeforms", "Breakthrough", "Righteous cataclysm", "Golden ages", "Extra cycles", "Solar flare", "Winning streak", "Macrocosm", "Refactoring", "Cosmic nursery", "Brainstorm", "Deduplication"];


    // From CC, used in the fate-prediction code
    #choose(arr) {return arr[Math.floor(this.#math.random()*arr.length)];}


    #log(message) {
        const date = new Date();
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        console.log(timeString + ' - ' + message);
    }
}
