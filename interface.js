function showElements()
{
	// initialize the drawing
	ctx.clearRect(0,0, canvas.width, canvas.height);

	// show box
	draw_box();

	// show particles
	for(var i=0; i < ped_SN_X.length; i++)
		{
			draw_particle(ped_SN_X[i], ped_SN_Y[i],'green',ped_radius);
			draw_particle(ped_WE_X[i], ped_WE_Y[i],'blue', ped_radius);
		}

	// print simulation time
	document.getElementById("texteTempsSimu").textContent = "Time : " + t_simu.toFixed(2) + " s";
};


// draw the intersection lines
function draw_box()
{
  ctx.beginPath();
  ctx.moveTo(2/5*box_size,1);
  ctx.lineTo(2/5*box_size,2/5*box_size);
  ctx.lineTo(1,2/5*box_size);
  ctx.moveTo(1,3/5*box_size);
  ctx.lineTo(2/5*box_size,3/5*box_size);
  ctx.lineTo(2/5*box_size,box_size);
  ctx.moveTo(box_size,3/5*box_size);
  ctx.lineTo(3/5*box_size,3/5*box_size);
  ctx.lineTo(3/5*box_size,box_size);
  ctx.moveTo(box_size,2/5*box_size);
  ctx.lineTo(3/5*box_size,2/5*box_size);
  ctx.lineTo(3/5*box_size,1);
  ctx.stroke();
  ctx.closePath();   
};

// draw pedestrians
function draw_particle(x, y, color, radius)
{
  ctx.beginPath();
  ctx.arc(x,y,radius,0,2*Math.PI);
  //ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
};


// interface functions
function startAnimation()
{
  onGoing = true;
};

function pauseAnimation()
{
  onGoing = !onGoing;
};

function restartAnimation()
{
  onGoing = false;
  initialise();
};

// dynamic parameter change
function changeParam(name, newValue)
{
	document.getElementById("span_" + name).textContent = newValue;
	
	switch(name)
	{
	  case "flux" :
		flux = Number(newValue);
		showElements();
      break;
    
    case "timestep" :
		dt = Number(newValue);
		showElements();
    	break;
	}
};

// button functions
function changeFrontalAvoidance()
{
	frontal_avoidance_active = btn_frontal_avoidance.checked;
}

function changeSideAvoidance()
{
	side_avoidance_active = btn_side_avoidance.checked;
}