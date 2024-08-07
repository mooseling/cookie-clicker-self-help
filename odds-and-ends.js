let autoBuyUpgrades = true;


function buyUpgradesLoop() {
    if (!autoBuyUpgrades)
        return;

    const buyAllButton = document.getElementById('storeBuyAllButton');
    buyAllButton.click();

    setTimeout(buyUpgradesLoop, 60000);
}


buyUpgradesLoop();



let autoBuyBuildings = true;


function buyBuildingsLoop() {
    if (!autoBuyBuildings)
        return;
    
    for (const key in Game.Objects)
        Game.Objects[key].buy(700);

    setTimeout(buyBuildingsLoop, 1100);
}


buyBuildingsLoop();



function sugarLumpsRequiredForLevel10(startLevel) {
    let sum = 0;

    for (let level = startLevel + 1; level <= 10; level++)
        sum += level;

    return sum;
}

let totalLumpsRequired = 0;

for (const name in Game.Objects)
    totalLumpsRequired += sugarLumpsRequiredForLevel10(Game.Objects[name].level)

// The answer is 817... guh