Point = function(x_bound,y_bound){
  this.radius    = 5;
  this.xy        = [get_random_int(this.radius,x_bound + this.radius), get_random_int(this.radius, y_bound - this.radius)]
  this.color     = 'white';
  //this.point_map = 
  this.draw = function(ctx){
    ctx.beginPath();
    ctx.arc(this.xy[0],this.xy[1],this.radius,0,2*Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

Laser = function(x,y,direction,x_bound,y_bound){
  this.speed     = get_random_int(5,8);
  this.direction = direction;
  this.color     = 'red';
  this.length    = 200;
  this.xy_bound  = [x_bound,y_bound];

  this.start_map = {37: [x_bound,y],
                    38: [x,y_bound],
                    39: [0,y],
                    40: [x,0]};
  this.move_map  = {37: [-this.speed,0],
                    38: [0,-this.speed],
                    39: [this.speed,0],
                    40: [0,this.speed]};
  this.end_map   = {37: [this.length,0],
                    38: [0,this.length],
                    39: [-this.length,0],
                    40: [0,-this.length]};

  this.xy = this.start_map[this.direction];
  this.end_xy = this.xy;
  this.draw = function(ctx){
    ctx.beginPath();
    ctx.moveTo(this.xy[0], this.xy[1]);
    ctx.lineTo(this.end_xy[0], this.end_xy[1]);
    ctx.strokeStyle = this.color;
    ctx.stroke();
  }
  this.should_wrap = function(){
    if(this.direction == 37){
      if(this.xy[0]+this.end_map[this.direction][0] < 0) return true;
    }
    else if(this.direction == 38){
      if(this.xy[1]+this.end_map[this.direction][1] < 0) return true;
    }
    else if(this.direction == 39){
      if(this.xy[0]+this.end_map[this.direction][0] > this.xy_bound[0]) return true;
    }
    else if(this.direction == 40){
      if(this.xy[1]+this.end_map[this.direction][1] > this.xy_bound[1]) return true;
    }
    return false;
  }

  this.wrap_it = function(){
    this.xy = this.start_map[this.direction];
    this.end_xy = this.xy;
  }

  this.move = function(){
    this.xy = [this.xy[0]+this.move_map[this.direction][0], this.xy[1]+this.move_map[this.direction][1]];
    if(this.should_wrap()) this.wrap_it();
    this.end_xy = [this.xy[0]+this.end_map[this.direction][0], this.xy[1]+this.end_map[this.direction][1]];
  }
}

Pacman = function(x,y,r,color,x_bound,y_bound,bgcolor){
  this.xy       = [x,y];
  this.radius   = r;
  //this.xy_bound = [x_bound,y_bound];
  this.color    = color;
  this.speed    = 5;
  this.bgcolor  = bgcolor;
  /* 37 = LEFT
     38 = UP
     39 = RIGHT
     40 = DOWN */
  this.dpad_map = {37: [-this.speed, 0],
                   38: [0, -this.speed],
                   39: [this.speed, 0],
                   40: [0, this.speed]};
  this.wrap_map = {37: -this.radius,
                   38: -this.radius,
                   39: x_bound+this.radius,
                   40: y_bound+this.radius};
  this.direction = 39;
  this.phase = 5;
  this.mod_map = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2]

  this.draw = function(ctx){
    /* Draw base circle */
    ctx.beginPath();
    ctx.arc(this.xy[0],this.xy[1],this.radius,0,2*Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    this.draw_triangle(ctx);
}

  this.draw_triangle = function(ctx){
    /* TRIANGLE */
  var triangle = []
    if(this.direction == 37) triangle = [-this.radius, Math.floor(-this.radius*this.mod_map[this.phase]),-this.radius,Math.floor(this.radius*this.mod_map[this.phase])];
    else if(this.direction == 38) triangle = [Math.floor(-this.radius*this.mod_map[this.phase]),-this.radius,Math.floor(this.radius*this.mod_map[this.phase]),-this.radius];
    else if(this.direction == 39) triangle = [this.radius, Math.floor(-this.radius*this.mod_map[this.phase]),this.radius,Math.floor(this.radius*this.mod_map[this.phase])];
    else triangle = [Math.floor(-this.radius*this.mod_map[this.phase]),this.radius,Math.floor(this.radius*this.mod_map[this.phase]),this.radius];

    ctx.beginPath();
    ctx.moveTo(this.xy[0], this.xy[1]);
    ctx.lineTo(this.xy[0] + triangle[0], this.xy[1] + triangle[1]);
    ctx.lineTo(this.xy[0] + triangle[2], this.xy[1] + triangle[3]);
    ctx.fillStyle = this.bgcolor;
    ctx.fill();
  }

  this.wrap_it = function(){
    if(this.direction == 37){
      if(this.xy[0] < this.wrap_map[37]) this.xy[0] = this.wrap_map[39];
    }
    else if(this.direction == 38){
      if(this.xy[1] < this.wrap_map[38]) this.xy[1] = this.wrap_map[40];
    }
    else if(this.direction == 39){
      if(this.xy[0] > this.wrap_map[39]) this.xy[0] = this.wrap_map[37];
    }
    else if(this.direction == 40){
      if(this.xy[1] > this.wrap_map[40]) this.xy[1] = this.wrap_map[38];
    }
  }

  this.move = function(keycode){
    this.xy = [this.xy[0] + this.dpad_map[keycode][0], this.xy[1] + this.dpad_map[code][1]];
    this.direction = keycode;
    this.wrap_it();
    if(this.phase < this.mod_map.length-1) this.phase++
    else this.phase = 0;
  }
}

Rectangle = function(x,y,w,h,color){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = color;
  this.draw = function(ctx){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

Scoreboard = function(){
  this.score_ele = document.getElementById('score');
  this.current_score = parseInt(this.score_ele.value);
  this.change_score = function(points){
    this.score_ele.value = this.current_score + points;
    this.current_score = parseInt(this.score_ele.value);
  }
}

function get_random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


game = function(){
  var game_width  = 800;
  var game_height = 600;
  var game_color  = 'black';
  var char_radius = 20;
  var char_color  = 'yellow';
  var radius_squared = char_radius * char_radius;
  this.c = document.getElementById('backdrop');
  this.c.height = game_height;
  this.c.width  = game_width;
  this.context = this.c.getContext('2d');
  this.backdrop = new Rectangle(0,0,game_width,game_height,game_color);
  this.pacman = new Pacman(this.backdrop.w/2,this.backdrop.h/2,char_radius,char_color,game_width,game_height,game_color);
  this.point = new Point(game_width, game_height);
  this.lasers = [];
  this.laser_max = 50;
  this.scoreboard = new Scoreboard();

  this.draw = function(){
    this.backdrop.draw(this.context);
    this.point.draw(this.context);
    for(var i = 0; i < this.lasers.length; i++){
      this.lasers[i].draw(this.context);
    }
    this.pacman.draw(this.context);
  }

  this.draw(this.context);

  this.got_it = function(){
    if(Math.pow(this.pacman.xy[0] - this.point.xy[0], 2) + Math.pow(this.pacman.xy[1] - this.point.xy[1], 2) <= this.point.radius+5*this.point.radius+5)
      return true;
    return false;
  }

  this.got_hit = function(){
    //rad_squared = this.pacman.radius * this.pacman.radius;
    for(var i = 0; i < this.lasers.length; i++){
      if (this.lasers[i].xy[0] > this.lasers[i].end_xy[0] || this.lasers[i].xy[1] > this.lasers[i].end_xy[1]){
        start_xy = this.lasers[i].end_xy;
        end_xy = this.lasers[i].xy;
      }
      else{
        start_xy = this.lasers[i].xy;
        end_xy = this.lasers[i].end_xy;
      }
      if(this.lasers[i].direction == 37 || this.lasers[i].direction == 39){
        perp_point = [this.pacman.xy[0], start_xy[1]];
        if(perp_point[0] > start_xy[0] && perp_point[0] < end_xy[0]){
          if(Math.pow(perp_point[1] - this.pacman.xy[1],2) <= Math.pow(this.pacman.radius,2))
            return true;
        }
        else{
          start_dist = Math.pow(perp_point[1] - this.pacman.xy[1],2)+Math.pow(perp_point[0] - start_xy[0],2);
          end_dist   = Math.pow(perp_point[1] - this.pacman.xy[1],2)+Math.pow(perp_point[0] - end_xy[0],2);
          if(start_dist <= radius_squared || end_dist <= radius_squared)
            return true;
        }
      }
      else if(this.lasers[i].direction == 38 || this.lasers[i].direction){
        perp_point = [start_xy[0], this.pacman.xy[1]];
        if(perp_point[1] > start_xy[1] && perp_point[1] < end_xy[1]){
          if(Math.pow(perp_point[0] - this.pacman.xy[0],2) <= Math.pow(this.pacman.radius,2))
            return true;
        }
        else{
          start_dist = Math.pow(perp_point[0] - this.pacman.xy[0],2)+Math.pow(perp_point[1] - start_xy[1],2);
          end_dist   = Math.pow(perp_point[0] - this.pacman.xy[0],2)+Math.pow(perp_point[1] - end_xy[1],2);
          if(start_dist <= radius_squared || end_dist <= radius_squared)
            return true;
        }
      }
    }
    return false;
  }

  this.reset = function(){
    for(var i = 0; i < this.lasers.length; i++){
      this.lasers[i].wrap_it();
    }
    this.pacman = new Pacman(this.backdrop.w/2,this.backdrop.h/2,char_radius,char_color,game_width,game_height,game_color);
  }

  $(document).keydown(function(event){
    code = parseInt(event.keycode || event.which);
    if(code <= 40 && code >= 37){
      this.pacman.move(code);
      for(var i = 0; i < this.lasers.length; i++){
        this.lasers[i].move();
      }
      if(this.got_it()){
        this.lasers.push(new Laser(this.pacman.xy[0],this.pacman.xy[1],this.pacman.direction,this.backdrop.w,this.backdrop.h));
        this.point = new Point(this.backdrop.w, this.backdrop.h);
      }
      if(this.got_hit()){
        this.reset();
      }
      this.draw(this.context);
    }
    //$('#msg-keypress').html('keypress() is triggered!, keyCode = ' + event.keyCode + ' which = ' + event.which)
  });
}
