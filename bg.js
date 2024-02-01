/*****************************
	Canv
************************/
var canv = document.getElementById( "canvas_bg" );
var ctx = canv.getContext( "2d" );


var canv_bg = "#ffffff";


function canv_adjust()
{
	canv.width = window.innerWidth ;
	canv.height = window.innerHeight;
};






/****************
	Utils Math
******************/

var rand = Math.random;

function guid()
{
	return (
		( Math.random() )
			.toString( 36 )
			.substring( 2 )
	);
};


function rand_range(
	min
	,
	max
)
{
	
	return (
		( rand() * ( max - min ) ) + min
	);
	
};

function rand_range_int(
	min
	,
	max
)
{
	
	return (
		Math.round(
			rand_range( min , max )
		)
	) ;
	
};


function interpolate_linear
(
	x1 , y1
	,
	x2 , y2
	,
	x
)
{
	
	return (
		y1 + (y2 - y1)/( x2 - x1 ) * ( x - x1 )
	);
};




/****************
	Utils Plane
***************/

function distance
(
	x1 , y1
	,
	x2 , y2
)
{
	
	return (
		Math.sqrt(
			( ( x2 - x1 ) ** 2 )
			+
			(( y2 - y1 ) ** 2 )
		)
	);
};






/*******************************
	Link
***********************************/
function link
(
	x1 , y1
	,
	x2 , y2
	,
	link_dist_max
	,
	link_fade_start
	,
	link_thin_start , link_width_max
	
)
{
	var dist = (
		distance( x1 , y1 , x2 , y2 )
	);
	
	
	if( dist <= link_dist_max )
	{
		
		/************* Link Color ***********/
		var link_color = "" ;
		
		
		var link_alpha_max = 1 ;
		var link_alpha_min = 0 ;
		
		
		var link_alpha = 0;
		
		if( dist >= link_fade_start )
		{
			link_alpha = (
				
				interpolate_linear(
					link_fade_start , link_alpha_max
					,
					link_dist_max , link_alpha_min
					,
					dist
				)
				
			);
		}
		
		else
		{
			
			link_alpha = link_alpha_max;
		}
		
		
		
		link_color = (
			`rgba(0,0,0,${ link_alpha })`
		);
		
		
		
		
		/************* Link Width ********************/
		
		var link_width = 0;
		
		
		
		var link_width_min = 0;
		
		if( dist >= link_thin_start )
		{
			
			link_width = (
				
				interpolate_linear(
					link_thin_start , link_width_max
					,
					link_dist_max , link_width_min
					,
					dist
				)
			);
			
		}
		
		else
		{
			link_width = link_width_max;
		}
		
		
		
		/************ Draw Link **********/
		
		ctx.strokeStyle = link_color;
		ctx.lineWidth = link_width;
		
		
		ctx.beginPath();
			
			ctx.moveTo( x1 , y1 );
			ctx.lineTo( x2 , y2 );
			
		ctx.closePath();
		
		
		ctx.stroke();
		
		
		
	}
	
	
	
};





/******************************************
		Bits
************************************/
var bit = 0;

var bits = [ ];

var bits_limit_low = (
	()=> (
		Math.floor(
			( canv.width * canv.height )
			/
			( 22778 )
		)
	)
);


var bit_imgs = [ ];


function load_bit_imgs( )
{
	
	var bit_img_urls = [
		"./img/zero.svg"
		,
		"./img/one.svg"
	];
	
	
	var bit_img_loaded_cnt = 0 ;
	
	
	return (
		new Promise(
			( r )=> {
				var imgs = (
					(bit_img_urls)
						.map(
							( u )=> {
								var img = new Image(  );
								img.src = u;
								
								img.onload = (
									()=> {
										bit_img_loaded_cnt += 1;
										
										if(
											bit_img_loaded_cnt
											===
											bit_img_urls.length
										)
										{
											r();
										}
										
										
									}
								);
								
								return img ;
							}
						)
				);
				
				
				bit_imgs = imgs ;
				
			}
		)
	);
};


function create_bit_delt()
{
	var px_per_frame_limit = 0.22;
	
	var px_per_frame = (
		rand_range(
			-px_per_frame_limit
			,
			px_per_frame_limit
		)
	);
	
	var px_per_sec = ( px_per_frame * 60 );
	
	return px_per_sec;
	
};


function bit_create
( val , x , y )
{
	return (
		{
			id : guid()
			,
			x
			,
			y
			,
			val
			,
			x_delt : create_bit_delt()
			,
			y_delt : create_bit_delt()
			,
			size : rand_range_int( 10 , 29 )
		}
	);
};


function bit_draw( bit_obj )
{
	var {
		x
		,
		y
		,
		val
		,
		size
	} =(
		bit_obj
	);
		
		
		ctx.drawImage(
			bit_imgs[ val ]
			,
			x - ( size >> 1 )
			,
			y - ( size >> 1 )
			,
			size
			,
			size
		);
		
	
	
};


function bit_add
( val ,x , y )
{
	
	var bit_obj = (
		bit_create( val , x , y )
	);
	
	
	bits.push( bit_obj );
	
	
	bit = + ! ( bit );
	
};


function bit_add_rand()
{
	var x = rand_range_int( 0 , canv.width );
	var y = rand_range_int( 0 , canv.height );
	bit_add( rand_range_int( 0 , 1 ) , x , y );
}



function maintain_bit_population()
{
	var len = bits.length ;
	var lim = bits_limit_low();
	
	
	if( len < lim )
	{
		
		var delta = lim - len ;
		for( var i = 0; i < delta ;  i +=1 )
		{
			bit_add_rand() ;
		};
	}
	
};



function link_bits
(
	x1 , y1
	,
	x2 , y2
)
{
	
	var dist_max = 400 ;
	var fade_start = 0;
	var thin_start = 120 ;
	var width_max = 0.7 ;
	
	return (
		
		link(
			x1 , y1
			,
			x2 , y2
			,
			dist_max
			,
			fade_start
			,
			thin_start , width_max
		)
	);
	
};



function draw_bits( dt_s )
{
	
	
	( bits )
		.forEach(
			( bit , idx )=> {
				
				
				/********* Draw **********/
				bit_draw( bit );
				
				
				
				
				/*********** Move Bits ************/
				var {
					id : bit_id
					,
					x : bit_x
					,
					y : bit_y
					,
					x_delt
					,
					y_delt
				} = ( bit );
				
				bit.x += ( x_delt * dt_s );
				bit.y += ( y_delt * dt_s );
				
				
				
				
				
				/*************** Drop Out Bits ********************/			
				
				var safe_zone_range = 21 ;
				
				if(
						( bit_x < ( 0 - safe_zone_range ) )
						||
						( bit_x > ( canv.width + safe_zone_range ) )
					||
						( bit_y < ( 0 - safe_zone_range ) )
						||
						( bit_y > ( canv.height + safe_zone_range ) )
				)
				{
					bits = (
						bits.filter(
							( bit2 )=> ( bit2.id !== bit_id )
						)
					);
					
					maintain_bit_population();
					
				}
				
				
				
				
				
				
				/******************** Link Bits ***************************/
					
				for( var j = idx + 1  ; j < bits.length ; j += 1 )
				{
					
					var bit2 = bits[ j ];
					
					var {
						x : bit_x
						,
						y : bit_y
					} = bit;
					
					var {
						x : bit2_x
						,
						y : bit2_y
					} = (
						bit2
					);
					
					
					
					link_bits(
						bit_x , bit_y
						,
						bit2_x , bit2_y
					);
					
					
				};
				
			}
		);
};






/***************************
	Hand
******************************/

var hand_pos = null ;

function link_hand
(
	x1 , y1
	,
	x2 , y2
)
{
	var dist_max = 220 ;
	var fade_start = 160;
	
	/* Disable Line Thining */
	var thin_start = dist_max ;
	
	var width_max = 1 ;
	
	
	return (
		link(
			x1 , y1
			,
			x2 , y2
			,
			dist_max
			,
			fade_start
			,
			thin_start , width_max
		)
	);
	
} ;

function draw_hand( hand_pos )
{
	
	var { x : hand_x , y : hand_y } = hand_pos;
	
	
	/**************** Draw Hand Links *******************/
	bits.forEach(
		( bit )=> {
			
			var { x : bit_x , y : bit_y } = (
				bit
			);
			
			link_hand(
				hand_x , hand_y
				,
				bit_x , bit_y
			);
			
		}
	);
	
	
	
	/**************** Draw Hand Point ***********************/
	ctx.fillStyle = "#000000" ;
		ctx.beginPath();
			ctx.arc(
				hand_x
				,
				hand_y
				,
				2.6
				,
				0
				,
				Math.PI << 1
			);
		ctx.closePath();
	ctx.fill();
	
};








/*************************
	Main Loop
*********************/

function canv_clear()
{
	
	ctx.fillStyle = ( canv_bg );
	ctx.fillRect( 0 , 0 , canv.width , canv.height );
};


var frame_id = 0;
function update( dt_s)
{
	
	canv_clear();
	
	
	draw_bits( dt_s ) ;
	
	if( hand_pos !== null )
	{
		draw_hand( hand_pos );
	}
	
	
	
	frame_id ++ ;
};


var timestamp_prev = 0 ;
function main_loop( timestamp )
{
	
	var dt = timestamp - timestamp_prev ;
	var dt_s = ( dt ) / 1000;
	
	update( dt_s );
	
	
	timestamp_prev = timestamp;
	window.requestAnimationFrame( main_loop );
};




/*********************
	Setup
*************************/

function reinit()
{
	canv_adjust();
	maintain_bit_population();
};


function start_draw()
{
	
	window.requestAnimationFrame( main_loop );
};


function start()
{
	reinit() ;
	start_draw() ;
};


function run()
{
	load_bit_imgs()
		.then(
			start
		);
} ;




/***********************
	Event Listeners
************************/


/************ Window Resize *************/
window.addEventListener(
	"resize"
	,
	reinit
);


/********** Mouse Click *************/
window.addEventListener(
	"click"
	,
	( click_event )=> {
		
		/* Not add bit when click after selecting text. */
		if(window.getSelection().type == "Range")
		{
			return;
		}
		
		
		var { x , y } = click_event ;
		
		bit_add( bit , x , y );
		
	}
);

/************* Mouse Move ***********/
document.addEventListener(
	"mousemove"
	,
	( { x , y } )=> {
		
		hand_pos = ({ x , y });
	}
);
document.addEventListener(
	"mouseleave"
	,
	()=> { hand_pos = null ; }
);





/***************
	Go
****************/
run();

