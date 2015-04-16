// ENEMY CYCLE AI

function doEnemyAI() {
	
	if (enemyCycleDirection == NORTH) {
		// check against arena walls
		if (enemyCyclePositionZ < -arenaRadius) {
			enemyCyclePositionZ = -arenaRadius + 1;
			enemyCycle.position.z = enemyCyclePositionZ;
			pickDirectionAndTurn();
		}
	}
	else if (enemyCycleDirection == SOUTH) {
		// check against arena walls
		if (enemyCyclePositionZ > arenaRadius) {
			enemyCyclePositionZ = arenaRadius - 1;
			enemyCycle.position.z = enemyCyclePositionZ;
			pickDirectionAndTurn();
		}
	}
	else if (enemyCycleDirection == EAST) {
		// check against arena walls
		if (enemyCyclePositionX > arenaRadius) {
			enemyCyclePositionX = arenaRadius - 1;
			enemyCycle.position.x = enemyCyclePositionX;
			pickDirectionAndTurn();
		}
	}
	else if (enemyCycleDirection == WEST) {
		// check against arena walls
		if (enemyCyclePositionX < -arenaRadius) {
			enemyCyclePositionX = -arenaRadius + 1;
			enemyCycle.position.x = enemyCyclePositionX;
			pickDirectionAndTurn();
		}
	}
	
	// else free turn every couple of seconds
	if (!enemyTurnCycleRight && !enemyTurnCycleLeft) {
		
		enemyTurnTimer.run(frameTime);

		if (enemyTurnTimer.alarmSounding) {
			pickDirectionAndTurn();
			enemyTurnTimer.reset();
		}
	}
	
}

function pickDirectionAndTurn() {
	
	if (Math.random() >= 0.5)
		enemyTurnCycleRight = true;
	else enemyTurnCycleLeft = true;
	
}
