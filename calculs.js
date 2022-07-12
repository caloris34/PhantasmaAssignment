
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var raf;

var t_simu = 0;			// total simulation time
var t_ped = 0;			// counter for pedestrian inlet

// avoidance
var btn_frontal_avoidance = document.getElementById("check_frontal_avoidance");
var frontal_avoidance_active = btn_frontal_avoidance.checked;

var btn_side_avoidance = document.getElementById("check_side_avoidance");
var side_avoidance_active = btn_side_avoidance.checked;

// simulation running
var onGoing = false;

// --- Simulation Parameters

// all geometrical values are given in pixel with the identity 1m = 20px

var ped_diameter = 10; 									// pedestrian radius in pixels, correspondign to 0.5m
var ped_radius = ped_diameter / 2.0; 		// pedestrian radius
var box_size = 500; 										// pixels, corresponding to 25m

var i = 0;
var j = 0;

var new_ped = 0.0; 				// how many new pedestrians are entering in this iteration
var accel = 0.0; 					// acceleration
var N_ped = 0;						// number of pedestrians 

// arrays of pedestrians going SOUTH to NORTH
var ped_SN_X = new Array(); 		// x location
var ped_SN_Y = new Array(); 		// y location
var ped_SN_Vx = new Array(); 		// horizontal speed on X axis
var ped_SN_Vy = new Array();		// vertical speed on Y axis

// arrays of pedestrians going WEST to EAST
var ped_WE_X = new Array();
var ped_WE_Y = new Array();
var ped_WE_Vx = new Array();
var ped_WE_Vy = new Array();

var x_init = -ped_radius;									// x location of WE pedestrians inlet
var y_init = box_size + ped_radius + 1;		// y location of SN pedestrians inlet

var dist_x; 				// horizontal distance between two close elements
var dist_y; 				// vertical distance between two close elements
var distance; 			// distance between any two elements
var distance_WE; 		// horizontal distance of same family WE to avoid frontal collision
var distance_SN; 		// vertical distance of same family SN to avoid frontal collision

var future_distance // future distance taking into account velocity displacement
var future_distance_WE 
var future_distance_SN 
var future_dist_x 
var future_dist_y 

var flux = 2.0; 			// new pedestrians per second
var dt = 0.05;				// time step

var sqrt2 = Math.sqrt(2);
var maxMove = 0; 			// maximum displacement possible = maxVelocity*dt

// for visualization
var iframe = 0;
var iframeRate = 1;

// initialisation
function initialise()
{
  t_simu = 0; 				
  t_ped = 0;
  iframe = 1;
	new_ped = 0.0;
	ped_SN_X = [];
	ped_SN_Y = [];
	ped_SN_Vx = [];
	ped_SN_Vy = [];
	ped_WE_X = [];
	ped_WE_Y = [];
	ped_WE_Vx = [];
	ped_WE_Vy = [];
  showElements();
};

function insert_pedestrians()
{
	// new_ped is the number of new pedestrians entering in this iteration, and we will add them to the already existing vector with a random speed
	for (var p = 1; p <= new_ped; p++)
	{
		ped_SN_X.push(((Math.random() * (0.2 - 0.02)) + 0.41) * box_size); // random location at bottom inlet
	 	ped_SN_Y.push(y_init);
		ped_SN_Vx.push(0);
		ped_SN_Vy.push(-(Math.random()*(1.3-1.1)+1.1));
		//
	 	ped_WE_X.push(x_init);
	 	ped_WE_Y.push(((Math.random()*(0.2 - 0.02)) + 0.41) * box_size); // random location at left inlet
		ped_WE_Vx.push(Math.random()*(1.3-1.1)+1.1);
		ped_WE_Vy.push(0);
	}
	new_ped -= Math.floor(new_ped);
}

// --- Frontal avoidance algorithm
function frontal_avoidance(i, j)
{
  if(i != j)
  {

  	// SOUTH-NORTH
  	// check if any collision has happened
    distance_SN = Math.sqrt(Math.pow(ped_SN_Y[i] - ped_SN_Y[j],2) + Math.pow(ped_SN_X[i] - ped_SN_X[j],2));
    if (distance_SN < ped_diameter && ped_SN_Y[i] < (box_size - ped_diameter) && ped_SN_Y[j] < (box_size - ped_diameter) )
    {
  		console.log(i + " i location: " + ped_SN_X[i] + " " + ped_SN_Y[i])
  		console.log(j + " j location: " + ped_SN_X[j] + " " + ped_SN_Y[j])
	  	console.log("ped_SN_Vy[i] = " + ped_SN_Vy[i] + " and ped_SN_Vy[j] = " + ped_SN_Vy[j])
			console.log("Ops! At " + N_ped + " SN collision: " + i + " and " + j + " with distance " + distance_SN);
   	  onGoing = false;
    }

  	// estimate where pedestrians will be after this iteration and eventually correct their speed
    future_distance_SN = Math.sqrt(Math.pow( ped_SN_Y[i]+20*ped_SN_Vy[i]*dt - (ped_SN_Y[j]+20*ped_SN_Vy[j]*dt),2) + Math.pow(ped_SN_X[i] - ped_SN_X[j],2));

		if (future_distance_SN <= ped_diameter + maxMove && ped_SN_Y[i] < box_size && ped_SN_Y[j] < box_size ) // Danger! Stop!
		{
			if (ped_SN_Y[i] > ped_SN_Y[j])
			{
  	  	ped_SN_Vy[i] = 0;
			}
			else
			{
			 	ped_SN_Vy[j] = 0;
			}
		}

		// WEST-EAST
  	distance_WE = Math.sqrt(Math.pow(ped_WE_Y[i] - ped_WE_Y[j],2) + Math.pow(ped_WE_X[i] - ped_WE_X[j],2));
    if ( distance_WE < ped_diameter && ped_WE_X[i] > ped_diameter && ped_WE_X[j] > ped_diameter && ped_WE_X[i] < box_size && ped_WE_X[j] < box_size )
    {
  		console.log(i + " i location: " + ped_WE_X[i] + " " + ped_WE_Y[i])
  		console.log(j + " j location: " + ped_WE_X[j] + " " + ped_WE_Y[j])
  		console.log("ped_WE_Vx[i] = " + ped_WE_Vx[i] + " and ped_WE_Vy[j] = " + ped_WE_Vx[j])
  		console.log("Ops! At " + N_ped + "! WE collision: " + i + " and " + j + " with distance " + distance_WE)
   	  onGoing = false;
    }

  	future_distance_WE = Math.sqrt(Math.pow(ped_WE_Y[i] - ped_WE_Y[j],2) + Math.pow(ped_WE_X[i]+20*ped_WE_Vx[i]*dt - (ped_WE_X[j]+20*ped_WE_Vx[j]*dt ),2));

		if (future_distance_WE <= ped_diameter + maxMove && ped_WE_X[i] > 0 && ped_WE_X[j] > 0) // Danger! Stop!
		{
			if (ped_WE_X[i] < ped_WE_X[j])
			{
  	  	ped_WE_Vx[i] = 0;
			}
			else
			{
			 	ped_WE_Vx[j] = 0;
			}
		}
	}
}


// --- Side avoidance algorithm
// NB: when establishing relative position, remember that Y axis is downwards!
function side_avoidance(i, j)
{
  // compute distance between each pedestrian of opposite groups
  distance = Math.sqrt(Math.pow(ped_WE_Y[i] - ped_SN_Y[j],2) + Math.pow(ped_WE_X[i] - ped_SN_X[j],2));
	
  if (distance < ped_diameter)  // check if any collision has happened
  {
  	console.log("SN location: " + ped_SN_X[j] + " " + ped_SN_Y[j])
  	console.log("WE location: " + ped_WE_X[i] + " " + ped_WE_Y[i])
  	console.log("ped_WE_Vx = " + ped_WE_Vx[i] + " and ped_SN_Vy = " + ped_SN_Vy[j])
		console.log("Ops! At " + N_ped + " SN/WE collision: " + i + " and " + j + " with distance " + distance);
 	  onGoing = false;
  }
		
 	future_distance = Math.sqrt(Math.pow(ped_WE_Y[i] - (ped_SN_Y[j]+20*ped_SN_Vy[j]*dt),2) + Math.pow(ped_WE_X[i]+20*ped_WE_Vx[i]*dt - ped_SN_X[j] ,2));
 	
	if (future_distance < 2*ped_diameter) // pedestrians are getting close, let's compute something more
  {
  	future_dist_x = ped_SN_X[j] - ped_WE_X[i];
  	future_dist_y = ped_SN_Y[j] - ped_WE_Y[i];  

    // CASE 1: pedestrian WE is stopping - sqrt(2) factor for giving a margin (= to square's diagonal) 
  	if ( ped_diameter < future_dist_x && future_dist_x < sqrt2*ped_diameter // this sqrt(2) realizes the priority to the right
    && 	-ped_diameter < future_dist_y && future_dist_y < sqrt2*ped_diameter )
    {
  		ped_WE_Vx[i] = 0;
    }
	
    // CASE 2: pedestrian SN is stopping - if SN is found below WE
	  if ( -ped_diameter < future_dist_x && future_dist_x < ped_diameter
   	&& 	 ped_diameter < future_dist_y && future_dist_y < sqrt2*ped_diameter )
    {
  		ped_SN_Vy[j] = 0;
    }   
  }  
};

// --- Avoid overlap = avoid a glitch that could stop all pedestrians at the entry 
function avoid_overlap(i,j)
{
	if (i != j)
	{
		if ( ped_SN_Y[i] == ped_SN_Y[j] && ped_SN_Y[i] > (box_size - ped_diameter) )
		{
			ped_SN_Y[i] -= ped_radius;
			ped_SN_Y[j] += ped_radius;
		}
		if ( ped_WE_X[i] == ped_WE_X[j] && ped_WE_X[i] < ped_diameter )
		{
			ped_WE_X[i] -= ped_radius;
			ped_WE_X[j] += ped_radius;
		}
	}
}


// main_loop 
function main_loop()
{ 
  var d = new Date();
  var t_actuel = d.getTime();
  var dt_aff = (t_actuel - t_prec)/1000.0;

  // compute pedestrians' trajectory once every 16 imgs/sec
  if(onGoing && (dt_aff >0.063))
  {
    t_prec = t_actuel;
    t_simu += dt;
    t_ped += dt;
    iter = Math.round(t_simu / dt);

	 	maxMove = 1.3*dt*20;	// max speed * dt * 20 pixel 

    if (iter==1)
    {
   		console.log("dt is " + dt)
   		console.log("flux is " + flux)    	
    }

    if (t_ped >= 1)    		// check if it is time to add new pedestrians
   	{
			new_ped += flux;
			t_ped -= 1;
   	}

// boundary condition left/bottom: pedestrian insertion
		if (new_ped >= 1) 		// add new pedestrians
	    {
	    	insert_pedestrians()
			}

		N_ped = ped_SN_X.length; 

    // First, change all pedestrians' acceleration and velocity
    for(i = 0; i < N_ped; i++)
    {
      ped_SN_Vy[i] += dt * (Math.random()*(4)-2);
      if (ped_SN_Vy[i] > -1.1) // check that velocity does not exceed limits
      {
      	ped_SN_Vy[i] = -1.1;
      }
      if (ped_SN_Vy[i] < -1.3)
      {
      	ped_SN_Vy[i] = -1.3;
      }
      //
			ped_WE_Vx[i] += dt * (Math.random()*(4)-2);
			if (ped_WE_Vx[i] < 1.1)
			{
      	ped_WE_Vx[i] = 1.1;
			}
      if (ped_WE_Vx[i] > 1.3)
      {
      	ped_WE_Vx[i] = 1.3;
      }
    }

    // Second, test collision and eventually stop velocity
    for(i = 0; i < N_ped; i++)
    {
	    if (frontal_avoidance_active)
	    {
	 		  if (side_avoidance_active)
	 		  {
	 		  	for(var j = 0; j < N_ped; j++)
	 		  	{
	 		  	frontal_avoidance(i, j);
				  side_avoidance(i, j);	    	    	
	 		  	avoid_overlap(i,j);
	 		  	}
	 		  }
	 		  else
	 		  {
	 		   	for(j = 0; j < N_ped; j++)
	 		  	{
	 		  	frontal_avoidance(i,j);
	 		  	avoid_overlap(i,j);
	 		  	}
	 		  }
	    }
	    else
	    {
	    	if (side_avoidance_active)
	 		  {
	 		  	for(var j = 0; j < N_ped; j++)
	 		  	{
				  side_avoidance(i, j);	    	    	
	 		  	avoid_overlap(i,j);
	    		}
	    	}
	 		}
		}

    // Third and last, with corrected speed, move pedestrians 
    for(i = 0; i < N_ped; i++)
    {		
      ped_SN_Y[i] = ped_SN_Y[i] + dt * 20*ped_SN_Vy[i]; // scaled for 20 pixels
      ped_WE_X[i] = ped_WE_X[i] + dt * 20*ped_WE_Vx[i];
    }

	  // Possible improvment: free memory of exited pedestrians
	    // if (ped_WE_X[i] > box_size)
	    // {
	    	// console.log("time to remove ped_WE" + i)
	    // }
	    // if (ped_SN_Y[j] < ped_radius)
	    // {
	    	// console.log("time to remove ped_SN" j)
	    // }

    showElements();     
  }

  // displaying function
  raf = window.requestAnimationFrame(main_loop);

};

// Simulation start
var d0 = new Date();
var t_prec = d0.getTime();
initialise();
main_loop();
// until stopped


