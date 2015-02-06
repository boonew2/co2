Pacman = function(x,y,r,color,bgcolor){
  this.cur_xy   = [x,y];
  this.old_xy   = [x,y];
  this.radius   = r;
  this.color    = color;
  this.speed    = 5;
  this.bgcolor  = bgcolor;
  /* 37 = LEFT
     38 = UP
     39 = RIGHT
     40 = DOWN */
  this.dpad_map = {37: [this.speed * -1, 0],
                   38: [0, this.speed*-1],
                   39: [this.speed, 0],
                   40: [0, this.speed]};
  this.direction = 39;
  this.phase = 5;
  this.mod_map = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2]

  this.draw = function(ctx){
    /* Clear where the circle was! i add one to the radius because I was left
       with a slight outline otherwise... */
    ctx.beginPath();
    ctx.arc(this.old_xy[0],this.old_xy[1],this.radius+15,0,2*Math.PI);
    ctx.fillStyle = this.bgcolor;
    ctx.fill();

    /* Draw base circle */
    ctx.beginPath();
    ctx.arc(this.cur_xy[0],this.cur_xy[1],this.radius,0,2*Math.PI);
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
    ctx.moveTo(this.cur_xy[0], this.cur_xy[1]);
    ctx.lineTo(this.cur_xy[0] + triangle[0], this.cur_xy[1] + triangle[1]);
    ctx.lineTo(this.cur_xy[0] + triangle[2], this.cur_xy[1] + triangle[3]);
    ctx.fillStyle = this.bgcolor;
    ctx.fill();
  }

  this.move = function(keycode){
    this.old_xy = this.cur_xy;
    this.cur_xy = [this.cur_xy[0] + this.dpad_map[keycode][0], this.cur_xy[1] + this.dpad_map[code][1]];
    this.direction = keycode;
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

game = function(){
  var game_width  = 800;
  var game_height = 600;
  var game_color  = 'black';
  var char_radius = 20;
  var char_color  = 'yellow';

  this.c = document.getElementById('backdrop');
  this.c.height = game_height;
  this.c.width  = game_width;
  this.context = this.c.getContext('2d');
  this.backdrop = new Rectangle(0,0,game_width,game_height,game_color);
  this.pacman = new Pacman(this.backdrop.w/2,this.backdrop.h/2,char_radius,char_color, game_color);
  this.backdrop.draw(this.context);
  this.pacman.draw(this.context);
  this.scoreboard = new Scoreboard();

  $(document).keydown(function(event){
    code = parseInt(event.keycode || event.which);
    if(code <= 40 && code >= 37){
      this.pacman.move(code);
      //this.backdrop.draw(this.context);
      this.pacman.draw(this.context);
    }
	//$('#msg-keypress').html('keypress() is triggered!, keyCode = ' 
        //      + event.keyCode + ' which = ' + event.which)
  });
}
