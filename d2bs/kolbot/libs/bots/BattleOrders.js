/**
*	@filename	BattleOrders.js
*	@author		kolton
*	@desc		give or receive Battle Orders buff
*/

function BattleOrders() {
	this.AmTardy = function() {
		let party;

		if (Config.BattleOrders.SkipIfTardy) {
			party = getParty();

			AreaInfoLoop:
			while (true) {
				if (Misc.getPlayerCount() <= 1) {
					throw new Error("Empty game"); // Alone in game
				}

				if (party) {
					do {
						if (party.name !== me.name && party.area) {
							break AreaInfoLoop; // Can read player area
						}
					} while (party.getNext());
				}

				delay(1000);
			}

			if (party) {
				do {
					if (party.area === 131 || party.area === 132 || party.area === 108 || party.area === 39) { // Player is in Throne of Destruction or Worldstone Chamber or Chaos Sanctuary
						print("ÿc1I'm late to BOs. Moving on...");
						return true;
					}
				} while (party.getNext());
				return false; // Not late; wait.
			}

		}
		return Config.BattleOrders.SkipIfTardy; // Not late; wait.
	};

	this.giveBO = function (list) {
		var i, unit,
			failTimer = 60,
			tick = getTickCount();

		for (i = 0; i < list.length; i += 1) {
			unit = getUnit(0, list[i]);

			if (unit) {
				while (!unit.getState(32) && copyUnit(unit).x) {
					if (getTickCount() - tick >= failTimer * 1000) {
						showConsole();
						print("ÿc1BO timeout fail.");
						if (Config.BattleOrders.QuitOnFailedGive) {
							quit();
						} else {
							break;
						}
					}

					Precast.doPrecast(true);
					delay(1000);
				}
			}
		}

		return true;
	};

	Town.doChores();

	try {
		Pather.useWaypoint(35, true); // catacombs
	} catch (wperror) {
		showConsole();
		print("ÿc1Failed to take waypoint.");
		quit();
	}

	Pather.moveTo(me.x + 6, me.y + 6);

	let i,
		tick = getTickCount(),
		failTimer = 60;

MainLoop:
	while (true) {
		switch (Config.BattleOrders.Mode) {
		case 0: // Give BO
			if (this.AmTardy()) {
				break MainLoop;
			}

			for (i = 0; i < Config.BattleOrders.Getters.length; i += 1) {
				while (!Misc.inMyParty(Config.BattleOrders.Getters[i]) || !getUnit(0, Config.BattleOrders.Getters[i])) {
					if (getTickCount() - tick >= failTimer * 1000) {
						showConsole();
						print("ÿc1BO timeout fail.");
						if (Config.BattleOrders.QuitOnFailedGive) {
							quit();
						} else {
							break MainLoop;
						}

					}

					delay(500);
				}
			}

			if (this.giveBO(Config.BattleOrders.Getters)) {
				break MainLoop;
			}

			break;
		case 1: // Get BO
			if (me.getState(32)) {
				delay(1000);

				break MainLoop;
			}

			if (this.AmTardy()) {
				break MainLoop;
			}

			if (getTickCount() - tick >= failTimer * 1000) {
				showConsole();
				print("ÿc1BO timeout fail.");
				if (Config.BattleOrders.QuitOnFailedGet) {
					quit();
				} else {
					break MainLoop;
				}
			}

			break;
		}

		delay(500);
	}

	Pather.useWaypoint(1);

	if (Config.BattleOrders.Mode === 0 && Config.BattleOrders.Wait) {
		for (i = 0; i < Config.BattleOrders.Getters.length; i += 1) {
			while (Misc.inMyParty(Config.BattleOrders.Getters[i])) {
				delay(500);
			}
		}
	}

	return true;
}