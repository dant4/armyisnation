var hexSystemInitialized = false;

Point = function(x, y) 
{
	this.x = x;
	this.y = y;
}

Cube = function(x, y, z)
{
	// x + y + z = 0
	this.x = x;
	this.y = y;
	this.z = z;
}

Cube.prototype.add = function(other)
{
	this.x += other.x;
	this.y += other.y;
	this.z += other.z;
}


Config = {};

function initHexSystem(hexSize)
{
	hexSystemInitialized 	= true;
	Config.size 		= hexSize;
	Config.height 		= hexSize * 2;
	Config.width 		= Math.sqrt(3)/2 * Config.height;

	Config.hw = Math.floor(Config.width / 2);
	Config.hh = Math.floor(Config.height / 2);
	Config.qh = Math.floor(Config.height / 4);

}


Hex = function (q, r)
{
	var hw = Config.hw;
	var hh = Config.hh;
	var qh = Config.qh;


    var x = /*hw +*/ Config.size * Math.sqrt(3) * (q + r/2);
    var y = /*hh +*/ Config.size * 3/2 * r;

    this.q = q;
    this.r = r;
    this.Id = this.q + "," + this.r;

	this.center = new Point(x, y);
	this.selected = false;

	this.points = [];
	this.points.push(new Point(x 		, y - hh));
	this.points.push(new Point(x + hw 	, y - qh));
	this.points.push(new Point(x + hw 	, y + qh));
	this.points.push(new Point(x 		, y + hh));
	this.points.push(new Point(x - hw 	, y + qh));
	this.points.push(new Point(x - hw 	, y - qh));
}

Hex.prototype.getPoint = function(i)
{
	var angle_deg = 60 * i + 30;
    var angle_rad = Math.PI / 180 * angle_deg;

    return new Point(this.x + Config.size * Math.cos(angle_rad),
                 this.y + Config.size * Math.sin(angle_rad));
}
    
Hex.prototype.drawBorder = function(ctx)
{
	ctx.strokeStyle = "black";
	if(this.selected)
		ctx.strokeStyle = "red";

	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(this.points[0].x, this.points[0].y);
	for(var i = 1; i < this.points.length; i++)
	{
		ctx.lineTo(this.points[i].x, this.points[i].y);
	}
	ctx.closePath();
	ctx.stroke();
}

Hex.prototype.drawName = function(ctx)
{

	ctx.fillStyle = "black"
	ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = 'middle';

	
	ctx.fillText(this.Id, this.center.x, this.center.y + 10);
}

function cube_distance(a, b)
{
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
}


HexGrid = function(rows, cols)
{
	this.hexes = [];
	var first_col = - Math.floor((rows - 1) / 2);

	for(var x = 0; x < rows; x++)
	{
		this.hexes[x] = [];

		for(var y = 0; y < cols; y++)
		{
			var first_q = - Math.floor(x / 2);

			this.hexes[x][y] = new Hex(first_q + y, x); // r, q
		}
	}
}

//array[r][q + r/2],

HexGrid.prototype.draw = function(ctx)
{
	for (var x in this.hexes)
	{
		for(var y in this.hexes[x])
		{
			var hex = this.hexes[x][y];
			if(hex != null)
			{
				hex.drawBorder(ctx);
				hex.drawName(ctx);
			}
		}
	}
}

HexGrid.prototype.getHex = function(q, r)
{
	// q,r =  [r][q + r/2]
	var x = r;
	var y = q + Math.floor(r /2);
    if(this.hexes[x] != undefined && this.hexes[x][y] != undefined)
    	return this.hexes[x][y];
    return null;
}


var directions = [
   new Point(+1,  0), new Point(+1, -1), new Point( 0, -1),
   new Point(-1,  0), new Point(-1, +1), new Point( 0, +1)
]


var HexDirection = 
{
	RIGHT : 0,
	RIGHT_UP : 1,
	LEFT_UP : 2,
	LEFT : 3,
	LEFT_DOWN : 4,
	RIGHT_DOWN : 5
}

HexGrid.prototype.getDirection = function(direction)
{
    return directions[direction]
}

HexGrid.prototype.getNeighbor = function(hex, direction)
{
	var dir = this.getDirection(direction);
	return this.getHex(hex.q + dir.x, hex.r + dir.y);
}

function cube_to_hex(h)
{
    var q = h.x
    var r = h.z
    return new Hex(q, r)
}
function hex_to_cube(h)
{
    var x = h.q
    var z = h.r
    var y = -x-z
    return new Cube(x, y, z)
}
function cube_round(h)
{
    var rx = Math.round(h.x)
    var ry = Math.round(h.y)
    var rz = Math.round(h.z)

    var x_diff = Math.abs(rx - h.x)
    var y_diff = Math.abs(ry - h.y)
    var z_diff = Math.abs(rz - h.z)

    if(x_diff > y_diff && x_diff > z_diff)
        rx = -ry-rz
    else if (y_diff > z_diff)
        ry = -rx-rz
    else
        rz = -rx-ry

    return new Cube(rx, ry, rz)
}

function hex_round(h)
{
    return cube_to_hex(cube_round(hex_to_cube(h)))
}

HexGrid.prototype.getHexAt = function(p)
{
	var x = p.x ;//+ Config.hw;
	var y = p.y ;//+ Config.hh;

	var q = (x * Math.sqrt(3)/3 - y / 3) / Config.size;
    var r = y * 2/3 / Config.size;
    
    var roundedHex = hex_round(new Hex(q,r));

    return this.getHex(roundedHex.q, roundedHex.r);
}
/*
function cube_round(h):
    var rx = round(h.x)
    var ry = round(h.y)
    var rz = round(h.z)

    var x_diff = abs(rx - h.x)
    var y_diff = abs(ry - h.y)
    var z_diff = abs(rz - h.z)

    if x_diff > y_diff and x_diff > z_diff:
        rx = -ry-rz
    else if y_diff > z_diff:
        ry = -rx-rz
    else:
        rz = -rx-ry

    return Cube(rx, ry, rz)


HexGrid.prototype.getHexFromVec2 = function(p) {


    q = (p.x * sqrt(3)/3 - p.y / 3) / size
    r = y * 2/3 / size
    return hex_round(Hex(q, r))

    */