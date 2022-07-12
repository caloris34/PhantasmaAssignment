"# PhantasmaAssignment" 


README file for the assignment of Loris Casadei's application to Simulation Engineer

Dear Phantasma Labs,

Before descending into the details of my development, I need to make a disclaimer.

I must acknowledge that, if I had to develop from scratch this exercise, I believe I would have not made it in this time frame. This is mostly due to my lack of expertise in real time visualization problems with any programming language (not typical in the CFD world!).

For this reason, I spent the first hours figuring out how to solve this issue. That is when I thought ot a web application I recently used on the Lattice Boltzmann Method, the CFD kind of solver simulating fluid particles on mesoscopic scale.
I recovered these sources from Cerfacs website (which unfortunately is not open source, but I can show it to you in a video-call if needed) and deeply modified them to our pedestrian flow problem.
That explains my choice in using JS language, on which I am not the strongest, instead of another languages I am more comfortable with (Py or C++). 

I am a strong believer that, as engineers, we should not "reinvent the wheel". For this reason and in the hope that you believe the same, I preferred being fully transparent on this.



About the code, there is 3 files worth mentioning:
- index.html (and stylesheet.css) creates the web page structure
- interface.js is related to the graphic interface, i.e. the drawing and parameters live modification
- calculs.js is where the main loop and all calculations are performed



How to use the code:
0) Open the index.html file with your browser (tested in Chrome and Firefox)
1) Select the flux and time step of your choice, then Start the simulation. The flux and timestep can be changed while the simulation is running.
2) The different development steps included:
	- all avoidances desactivated, in order to check the inlet condition at different flux/timestep
	- frontal avoidance active, for pedestrians of same family to avoid frontal collision
	- side avoidance, to avoid collisions among pedestrians of opposite family.

I performed different test for around 2-3 minutes simulation time and did not encounter pedestrian crashes. May it happen, the simulation will automatically stop.



Here some remarks and hypotheses specific to my implementation:

Axis orientation:
- the X axis is positive rightwards, the Y axis downwards (because of the screen pixel numbering)

New pedestrian's Velocity:
- all new pedestrians start with a velocity in the range [1.1, 1.3] m/s and at each iteration they will have a new random acceleration in [-2, 2] m/s^2, without exceeding the velocity limits. Pedestrians move only linearly, they don't make turns.

Avoidance rule:
- because pedestrians move linearly, the only way to avoid collision is by stopping. A generic rule "give way to the right" has been applied. Thus, the horizontal-moving pedestrians will always stop for giving way to the vertical-moving pedestrians, if needed. Frontal collisions with pedestrian of same "family" are avoided by stopping the rear pedestrian.



Conclusions:
- pedestrians are injected at different flux rates and the simulation can be run at different time steps. Pedestrians always avoid each other and exit at the respective side.
- while low fluxes don't present any problem, higher fluxes create "congestions" due to the strict stopping rule. This may be avoided by implementing a more sophisticated avoidance rule as explained below.



Possible improvements:

1) Boundary condition OUTLET: pedestrians crossing an outlet boundary continue their walking outside the viewable domain --> freeing memory would be a first improvement needed, simply by testing the pedestrian location. However I could not find an efficient method in Java to remove elements from an array...

2) Pedestrian data structure: simple variables have been declared for the two pedestrians families and each parameter (location, velocity). A more general database/list/structure including all pedestrians information would be more appropriate for more complex problems. All pedestrians could be a single variable (independently of their direction) and their collision could be studied by sorting them for their location at each iteration (starting to look first at those closest to the exit)

3) Avoidance method: making the pedestrians moving in all directions (within the walls' limits) is obviously a next step in making the simulation more realistic and efficient for avoiding traffic congestions.



Thank you for the opportunity to challenge myself on this task, I had a lot of fun :)

I remain available to give you any further explanation by emailing me at loris.casadei0@gmail.com .


