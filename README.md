3dLightCycles
==============

A 3D Arcade game based on the LightCycle sequence in the movie TRON. <br>

[play 3dLightCycles](http://erichlof.github.io/3dLightCycles/3dLightCycles.html)
\ [[view main source](https://github.com/erichlof/3dLightCycles/blob/gh-pages/3dLightCycles.html)\]

<h5>Be sure to check out my other 3D games!</h5>
* [SpacePong3D](https://github.com/erichlof/SpacePong3D)
* [AsteroidPatrol3D](https://github.com/erichlof/AsteroidPatrol3D)


<h4>Quick instructions for 3dLightCycles:</h4>
<h6>Desktop:</h6> 
Mouse controls camera rotation <br>
LMouseButton: Turn Left <br>
RMouseButton: Turn Right <br>
SPACE: Move Camera Forward (debug FlyCam) <br>


<h6>Mobile:</h6> 
slow Swipe to control camera rotation <br>
PurpleButton: Turn Left <br>
OrangeButton: Turn Right <br>

March 4, 2015 Progress Note
--------------------------------

Now you can turn the cycle Left and Right and it will correctly spawn a jet trail behind it.  Like the 1982 Tron movie, the trails blend from White to cycle-color and gently curve upwards from the back wheel to the top of the trail.  There is no collisions yet with arena wall boundaries or jet trails, but that will be coming soon!  Also I will add the ability to speed the cycle up with a button, and then when the button is released, it will automatically throttle back down to whatever the default cycle speed will be in the game (haven't determined the default speed yet, but it will be faster than it is now).  The cycle is moving slowly now so I can check that everything is working properly. :)


February 24, 2015 Progress Note
--------------------------------

Added cycle's jet wall.  The geometry's vertex colors smoothly interpolate between White (which will spawn from the back wheel of the cycle) to the desired cycle's wall color.  The jet trail walls also have vertical line segments every 10 units.  Next up is to change the white part's geometry so that it bends down towards the cycle's back wheel (like in the 1982 Tron movie).  Things are starting to take shape!


February 7, 2015 Progress Note
--------------------------------

Initial commit.  The game doesn't do much yet but hang in there! :)
