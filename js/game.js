var Settings = function(id){
  this.settings_div = document.getElementById(id);
  this.settings = {'game_width'     : {'default': 800, 'min': 200, 'max': 1200},
                   'game_height'    : {'default': 600, 'min': 200, 'max': 1200},
                   'game_color'     : {'default': '#000000'},
                   'char_radius'    : {'default': 20, 'min': 10, 'max': 150},
                   'char_color'     : {'default': '#FFFF00'},
                   'char_speed'     : {'default': 5, 'min': 2, 'max': 30},
                   'char_lives'     : {'default': 3, 'min': 1, 'max': 10},
                   'ray_length'     : {'default': 200, 'min': 50, 'max': 400},
                   'ray_speed_min'  : {'default': 5, 'min': 1, 'max': 20},
                   'ray_speed_max'  : {'default': 8, 'min': 2, 'max': 30},
                   'ray_max'        : {'default': 50,'min': 10,'max': 100},
                   'point_radius'   : {'default': 5, 'min': 2, 'max': 100}};
}

Settings.prototype.get_setting = function(name){
    value = document.getElementById(name).value;
    if('min' in this.settings[name]){
      value = parseInt(value);
      if(value < this.settings[name]['min'] || value > this.settings[name]['max']){
        alert(name + ' should be between ' + this.settings[name]['min'] + ' and ' + this.settings[name]['max']);
        document.getElementById(name).value = this.settings[name]['default'];
        return this.settings[name]['default'];
      }
    }
    return value;
}

Settings.prototype.get_default = function(name){
    return this.settings[name]['default'];
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
        if('min' in this.settings[key]){
          input.setAttribute('type','range');
          input.setAttribute('min',this.settings[key]['min']);
          input.setAttribute('max',this.settings[key]['max']);
          input.setAttribute('value',this.settings[key]['default']);
        }
        else{
          input.setAttribute('type','color');
          input.value = this.settings[key]['default'];
        }
        input.setAttribute('id',key);
        value.appendChild(input);
        row.appendChild(setting);
        row.appendChild(value);
        table.appendChild(row);
      }
      var submit_row   = document.createElement('tr');
      var submit_cell  = document.createElement('td');
      var submit_input = document.createElement('input');
      submit_input.type = 'button';
      submit_input.id = 'restart';
      submit_input.value = 'Restart';
      submit_cell.colSpan = '2';
      submit_cell.appendChild(submit_input);
      submit_row.appendChild(submit_cell);
      table.appendChild(submit_row);
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

var ScoreBoard = function(scores_id){
  this.scores_div = document.getElementById(scores_id);
  this.top_scores = [];
}

ScoreBoard.prototype.set_cookie = function(){
  var d = new Date();
  d.setTime(d.getTime() + (7*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = "top_scores="+JSON.stringify(this.top_scores)+"; "+expires;
}

ScoreBoard.prototype.get_cookie = function(){
  var name = 'top_scores=';
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++){
    var c = ca[i];
    while(c.charAt(0) == ' ') c.substring(1);
      if(c.indexOf(name) == 0){
        return JSON.parse(c.substring(name.length,c.length));
      }
  }
  return [];
}

ScoreBoard.prototype.initiate_scores = function(){
  this.top_scores = this.get_cookie();
}

ScoreBoard.prototype.create_scores_table = function(){
  while(this.scores_div.childNodes.length > 0){
    this.scores_div.removeChild(this.scores_div.firstChild);
  }
  var table        = document.createElement('table');
  var header_row   = document.createElement('tr');
  var score_header = document.createElement('th');

  score_header.colSpan = '2';
  score_header.appendChild(document.createTextNode('Top Scores'));
  header_row.appendChild(score_header);
  table.appendChild(header_row);

  for(score in this.top_scores){
    var score_row   = document.createElement('tr');
    var score_cell  = document.createElement('td');
    var number_cell = document.createElement('td');
    index = parseInt(score)+1;
    number_cell.appendChild(document.createTextNode(index+'.)'));
    score_cell.appendChild(document.createTextNode(this.top_scores[score]));
    score_row.appendChild(number_cell);
    score_row.appendChild(score_cell);
    table.appendChild(score_row);
  }
  this.scores_div.appendChild(table);
}

ScoreBoard.prototype.submit_score = function(score){
  this.top_scores.push(score);
  this.top_scores.sort(function(a, b){return b-a});
  while(this.top_scores.length > 10){
    this.top_scores.pop();
  }
  this.set_cookie();
}

var StatsBoard = function(stats_id){
  this.stats_div  = document.getElementById(stats_id);
}

StatsBoard.prototype.create_stats_table = function(){
  var table       = document.createElement('table');
  var row         = document.createElement('tr');
  var score_title = document.createElement('th');
  var life_title  = document.createElement('th');
  var laser_title = document.createElement('th');
  var score_cell  = document.createElement('td');
  var life_cell   = document.createElement('td');
  var laser_cell  = document.createElement('td');
  var score_value = document.createElement('input');
  var life_value  = document.createElement('input');
  var laser_value = document.createElement('input');

  life_value.id   = this.stats_div.id+'_life_count';
  life_value.type = 'text';
  life_value.readOnly = true;
  life_value.value = '0';

  score_value.id   = this.stats_div.id+'_score_count';
  score_value.type = 'text';
  score_value.readOnly = true;
  score_value.value = '0';

  laser_value.id   = this.stats_div.id+'_laser_count';
  laser_value.type = 'text';
  laser_value.readOnly = true;
  laser_value.value = '0';

  score_title.appendChild(document.createTextNode('Score:'));
  life_title.appendChild(document.createTextNode('Lives:'));
  laser_title.appendChild(document.createTextNode('Lasers:'));

  score_cell.appendChild(score_value);
  life_cell.appendChild(life_value);
  laser_cell.appendChild(laser_value);
  
  row.appendChild(score_title);
  row.appendChild(score_cell);
  row.appendChild(life_title);
  row.appendChild(life_value);
  row.appendChild(laser_title);
  row.appendChild(laser_value);

  table.appendChild(row);
  this.stats_div.appendChild(table);
}

StatsBoard.prototype.set_life_count = function(life_count){
  document.getElementById(this.stats_div.id+'_life_count').value = life_count;
}

StatsBoard.prototype.set_laser_count = function(laser_count){
  document.getElementById(this.stats_div.id+'_laser_count').value = laser_count;
}

StatsBoard.prototype.set_score_count = function(score_count){
  document.getElementById(this.stats_div.id+'_score_count').value = score_count;
}

function get_random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Game = function(){
  console.log('Starting instance of Game');
  this.settings = new Settings('settings');
  this.statsboard = new StatsBoard('stats');
  this.scoreboard = new ScoreBoard('scores');
  this.settings.create_table();
  this.statsboard.create_stats_table();
  this.scoreboard.initiate_scores();
  this.scoreboard.create_scores_table();
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
    instance.score = 0;
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
    //instance.settings.create_table();
    //instance.scoreboard.create_stats_table();
    instance.init_settings();
    instance.statsboard.set_life_count(instance.char_lives);
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

  this.restart_game = function(){
    instance.scoreboard.submit_score(instance.score);
    instance.scoreboard.create_scores_table();
    instance.init_settings();
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
        if(instance.rays.length < instance.ray_max){
          instance.rays.push(new Ray(instance.pacman.xy[0],instance.pacman.xy[1],instance.pacman.direction,instance.backdrop.w,instance.backdrop.h,instance.ray_speed_range,instance.ray_length));
          instance.statsboard.set_laser_count(instance.rays.length);
        }
        instance.point = new Point(instance.point_radius,instance.backdrop.w, instance.backdrop.h);
        instance.score += 10;
        instance.statsboard.set_score_count(instance.score);
      }
      if(instance.got_hit()){
        if(instance.char_lives > 0){
          instance.char_lives--;
          instance.statsboard.set_life_count(instance.char_lives);
        }
        else{ 
          alert('GAME OVER'); 
          instance.restart_game();
        }
        instance.reset();
      }
      instance.draw();
    }
  }
}

