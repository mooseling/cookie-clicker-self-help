class AutoPlayer {

    autoClick = true;
    autoClickShimmers = true;
    autoChristmas = true;
    autoGarden = false; // Got the 1000-plant achievement. The next stage of auto-gardening will be more involved, if we get there.
    autoGodzamok = true;
    autoHarvestLumps = true;
    autoClickFortune = true;
    autoWrinkle = false;
    autoEndGame = true;

    fastLoopTime = 20; // We used to do 0, but the page is freezing. Possibly from other extensions. Anyway, nice to control this rate.
    godzamokFarmCountNormal = 900;
    godzamokFarmCountEndGame = 970;

    saves = [];

    shimmersClicked = 0;

    running;
    fastLoopTimeout;
    oftenLoopTimeout;
    fifteenMinuteLoopTimeout;
    godzamokLoopTimeout;

    math = {};


    constructor() {
        this.running = false;

        // This is copied from CC. It sets up the random value functions used throughout the game
        // We want our own copy so we can predict spell outcomes
        (function(a,b,_Math,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var e,c=[],d=(typeof a)[0];if(b&&"o"==d)for(e in a)try{c.push(l(a[e],b-1))}catch(f){}return c.length?c:"s"==d?a:a+"\0"}function m(a,b){for(var d,c=a+"",e=0;c.length>e;)b[j&e]=j&(d^=19*b[j&e])+c.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=Math.pow(d,e),h=Math.pow(2,f),i=2*h,j=d-1;_Math.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),_Math.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(Math.random(),b)})(window,[],this.math,256,6,52);
    }


    run() {
        this.log('Run');

        if (this.running) {
            this.log('Already running. Returning.');
            return;
        }

        this.running = true;

        this.log('Starting loops');
        this.#fastLoop();
        this.#oftenLoop();
        this.#fifteenMinuteLoop();
        this.#godzamokLoop();
    }


    stop() {
        this.log('Stop');

        this.running = false;

        clearTimeout(this.fastLoopTimeout);
        clearTimeout(this.oftenLoopTimeout);
        clearTimeout(this.fifteenMinuteLoopTimeout);
        clearTimeout(this.godzamokLoopTimeout);
    }



    // ========================== Public Endgame Functions ==========================
    // We expose some helpful functions for the user to do big combos
    // AutoPlayer already tries to play out the endgame, hitting big combos
    // But doing it programmatically is turning into a massive rabbit hole


    scryFate(extraSpellsCast = 0) {
        const spellsCastTotal = this.grimoire.spellsCastTotal;
        const chimeIsOn = false; // Chime is on, but Orteil seems to have changed this behaviour
        const nextFate = this.check_cookies(spellsCastTotal + extraSpellsCast, Game.season, chimeIsOn);
        return nextFate;
    }


    listUpcomingFates(fateCount = 10) {
        return Array.from(new Array(fateCount))
            .map((_, i) => this.scryFate(i))
            .join(', ');
    }


    sellTowersToHitMaxMagic() {
        const currentMagic = this.grimoire.magic;
        const targetTowerCount = this.getTowerCountToHitMaxMagic(currentMagic);
        const towers = Game.Objects['Wizard tower'];
        this.log("Towers were at " + towers.amount);
        towers.sell(towers.amount - targetTowerCount);
    }


    getNextBurnSpell(lookAhead = 0, remainingMagic = this.grimoire.magic) {
      const spellsCast = this.grimoire.spellsCastTotal

      if (this.safeToCastGamblers(spellsCast + lookAhead, remainingMagic))
        return this.gamblersFeverDream;

      return this.hagglersCharm;
    }



    // ========================== Internal Loops ==========================


    #fastLoop() {
        if (!this.running) {
            this.log('Fastloop: AutoPlayer is not running. Returning.');
            return;
        }

        if (this.autoClick)
            Game.ClickCookie();

        this.fastLoopTimeout = setTimeout(this.#fastLoop.bind(this), this.fastLoopTime);
    }


    #oftenLoop() {
        if (!this.running) {
            this.log('Often Loop: AutoPlayer is not running. Returning.');
            return;
        }

        if (this.autoClickFortune)
            this.clickFortune();
        if (this.autoClickShimmers)
            this.clickShimmers();
        if (this.autoChristmas)
            this.stayInChristmas();
        if (this.autoHarvestLumps)
            this.harvestRipeLumps();
        if (this.autoWrinkle)
            this.maintainWrinklerPopulation();
        if (this.autoEndGame)
            this.#endGameLoop()

        this.oftenLoopTimeout = setTimeout(this.#oftenLoop.bind(this), 3500); // 3.5 seconds for better comboing, and cookie storms
    }


    // Mainly we just do a bunch of logging every 15 minutes
    #fifteenMinuteLoop() {
        this.log('====================================================');

        if (!this.running) {
            this.log('15m Loop: AutoPlayer is not running. Returning.')
            return;
        }

        if (this.autoGarden) {
            this.log('15m Loop: Auto-garden is on, replanting bakers wheat');
            this.replantGardenWithBakersWheat();
        }


        this.log('Cookies: ' + Game.cookies);

        const magic = this.grimoire.magic;
        this.log('Magic: ' + magic);

        this.log('Shimmers clicked: ' + this.shimmersClicked);

        // Sometimes a human could have played better. In case we missed any great opportunities, we keep some saves around.
        this.saves.push(localStorageGet(Game.SaveTo));
        this.log(`Saved to save[${this.saves.length - 1}]`);

        this.log('Upcoming fates:');
        this.log(this.listUpcomingFates(15))

        this.log('====================================================');

        this.fifteenMinuteLoopTimeout = setTimeout(this.#fifteenMinuteLoop.bind(this), 900000);
    }


    #godzamokLoop() {
        if (!this.running) {
            this.log('Godzamok Loop: AutoPlayer is not running. Returning.');
            return;
        }

        if (this.autoGodzamok)
            this.triggerGodzamok();

        // Godzamok lasts 10 seconds, and we really want to rinse it, so timeout for 10.5s
        this.godzamokLoopTimeout = setTimeout(this.#godzamokLoop.bind(this), 10500);
    }



    // ========================== Other Private Functions ==========================


    // Shimmers are golden cookies and reindeer. We want to auto-click both.
    clickShimmers() {
        const shimmerContainer = document.getElementById('shimmers');
        let shimmers = shimmerContainer.children;

        if (shimmers.length > 6) {
            this.log(`Cookie storm! ${shimmers.length} shimmers!`);
            setTimeout(this.clickShimmers.bind(this), 1000); // Used to be 500ms, but that was too fast! Wouldn't be enough cookies yet.
        }

        while (shimmers.length) {
            const shimmer = shimmers.item(0);
            if (shimmer) {
                shimmer.click();
                this.shimmersClicked++;
            }
            shimmers = shimmerContainer.children;
        }
    }


    stayInChristmas() {
        const christmasSwitch = document.querySelector('.upgrade[data-id="182"]');
        if (christmasSwitch && christmasSwitch.classList.contains('enabled')) {
            this.log("Christmas is over! So sad. Let's do it again :)");
            christmasSwitch.click();
        }
    }


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
        const gardenTileWrapper = document.getElementById('gardenPlot');
        const tiles = gardenTileWrapper.children;

        this.log('Found ' + tiles.length + ' garden tiles to fill');

        for (const tile of tiles)
            this.plantPlant(plantId, tile);
    }


    plantPlant(plantId, tile) {
        const plantButton = document.getElementById('gardenSeed-' + plantId);
        if (!plantButton)
            return;

        plantButton.click();
        tile.click();
    }


    // Godzamok gives a big click-boost for selling lots of buildings in one go
    // It's massively profitable, and combined with click-frenzies it actually solves the game
    // We will continually re-trigger it, so we get the boost with and without golden cookies
    triggerGodzamok(targetFarmCount = null) {

        // First decide how many farms to sell. We go higher during end game combos.
        // But also, for debugging, this parameter can be set by the caller
        if (targetFarmCount === null) {
            if (this.goldenComboIsHappening() && Game.buffs['Click frenzy'])
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
    harvestRipeLumps() {
        const lumpAge = Date.now() - Game.lumpT;
        if (lumpAge >= Game.lumpRipeAge) {
            this.log('Sugar lump is ripe! Harvesting.');
            document.getElementById('lumps')?.click();
        }
    }


    clickFortune() {
        const newsTicker = document.getElementById('commentsText1');
        const fortunes = newsTicker.getElementsByClassName('fortune');

        for (const fortune of fortunes) {
            this.log('Found a fortune!');
            fortune.click();
        }
    }


    // Popping wrinklers can help unlock eggs and halloween cookies
    // Wrinkler count doesn't affect their spawn rate, so we aim to maintain a high wrinkler count and maximise pops
    maintainWrinklerPopulation() {
        const activeWrinklers = Game.wrinklers.filter(wrinkler => wrinkler.phase === 2);
        if (activeWrinklers.length === 12) {
            this.log("12 Wrinklers! Popping 1.")
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
        const towers = Game.Objects['Wizard tower'];
        const initialTowerCount = towers.amount;

        if (this.goldenComboIsHappening()) {
            this.lineUpCombo();
            this.tryToComboOff();
        }

        if (towers.amount < initialTowerCount) {
            this.log(`Now on ${towers.amount} towers. Buying back up to ${initialTowerCount}`);
            towers.buy(initialTowerCount - towers.amount);
        }

        // If a combo is not queued up, we cast either Haggler's Charm or Gambler's Fever Dream to bring it closer
        // We choose Gambler's whenever the outcome will be a safe one. It's much cheaper!
        if (this.magicIsFull() && !this.comboIsLinedUp()) {
            this.log("Magic is full and combo is not lined up, casting a burn spell");
            this.grimoire.castSpell(this.getNextBurnSpell()); // Don't sell towers because we're at max magic anyway
        }
    }


    lineUpCombo() {
        if (!this.canLineUpCombo()) {
            this.log("Can't line up combo.");
            return;
        }

        this.log("We think we can line up a combo! Fates:");
        this.log(this.listUpcomingFates());
        let nextBurnSpell;

        while(
            !this.comboIsLinedUp()
            && (
                nextBurnSpell = this.getNextBurnSpell(),
                this.grimoire.magic >= this.getMinSpellCost(this.forceTheHandOfFate) + this.getSpellCost(nextBurnSpell, this.grimoire.magic)
            )
        ) {
            this.log(`Golden combo is happening, trying to line up buffs. Casting ${nextBurnSpell.name}...`);
            this.castWithTowerSelling(nextBurnSpell);
        }
    }


    canLineUpCombo() {
        const maxSpellsWeCanBurn = this.getMaxSpellsWeCanBurn(); // Will be -1 if we can't even afford force

        for (let spellsBurnt = 0; spellsBurnt <= maxSpellsWeCanBurn; spellsBurnt++) {
            const nextFate = this.scryFate(spellsBurnt);
            if (nextFate === 'Click Frenzy' || nextFate === 'Building Special')
                return true;
        }

        return false;
    }


    getMaxSpellsWeCanBurn() {
        let minForceCost = this.getMinSpellCost(this.forceTheHandOfFate);

        let currentMagic = this.grimoire.magic;
        let spellsBurnt = 0;

        while(currentMagic > minForceCost) {
            const nextBurnSpell = this.getNextBurnSpell(spellsBurnt, currentMagic);
            const burnCost = this.getSpellCost(nextBurnSpell, currentMagic);
            currentMagic -= burnCost;
            spellsBurnt++;
        }

        return spellsBurnt - 1;
    }


    getSpellCost(spell, maxMagic) {
        var out = spell.costMin;
        if (spell.costPercent)
            out += maxMagic * spell.costPercent;
        out *= 1 - 0.1 * Game.auraMult('Supreme Intellect');
        return Math.floor(out);
    }


    getMinSpellCost(spell) {
        const towers = Game.Objects['Wizard tower'];
        const towerCount = 1;
        var lvl = towers.level || 1;
        const minMagic = Math.floor(4 + Math.pow(towerCount, 0.6) + Math.log(( towerCount + (lvl-1) * 10) / 15 + 1) * 15);
        return this.getSpellCost(spell, minMagic);
    }


    // For now, golden combo means there's Frenzy + Building Special happening. We're building on top of that case.
    tryToComboOff() {
        let spellCast = false;
        if (this.clickFrenzyIsHappening()) {
            if (this.scryFate() === 'Building Special' && this.canCastForce()) {
                this.log('Full combo is happening and we can add a Building Special! Trying to cast force!');
                this.castWithTowerSelling(this.forceTheHandOfFate);
                spellCast = true;
            }
        } else {
            if (this.scryFate() === 'Click Frenzy') {
                if (
                    this.canCastForce()
                    && (!this.scryFate(1) === 'Building Special' || this.canCastForce(2)) // Don't squander a double combo!
                ) {
                    this.log('Basic golden combo is happening, and we have a Click Frenzy lined up! Casting Force!');
                    this.castWithTowerSelling(this.forceTheHandOfFate);

                    if (this.scryFate() === 'Building Special' && this.canCastForce()) {
                        this.log('Casting Force again for a bonus Building Special!');
                        this.castWithTowerSelling(this.forceTheHandOfFate);
                    }

                    spellCast = true;
                }
            } else if (this.scryFate() === 'Building Special' && this.scryFate(1) === 'Click Frenzy') {
                if (this.canCastForce(2)) {
                    this.log('Building Special is lined up, followed by Click Frenzy! Casting both!');
                    this.castWithTowerSelling(this.forceTheHandOfFate);
                    this.castWithTowerSelling(this.forceTheHandOfFate);
                spellCast = true;
                }
            }
        }

        if (spellCast)
            setTimeout(this.clickShimmers.bind(this), 300);
    }


    // Selling towers before casting a spell should always mean we cast the spell for cheaper
    castWithTowerSelling(spell) {
        const currentMagic = this.grimoire.magic;
        const targetTowerCount = this.getTowerCountToHitMaxMagic(currentMagic);

        if (currentMagic >= this.getMinSpellCost(spell) && targetTowerCount > 0) {
            const towers = Game.Objects['Wizard tower'];

            if (towers.amount === targetTowerCount) {
                this.log('Casting spell without selling any towers...');
                this.grimoire.castSpell(spell);
            } else {
                this.log(`Selling ${towers.amount - targetTowerCount} towers and then casting spell...`);
                towers.sell(towers.amount - targetTowerCount);
                this.grimoire.computeMagicM(); // Boy is this cheating, but boy does it simplify coding this
                this.grimoire.castSpell(this.forceTheHandOfFate);
            }
        }
    }


    // Short-hand method to check if we can cast Force the Hand of Fate, with selling towers
    // It's not necessary to check very often, but it means we can quieten certain logs
    canCastForce(times = 1) {
        return this.grimoire.magic >= times * this.getMinSpellCost(this.forceTheHandOfFate);
    }


    // Lining up a combo is a place where we could get much more involved
    // With selling towers and burning spells, we can line up combos in a number of different ways
    // For now we are just lining up a Click Frenzy and Building Special next to eachother, or just a Click Frenzy
    comboIsLinedUp() {
        const nextFate = this.scryFate();
        if (nextFate === 'Click Frenzy')
            return true;

        if (nextFate === 'Building Special') {
            if (this.clickFrenzyIsHappening())
                return true;
            if (this.scryFate(1) === 'Click Frenzy')
                return true;
        }
       
        return false;
    }


    goldenComboIsHappening() {
        if (Game.buffs['Elder frenzy']) // Not same capitalisation as scryFate returns
            return true; // Edler frenzy is usually better a golden combo. Building Special needs to hit a building with amount 950 to equal it.
        if (!Game.buffs.Frenzy)
            return false;
        return this.BUILDING_BUFF_NAMES.some(name => Game.buffs[name]);
    }


    clickFrenzyIsHappening() {
        return Game.buffs['Click frenzy'] !== undefined; // Not same capitalisation as scryFate returns
    }


    // We used to read the dom to work out magic, but it wasn't reliable. CC optimises GUI updates.
    magicIsFull() {
        const magic = this.grimoire.magic;
        const maxMagic = this.grimoire.magicM;

        return magic === maxMagic;
    }


    // Stolen from http://fthof-planner.s3-website.us-east-2.amazonaws.com/
    // The original returns a cookie object with various properties. We don't use most of this, so I've simplified the return
    check_cookies(spells, season, chime) {
        const $scope = {
            on_screen_cookies: 0, // On fthof-planner, this can be changed via GUI
            ascensionMode: 0,     // I used a breakpoint to get this. Perhaps 1 would mean challenge mode?
            dragonflight: false
        }

        // It's important we use grimoire.getFailChance(). On-screen cookies and Diminished Ineptitude affect it.
        const grimoire = Game.Objects['Wizard tower'].minigame;
        const forceFate = grimoire.spells['hand of fate'];
        const failChance = grimoire.getFailChance(forceFate);

        this.math.seedrandom(Game.seed + '/' + spells);
        const roll = this.math.random()
        if (roll < (1 - failChance)) { // If spell succeeds...
       			/* Random is called a few times in setting up the golden cookie */
       			if (chime==1 && $scope.ascensionMode!=1) this.math.random();
       			if (season=='valentines' || season=='easter')
       			{
        				this.math.random();
       			}
       			this.math.random();
       			this.math.random();
       			/**/

       			var choices=[];
       			choices.push('Frenzy','Lucky');
       			if (!$scope.dragonflight) choices.push('Click Frenzy');
       			if (this.math.random()<0.1) choices.push('Cookie Storm','Cookie Storm','Blab');
       			if (this.math.random()<0.25) choices.push('Building Special');
       			if (this.math.random()<0.15) choices=['Cookie Storm Drop'];
       			if (this.math.random()<0.0001) choices.push('Free Sugar Lump');
       			return this.choose(choices);
    		} else {
     			  return 'wrath';
    		}
  	}


    // We often cast a spell just to increase the spell count. Gambler's Fever Dream is very cheap.
    // However, it usually casts another spell, and the total cost will be more than casting Haggler's Charm
    // Unless we hit a spell that currently does nothing, which will be free!
    safeToCastGamblers(spellsCast, remainingMagic) {
        const M = this.grimoire;
        this.math.seedrandom(Game.seed + '/' + spellsCast);

        // Now for CC's code. This is from gamblers.win()
        var spells=[];
       	var selfCost=this.getSpellCost(this.gamblersFeverDream, remainingMagic);
       	for (var i in M.spells)
       	{if (i!='gambler\'s fever dream' && (M.magic-selfCost)>=this.getSpellCost(M.spells[i], remainingMagic)*0.5) spells.push(M.spells[i]);}
        if (!spells.length)
            return false; // My code here. It's possible we can't afford any other spells, in which we can't even cast Gambler's
       	var spell=this.choose(spells);

        // Resurrect Abomination summons or pops a wrinkler. Outside of Grandmapocalypse, nothing happens
        if (spell.name === "Resurrect Abomination" && Game.elderWrath === 0) {
            this.log("Safe to cast Gambler's! Spell will be Resurrect Abomination.", 'debug');
            return true;
        }

        // Stretch Time lengthens/shortens current buffs. If there are no active buffs, the magic will be refunded
        // Slightly risky, since the spell is cast 1 second later, and there might be active buffs at that point
        if (spell.name === "Stretch Time" && !Object.keys(Game.buffs).length) {
            this.log("Safe to cast Gambler's! Spell will be Stretch Time and there are no active buffs.", 'debug');
            return true;
        }

        // Haggler's Charm is fine because it's what we would cast anyway, but cheaper this way.
        if (spell.name === "Haggler's Charm") {
            this.log("Safe to cast Gambler's! Spell will be Haggler's Charm.", 'debug');
            return true;
        }

        this.log("Not safe to cast Gambler's, spell would be " + spell.name, 'debug');
        return false;
    }


    // Max-magic and the magic cost of spells scale with the number of Wizard Towers
    // Therefore, even if we can't cast a spell, we can possibly sell wizard towers until the price is below our current magic
    // In fact, we want to stop selling when our current magic equals max-magic
    // This will leave us with the most magic leftover after casting the spell
    getTowerCountToHitMaxMagic(remainingMagic) {
        const targetMagic = Math.ceil(remainingMagic);
        const currentTowerCount = this.grimoire.parent.amount;

        for (let newTowerCount = currentTowerCount; newTowerCount > 0; newTowerCount--) {
            if (this.computeMagicM(newTowerCount) <= targetMagic)
                return newTowerCount;
        }

        return false;
    }


    // Taken from CC, but modified to return the value instead of setting it
    computeMagicM(towerCount) {
        var lvl = Math.max(this.grimoire.parent.level, 1);
        return Math.floor(4 + Math.pow(towerCount, 0.6) + Math.log((towerCount + (lvl - 1) * 10) / 15 + 1) * 15);
    }


  	get grimoire() {
        return Game.Objects['Wizard tower'].minigame;
    }

    get forceTheHandOfFate() {
      return this.grimoire.spells['hand of fate'];
    }

    get hagglersCharm() {
      return this.grimoire.spells['haggler\'s charm'];
    }

    get gamblersFeverDream() {
      return this.grimoire.spells['gambler\'s fever dream'];
    }

    BUILDING_BUFF_NAMES = ["High-five", "Congregation", "Luxuriant harvest", "Ore vein", "Oiled-up", "Juicy profits", "Fervent adoration", "Manabloom", "Delicious lifeforms", "Breakthrough", "Righteous cataclysm", "Golden ages", "Extra cycles", "Solar flare", "Winning streak", "Macrocosm", "Refactoring", "Cosmic nursery", "Brainstorm", "Deduplication"];


    // From CC, used in the fate-prediction code
    choose(arr) {return arr[Math.floor(this.math.random()*arr.length)];}


    log(message, level = 'log') {
        const date = new Date();
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        switch (level) {
            case 'debug':
                console.debug(timeString + ' - ' + message);
            default:
                console.log(timeString + ' - ' + message);
        }
    }
}
