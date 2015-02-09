var Settings = function(id){
  this.settings_div = document.getElementById(id);
  this.settings = {'game_width'     : {'default': 800, 'min': 200, 'max': 1200},
                   'game_height'    : {'default': 600, 'min': 200, 'max': 1200},
                   'game_color'     : {'default': 'black'},
                   'char_radius'    : {'default': 20, 'min': 10, 'max': 150},
                   'char_color'     : {'default': 'yellow'},
                   'char_speed'     : {'default': 5, 'min': 2, 'max': 30},
                   'char_lives'     : {'default': 3, 'min': 1, 'max': 10},
                   'ray_length'     : {'default': 200, 'min': 50, 'max': 400},
                   'ray_speed_min'  : {'default': 5, 'min': 1, 'max': 20},
                   'ray_speed_max'  : {'default': 8, 'min': 2, 'max': 30},
                   'ray_max'        : {'default': 50,'min': 20,'max': 100},
                   'point_radius'   : {'default': 5, 'min': 2, 'max': 100}};
}

Settings.prototype.get_setting = function(name){
    value = document.getElementById(name).value;
    if('min' in this.settings[name]){
      value = parseInt(value);
      if(value < this.settings[name]['min'] || value > this.settings[name]['max']){
        alert(name + ' should be between ' + this.settings[name]['min'] + ' and ' + this.settings[name]['max']);
        return false;
      }
    }
    return value;
}

Settings.prototype.create_table = function(){
    if(document.getElementById(this.settings_div+'_table') == null){
      var table   = document.createElement('table');
      table.setAttribute('id',this.settings_div+'_table');
      for(var key in this.settings){
        var row     = document.createElement('tr');
        var setting = document.createElement('th');
        var value   = document.createElement('td');
        var input   = document.createElement('input');
        setting.appendChild(document.createTextNode(key));
        input.setAttribute('type','input');
        input.setAttribute('size', 5);
        input.setAttribute('id',key);
        input.setAttribute('value',this.settings[key]['default']);
        value.appendChild(input);
        row.appendChild(setting);
        row.appendChild(value);
        table.appendChild(row);
      }
      this.settings_div.appendChild(table);
    }
}

var Point = function(radius,x_bound,y_bound){
  this.radius    = radius;
  this.xy        = [get_random_int(this.radius,x_bound - this.radius), get_random_int(this.radius, y_bound - this.radius)]
  this.color     = 'white';
}

Point.prototype.draw = function(ctx){
    ctx.beginPath();
    ctx.arc(this.xy[0],this.xy[1],this.radius,0,2*Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
}

var Ray = function(x,y,direction,x_bound,y_bound, speed_range, length){
  this.speed     = get_random_int(speed_range[0],speed_range[1]);
  this.direction = direction;
  this.color     = 'red';
  this.length    = length;
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
}
Ray.prototype.draw = function(ctx){
    ctx.beginPath();
    ctx.moveTo(this.xy[0], this.xy[1]);
    ctx.lineTo(this.end_xy[0], this.end_xy[1]);
    ctx.strokeStyle = this.color;
    ctx.stroke();
}

Ray.prototype.should_wrap = function(){
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

Ray.prototype.wrap_it = function(){
    this.xy = this.start_map[this.direction];
    this.end_xy = this.xy;
}

Ray.prototype.move = function(){
    this.xy = [this.xy[0]+this.move_map[this.direction][0], this.xy[1]+this.move_map[this.direction][1]];
    if(this.should_wrap()) this.wrap_it();
    this.end_xy = [this.xy[0]+this.end_map[this.direction][0], this.xy[1]+this.end_map[this.direction][1]];
}

var Pacman = function(x,y,r,speed,color,x_bound,y_bound,bgcolor){
  this.xy       = [x,y];
  this.radius   = r;
  this.color    = color;
  this.speed    = speed;
  this.bgcolor  = bgcolor
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
}

Pacman.prototype.draw = function(ctx){
    /* Draw base circle */
    ctx.beginPath();
    ctx.arc(this.xy[0],this.xy[1],this.radius,0,2*Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    this.draw_triangle(ctx);
}

Pacman.prototype.draw_triangle = function(ctx){
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

Pacman.prototype.wrap_it = function(){
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

Pacman.prototype.animate = function(){
    if(this.phase < this.mod_map.length-1) this.phase++
    else this.phase = 0;
}

Pacman.prototype.move = function(keycode){
    this.xy = [this.xy[0] + this.dpad_map[keycode][0], this.xy[1] + this.dpad_map[code][1]];
    this.direction = keycode;
    this.wrap_it();
    this.animate();
}

var Rectangle = function(x,y,w,h,color){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = color;
}
Rectangle.prototype.draw = function(ctx){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
}

/*
Scoreboard = function(){
  this.score_ele = document.getElementById('score');
  this.current_score = parseInt(this.score_ele.value);
  this.change_score = function(points){
    this.score_ele.value = this.current_score + points;
    this.current_score = parseInt(this.score_ele.value);
  }
}*/

function get_random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Game = function(){
  console.log('Starting instance of Game');
  this.settings = new Settings('settings');
  var instance = this;
  this.init_settings = function(){
    console.log('Initializing game settings');
    instance.game_width  = instance.settings.get_setting('game_width');
    instance.game_height = instance.settings.get_setting('game_height');
    instance.game_color  = instance.settings.get_setting('game_color');
    instance.char_radius = instance.settings.get_setting('char_radius');
    instance.char_color  = instance.settings.get_setting('char_color');
    instance.char_speed  = instance.settings.get_setting('char_speed');
    instance.char_lives  = instance.settings.get_setting('char_lives');
    instance.radius_squared = instance.char_radius * instance.char_radius;
    instance.ray_speed_range = [instance.settings.get_setting('ray_speed_min'),instance.settings.get_setting('ray_speed_max')];
    instance.ray_length = instance.settings.get_setting('ray_length');
    instance.point_radius = instance.settings.get_setting('point_radius');
    instance.c = document.getElementById('backdrop');
    instance.c.height = instance.game_height;
    instance.c.width  = instance.game_width;
    instance.context = instance.c.getContext('2d');
    instance.backdrop = new Rectangle(0,0,instance.game_width,instance.game_height,instance.game_color);
    instance.pacman = new Pacman(instance.backdrop.w/2,instance.backdrop.h/2,instance.char_radius,instance.char_speed,instance.char_color,instance.game_width,instance.game_height,instance.game_color);
    instance.point = new Point(instance.point_radius,instance.game_width, instance.game_height);
    instance.rays = [];
    instance.ray_max = instance.settings.get_setting('ray_max');
    //this.scoreboard = new Scoreboard();
  }

  this.draw = function(){
    this.backdrop.draw(this.context);
    this.pacman.draw(this.context);
    for(var i = 0; i < this.rays.length; i++){
      this.rays[i].draw(this.context);
    }
    this.point.draw(this.context);
  }

  this.start = function(){
    console.log('In Game start function');
    instance.settings.create_table();
    instance.init_settings();
    instance.draw();
    document.addEventListener('keydown', instance.handle_input)
    document.getElementById('restart').addEventListener('click', instance.start);
  }

  this.got_it = function(){
    if(Math.pow(this.pacman.xy[0] - this.point.xy[0], 2) + Math.pow(this.pacman.xy[1] - this.point.xy[1], 2) <= (this.point_radius+5)*(this.point_radius+5))
      return true;
    return false;
  }

  this.got_hit = function(){
    for(var i = 0; i < this.rays.length; i++){
      if (this.rays[i].xy[0] > this.rays[i].end_xy[0] || this.rays[i].xy[1] > this.rays[i].end_xy[1]){
        start_xy = this.rays[i].end_xy;
        end_xy = this.rays[i].xy;
      }
      else{
        start_xy = this.rays[i].xy;
        end_xy = this.rays[i].end_xy;
      }
      if(this.rays[i].direction == 37 || this.rays[i].direction == 39){
        perp_point = [this.pacman.xy[0], start_xy[1]];
        if(perp_point[0] > start_xy[0] && perp_point[0] < end_xy[0]){
          if(Math.pow(perp_point[1] - this.pacman.xy[1],2) <= this.radius_squared)
            return true;
        }
        else{
          start_dist = Math.pow(perp_point[1] - this.pacman.xy[1],2)+Math.pow(perp_point[0] - start_xy[0],2);
          end_dist   = Math.pow(perp_point[1] - this.pacman.xy[1],2)+Math.pow(perp_point[0] - end_xy[0],2);
          if(start_dist <= this.radius_squared || end_dist <= this.radius_squared)
            return true;
        }
      }
      else if(this.rays[i].direction == 38 || this.rays[i].direction == 40){
        perp_point = [start_xy[0], this.pacman.xy[1]];
        if(perp_point[1] > start_xy[1] && perp_point[1] < end_xy[1]){
          if(Math.pow(perp_point[0] - this.pacman.xy[0],2) <= this.radius_squared)
            return true;
        }
        else{
          start_dist = Math.pow(perp_point[0] - this.pacman.xy[0],2)+Math.pow(perp_point[1] - start_xy[1],2);
          end_dist   = Math.pow(perp_point[0] - this.pacman.xy[0],2)+Math.pow(perp_point[1] - end_xy[1],2);
          if(start_dist <= this.radius_squared || end_dist <= this.radius_squared)
            return true;
        }
      }
    }
    return false;
  }

  this.reset = function(){
    for(var i = 0; i < this.rays.length; i++){
      this.rays[i].wrap_it();
    }
    this.pacman = new Pacman(this.backdrop.w/2,this.backdrop.h/2,this.char_radius,this.char_speed,this.char_color,this.game_width,this.game_height,this.game_color);
  }

  this.handle_input = function(event){
    code = parseInt(event.keycode || event.which);
    if((code <= 40 && code >= 37) || (code == 32)){
      if(code != 32) instance.pacman.move(code);
      else instance.pacman.animate();
      for(var i = 0; i < instance.rays.length; i++){
        instance.rays[i].move();
      }
      if(instance.got_it()){
        if(instance.rays.length < instance.ray_max)
          instance.rays.push(new Ray(instance.pacman.xy[0],instance.pacman.xy[1],instance.pacman.direction,instance.backdrop.w,instance.backdrop.h,instance.ray_speed_range,instance.ray_length));
        instance.point = new Point(instance.point_radius,instance.backdrop.w, instance.backdrop.h);
      }
      if(instance.got_hit()){
        if(instance.char_lives > 0) instance.char_lives--;
        else{ alert('GAME OVER'); instance.init_settings();}
        instance.reset();
      }
      instance.draw();
    }
  }
}

