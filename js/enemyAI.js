// ENEMY CYCLE AI

function doEnemyAI () {
	
	// reset various collision and AI flags
	enemyTryingToTurnRight = false;
	enemyTryingToTurnLeft = false;
	enemyInDangerOfColliding = false;
	exitEnemyAIRoutine = false;
	
	checkForPossibleCollisions();
	
	// after all of the above checks, if the enemy is not in danger of colliding with anything, 
	// free turn every couple of seconds
	if ( !enemyInDangerOfColliding ) {
		
		enemyFreeTurnTimer.run(frameTime);

		if (enemyFreeTurnTimer.alarmSounding) {
			// trigger a dummy 'need-to-turn' event
			enemyInDangerOfColliding = true;
			enemyFreeTurnTimer.reset();
		} // if it's not time to turn yet, there are no further checks necessary, 
		else exitEnemyAIRoutine = true;	// and we can exit this AI routine early
		
	}
	
	// if the enemy needs to free-turn, or is about to collide with an obstacle and needs to turn
	if ( enemyInDangerOfColliding ) {
		// reset danger flag
		enemyInDangerOfColliding = false;
		// check if it's OK to turn either right or left
		pickRandomDirectionToCheck();
		
		// if randomly-chosen direction was not safe to turn in, check the opposite direction
		if ( enemyInDangerOfColliding ) {
			// once more, reset danger flag
			enemyInDangerOfColliding = false;
			// check in the opposite direction
			pickOppositeDirectionToCheck();
		}
		// if opposite direction is ALSO not safe to turn in,
		if ( enemyInDangerOfColliding ) {
		// we've maxed out our checks in both directions and found obstacles, so we can't turn now
			enemyTryingToTurnRight = false;
			enemyTryingToTurnLeft = false;
			exitEnemyAIRoutine = true;
		}
		
	}
	
	// if we don't have to exit, turn in the new desired direction
	if ( !exitEnemyAIRoutine ) {
		turnInNewDirection();
	}
	
	// else exit this AI routine
	
} // end function doEnemyAI()



function checkForPossibleCollisions () {
	
	if (enemyCycleDirection == NORTH) {
		// check against player's trails
		for ( var i = 0; i <= testEWTrailCount; i++ ) {

			if ( (enemyCyclePositionZ - enemyFeelerLength) < test_EW_trailZ[i] && enemyCyclePositionZ > test_EW_trailZ[i] ) {

				if ( enemyCyclePositionX > test_EW_trailStartX[i] && enemyCyclePositionX < test_EW_trailEndX[i] ) {
					enemyInDangerOfColliding = true;
				}

				if ( enemyCyclePositionX < test_EW_trailStartX[i] && enemyCyclePositionX > test_EW_trailEndX[i] ) {
					enemyInDangerOfColliding = true;	
				}

			}

		}
		// check against enemy's own trails
		for ( var i = 0; i < enemyTestEWTrailCount; i++ ) {

			if ( (enemyCyclePositionZ - enemyFeelerLength) < enemyTest_EW_trailZ[i] && enemyCyclePositionZ > enemyTest_EW_trailZ[i] ) {

				if ( enemyCyclePositionX > enemyTest_EW_trailStartX[i] && enemyCyclePositionX < enemyTest_EW_trailEndX[i] ) {
					enemyInDangerOfColliding = true;
				}
				if ( enemyCyclePositionX < enemyTest_EW_trailStartX[i] && enemyCyclePositionX > enemyTest_EW_trailEndX[i] ) {
					enemyInDangerOfColliding = true;
				}

			}

		}
		// check against arena walls
		if ( (enemyCyclePositionZ - enemyFeelerLength) < -arenaRadius ) {
			enemyInDangerOfColliding = true;
		}

	}
	else if (enemyCycleDirection == SOUTH) {
		// check against player's trails
		for ( var i = 0; i <= testEWTrailCount; i++ ) {

			if ( (enemyCyclePositionZ + enemyFeelerLength) > test_EW_trailZ[i] && enemyCyclePositionZ < test_EW_trailZ[i] ) {

				if ( enemyCyclePositionX > test_EW_trailStartX[i] && enemyCyclePositionX < test_EW_trailEndX[i] ) {
					enemyInDangerOfColliding = true;
				}
				if ( enemyCyclePositionX < test_EW_trailStartX[i] && enemyCyclePositionX > test_EW_trailEndX[i] ) {
					enemyInDangerOfColliding = true;	
				}
			}

		}
		// check against enemy's own trails
		for ( var i = 0; i < enemyTestEWTrailCount; i++ ) {

			if ( (enemyCyclePositionZ + enemyFeelerLength) > enemyTest_EW_trailZ[i] && enemyCyclePositionZ < enemyTest_EW_trailZ[i] ) {

				if ( enemyCyclePositionX > enemyTest_EW_trailStartX[i] && enemyCyclePositionX < enemyTest_EW_trailEndX[i] ) {
					enemyInDangerOfColliding = true;
				}
				if ( enemyCyclePositionX < enemyTest_EW_trailStartX[i] && enemyCyclePositionX > enemyTest_EW_trailEndX[i] ) {
					enemyInDangerOfColliding = true;
				}
			}

		}
		// check against arena walls
		if ( (enemyCyclePositionZ + enemyFeelerLength) > arenaRadius ) {
			enemyInDangerOfColliding = true;
		}

	}
	else if (enemyCycleDirection == EAST) {
		// check against player's trails
		for ( var i = 0; i <= testNSTrailCount; i++ ) {

			if ( (enemyCyclePositionX + enemyFeelerLength) > test_NS_trailX[i] && enemyCyclePositionX < test_NS_trailX[i] ) {

				if ( enemyCyclePositionZ > test_NS_trailStartZ[i] && enemyCyclePositionZ < test_NS_trailEndZ[i] ) {
					enemyInDangerOfColliding = true;
				}
				if ( enemyCyclePositionZ < test_NS_trailStartZ[i] && enemyCyclePositionZ > test_NS_trailEndZ[i] ) {
					enemyInDangerOfColliding = true;
				}
			}

		}
		// check against enemy's own trails
		for ( var i = 0; i < enemyTestNSTrailCount; i++ ) {

			if ( (enemyCyclePositionX + enemyFeelerLength) > enemyTest_NS_trailX[i] && enemyCyclePositionX < enemyTest_NS_trailX[i] ) {

				if ( enemyCyclePositionZ > enemyTest_NS_trailStartZ[i] && enemyCyclePositionZ < enemyTest_NS_trailEndZ[i] ) {
					enemyInDangerOfColliding = true;
				}
				if ( enemyCyclePositionZ < enemyTest_NS_trailStartZ[i] && enemyCyclePositionZ > enemyTest_NS_trailEndZ[i] ) {
					enemyInDangerOfColliding = true;
				}
			}

		}
		// check against arena walls
		if ( (enemyCyclePositionX + enemyFeelerLength) > arenaRadius ) {
			enemyInDangerOfColliding = true;
		}

	}
	else if (enemyCycleDirection == WEST) {
		// check against player's trails
		for ( var i = 0; i <= testNSTrailCount; i++ ) {

			if ( (enemyCyclePositionX - enemyFeelerLength) < test_NS_trailX[i] && enemyCyclePositionX > test_NS_trailX[i] ) {

				if ( enemyCyclePositionZ > test_NS_trailStartZ[i] && enemyCyclePositionZ < test_NS_trailEndZ[i] ) {
					enemyInDangerOfColliding = true;
				}
				if ( enemyCyclePositionZ < test_NS_trailStartZ[i] && enemyCyclePositionZ > test_NS_trailEndZ[i] ) {
					enemyInDangerOfColliding = true;
				}
			}

		}
		// check against enemy's own trails
		for ( var i = 0; i < enemyTestNSTrailCount; i++ ) {

			if ( (enemyCyclePositionX - enemyFeelerLength) < enemyTest_NS_trailX[i] && enemyCyclePositionX > enemyTest_NS_trailX[i] ) {

				if ( enemyCyclePositionZ > enemyTest_NS_trailStartZ[i] && enemyCyclePositionZ < enemyTest_NS_trailEndZ[i] ) {
					enemyInDangerOfColliding = true;
				}
				if ( enemyCyclePositionZ < enemyTest_NS_trailStartZ[i] && enemyCyclePositionZ > enemyTest_NS_trailEndZ[i] ) {
					enemyInDangerOfColliding = true;
				}
			}

		}
		// check against arena walls
		if ( (enemyCyclePositionX - enemyFeelerLength) < -arenaRadius ) {
			enemyInDangerOfColliding = true;
		}

	}
		
} // end function checkForPossibleCollisions()



function pickRandomDirectionToCheck () {
	
	// if randomly picked to try and turn in RIGHT direction
	if (Math.random() >= 0.5) {
		
		enemyTryingToTurnRight = true;
		enemyTryingToTurnLeft = false;
		
		if (enemyCycleDirection == NORTH) {
			checkDesiredDirectionForObstacles(EAST);	
		}
		else if (enemyCycleDirection == EAST) {
			checkDesiredDirectionForObstacles(SOUTH);	
		}
		else if (enemyCycleDirection == SOUTH) {
			checkDesiredDirectionForObstacles(WEST);	
		}
		else if (enemyCycleDirection == WEST) {
			checkDesiredDirectionForObstacles(NORTH);	
		}
		
	}
	else { // else if randomly picked to try and turn in LEFT direction
		
		enemyTryingToTurnRight = false;
		enemyTryingToTurnLeft = true;
		
		if (enemyCycleDirection == NORTH) {
			checkDesiredDirectionForObstacles(WEST);	
		}
		else if (enemyCycleDirection == EAST) {
			checkDesiredDirectionForObstacles(NORTH);	
		}
		else if (enemyCycleDirection == SOUTH) {
			checkDesiredDirectionForObstacles(EAST);	
		}
		else if (enemyCycleDirection == WEST) {
			checkDesiredDirectionForObstacles(SOUTH);	
		}
		
	}
		
} // end function pickRandomDirectionToCheck()



function checkDesiredDirectionForObstacles ( testDirection ) {
	
	// first, record enemy cycle's current direction
	enemyOldDirection = enemyCycleDirection;
	// temporarily set the enemy's cycle direction to the new desired direction,
	// so we can run it through all the collision checks
	enemyCycleDirection = testDirection;
	
	// do checks
	checkForPossibleCollisions();
	
	// finally set the cycle's direction to its previous direction before issuing a turn or another check
	enemyCycleDirection = enemyOldDirection;
	
} // end function checkDesiredDirectionForObstacles ( testDirection )



function pickOppositeDirectionToCheck () {

	if (enemyTryingToTurnRight) {
		
		if (enemyCycleDirection == NORTH) {
			checkDesiredDirectionForObstacles(WEST);	
		}
		else if (enemyCycleDirection == EAST) {
			checkDesiredDirectionForObstacles(NORTH);	
		}
		else if (enemyCycleDirection == SOUTH) {
			checkDesiredDirectionForObstacles(EAST);	
		}
		else if (enemyCycleDirection == WEST) {
			checkDesiredDirectionForObstacles(SOUTH);	
		}
		
	}
	else {
		
		if (enemyCycleDirection == NORTH) {
			checkDesiredDirectionForObstacles(EAST);	
		}
		else if (enemyCycleDirection == EAST) {
			checkDesiredDirectionForObstacles(SOUTH);	
		}
		else if (enemyCycleDirection == SOUTH) {
			checkDesiredDirectionForObstacles(WEST);	
		}
		else if (enemyCycleDirection == WEST) {
			checkDesiredDirectionForObstacles(NORTH);	
		}
		
	}
	
	enemyTryingToTurnRight = !enemyTryingToTurnRight;
	enemyTryingToTurnLeft = !enemyTryingToTurnLeft;
	
} // end function pickOppositeDirectionToCheck()



function turnInNewDirection () {
	
	if (enemyTryingToTurnRight) {
		// issue turn RIGHT command
		enemyTurnCycleRight = true;
		enemyTurnCycleLeft = false;
	}
	if (enemyTryingToTurnLeft) {
		// issue turn LEFT command
		enemyTurnCycleLeft = true;
		enemyTurnCycleRight = false;
	}
	
	// reset random free-turn timer
	enemyFreeTurnTimer.reset();
	// reset turn ability timer so enemy can't rapid-fire turn
	enemyJustTurnedTimer.reset();
	
} // end function turnInNewDirection()
