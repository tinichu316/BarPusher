const upgrades = Object.freeze({
	Drag: "Drag", // freeze to prevent adding to this enum
	BufferSize: "BufferSize",
	BufferDecay: "BufferDecay",
	DripRate: "DripRate"
})

// common cost for the next upgrade based on the current level.
const upgradeCosts = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

class Upgrade {
	constructor(enum_upgrades, currentLevel, maxLevel, incrementPerLevel) {
		this.name = enum_upgrades;
		this.currentLevel = currentLevel;
		this.maxLevel = maxLevel;
		this.incrementPerLevel = incrementPerLevel; // how much this impacts it
	}

	get cost(){ // cost of next upgrade
		return this.calcCost();
	}
	calcCost(){
		if (this.currentLevel < upgradeCosts.length){
			return upgradeCosts[this.currentLevel];
		} else {
			return upgradeCosts.slice(-1); //return last one
		}
	}

	increaseLevel(){
		this.currentLevel++;
		if (this.currentLevel > this.maxLevel){
			this.currentLevel = this.maxLevel;
		}
	}
}

// create objects for all of our upgrades (or load from JSON)
// put them inside dict allUpgrades
var allUpgrades = {};
allUpgrades[upgrades.Drag] = new Upgrade(upgrades.Drag, 0, 30, -0.01);
allUpgrades[upgrades.BufferSize] = new Upgrade(upgrades.BufferSize, 0, 30, 1);
allUpgrades[upgrades.BufferDecay] = new Upgrade(upgrades.BufferDecay, 0, 30, -0.01);
allUpgrades[upgrades.DripRate] = new Upgrade(upgrades.DripRate, 0, 30, 0.0001);


function buyUpgrade(enum_upgrade){
	console.log("Buying upgrade " + enum_upgrade.toString());
	//called by the button, should have enough money.
	var thisUpgrade = allUpgrades[enum_upgrade];
	//remove money from player
	cash -= thisUpgrade.cost;
	thisUpgrade.increaseLevel();

	updateShop();
}

function updateShop() {
	console.log("Updating shop!");
	// check all upgrades and update text based on current level
	for (let u in allUpgrades) {
		u = allUpgrades[u];
		let buttonElem = document.getElementById("shop_button_" + u.name);
		let textElem = document.getElementById("shop_level_" + u.name);
		//change button text
		buttonElem.innerHTML = "$" + u.cost;
		//change level text
		textElem.innerHTML = "Level: " + u.currentLevel;
		// make button active/inactive based on maxlevel and cost
		if (cash < u.cost || u.currentLevel == u.maxLevel){
			buttonElem.disabled = true;
		} else {
			// can buy
			buttonElem.disabled = false;
		}
	}
	updateText();

}
