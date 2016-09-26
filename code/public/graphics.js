var Graphics = function()
{
}

Graphics.prototype.get_hex_point = function (center, size, i) {
  
    var angle_deg = 60 * i   + 30;
    var angle_rad = Math.PI / 180 * angle_deg;
    return Point(center.x + size * Math.cos(angle_rad),
                 center.y + size * Math.sin(angle_rad));
}




