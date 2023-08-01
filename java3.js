var RENDERER = {
    JELLYFISH_RATE: 0.00015,
    DUST_RATE: 0.0005,
    ADJUST_DISTANCE : 100,
    ADJUST_OFFSET : 5,
    
    init : function(){
      this.setParameters();
      this.reconstructMethod();
      this.createElements();
      this.bindEvent();
      this.render();
    },
    setParameters : function(){
      this.$window = $(window);
      this.$container = $('#jsi-jellyfish-container');
      this.width = this.$container.width();
      this.height = this.$container.height();
      this.radius = Math.sqrt(Math.pow(this.width / 2, 2) + Math.sqrt(this.height/ 2, 2));
      this.distance = Math.sqrt(Math.pow(this.width, 2) + Math.sqrt(this.height, 2));
      this.canvas = $('<canvas />').attr({width : this.width, height : this.height}).appendTo(this.$container).get(0);
      this.context = this.canvas.getContext('2d');
      this.jellyfishes = [];
      this.theta = 0;
      this.x =  0;
      this.y =  0;
      this.destinationX = this.x;
      this.destinationY = this.y;
      this.dusts = [];
    },
    reconstructMethod : function(){
      this.render = this.render.bind(this);
    },
    getRandomValue : function(range){
      return range.min + (range.max - range.min) * Math.random();
    },
    createElements : function(){
      for(var i = 0, length = this.JELLYFISH_RATE * this.width * this.height; i < length; i++){
        this.jellyfishes.push(new JELLYFISH(this));
      }
      for(var i = 0, length = this.DUST_RATE * this.width * this.height; i < length; i++){
        this.dusts.push(new DUST(this));
      }
    },
    bindEvent : function(){
      this.$container.on('mousemove', this.translateCenter.bind(this, false));
      this.$container.on('mouseout', this.translateCenter.bind(this, true));
    },
    translateCenter : function(toAdjust, event){
      var offset = this.$container.offset();
      this.destinationX = event.clientX - offset.left + this.$window.scrollLeft();
      this.destinationY = event.clientY - offset.top + this.$window.scrollTop();
      
      if(!toAdjust){
        return;
      }
      if(this.destinationX < this.ADJUST_OFFSET){
        this.destinationX = 0;
      }else if(this.radius > this.width - this.ADJUST_OFFSET){
        this.destinationX = this.width;
      }
      if(this.destinationY < this.ADJUST_OFFSET){
        this.destinationY = 0;
      }else if(this.radius > this.height - this.ADJUST_OFFSET){
        this.destinationY = this.height;
      }
    },
    render : function(){
      requestAnimationFrame(this.render);
      
      if(this.destinationX > this.x){
        this.x = Math.min(this.x + this.ADJUST_DISTANCE, this.destinationX);
      }else{
        this.x = Math.max(this.x - this.ADJUST_DISTANCE, this.destinationX);
      }
      if(this.destinationY > this.y){
        this.y = Math.min(this.y + this.ADJUST_DISTANCE, this.destinationY);
      }else{
        this.y = Math.max(this.y - this.ADJUST_DISTANCE, this.destinationY);
      }
      var gradient = this.context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      gradient.addColorStop(0, 'hsl(195, 66%, 37%)');
      gradient.addColorStop(0.3, 'hsl(195, 66%, 12%)');
      gradient.addColorStop(1, 'hsl(0, 100%, 0%)');
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, this.width, this.height);
      
      for(var i = 0, length = this.dusts.length; i < length; i++){
        this.dusts[i].render(this.context, this.x, this.y);
      }
      for(var i = 0, length = this.jellyfishes.length; i < length; i++){
        this.jellyfishes[i].render(this.context, this.x, this.y);
      }
    }
  };
  var JELLYFISH = function(renderer){
    this.renderer = renderer;
    this.init(true);
  };
  JELLYFISH.prototype = {
    EXPANSION_RANGE : {min : Math.PI / 120, max : Math.PI / 30},
    DIRECTION_RANGE : {min : 0, max : Math.PI * 2},
    BASE_RANGE_X : {min : 10, max : 15},
    BASE_RANGE_Y : {min : 0, max : 5},
    BASE_RANGE_CP_X : {min : 20, max : 50},
    BASE_RANGE_CP_Y : {min : -40, max : -20},
    EXPANTION_OFFSET_RANGE : {min : 0.2, max : 0.5},
    EXTENSION_RATE_RANGE : {min : 0.5, max : 1.5},
    FEELER_LENGTH_RANGE : {min : 15, max : 30},
    FEELER_WIDTH_RANGE : {min : 2, max : 4},
    ACCELERATION_RATE : 0.2,
    OFFSET_TO_JUDGE : 100,
    FRICTION : 0.96,
    EXTENSION_COUNT : 100,
    
    init : function(toInit){
      this.radius = this.renderer.radius + this.OFFSET_TO_JUDGE * 2;
      
      if(toInit){
        this.x = this.renderer.getRandomValue({min : -this.OFFSET_TO_JUDGE, max : this.renderer.width + this.OFFSET_TO_JUDGE});
        this.y = this.renderer.getRandomValue({min : -this.OFFSET_TO_JUDGE, max : this.renderer.height + this.OFFSET_TO_JUDGE});
        this.direction = this.renderer.getRandomValue(this.DIRECTION_RANGE);
      }else{
        switch(condition = Math.random() * 4 | 0){
        case 0:
          this.x = -this.OFFSET_TO_JUDGE;
          this.y = this.renderer.getRandomValue({min : 0, max : this.renderer.height});
          this.direction = this.renderer.getRandomValue({min : Math.PI / 4, max : Math.PI * 3 / 4});
          break;
        case 1:
          this.x = this.renderer.getRandomValue({min : 0, max : this.renderer.width});
          this.y = -this.OFFSET_TO_JUDGE;
          this.direction = this.renderer.getRandomValue({min : Math.PI * 3 / 4, max : Math.PI * 5 / 4});
          break;
        case 2:
          this.x = this.renderer.width + this.OFFSET_TO_JUDGE;
          this.y = this.renderer.getRandomValue({min : 0, max : this.renderer.height});
          this.direction = this.renderer.getRandomValue({min : Math.PI * 5 / 4, max : Math.PI * 7 / 4});
          break;
        case 3:
          this.x = this.renderer.getRandomValue({min : 0, max : this.renderer.width});
          this.y = this.renderer.height + this.OFFSET_TO_JUDGE;
          this.direction = this.renderer.getRandomValue({min : Math.PI * 3 / 4, max : Math.PI * 5 / 4});
        }
      }
      this.expansion = 0;
      this.expansionDelta = this.renderer.getRandomValue(this.EXPANSION_RANGE);
      this.vx = 0;
      this.vy = 0;
      this.ax = Math.sin(this.direction) * this.expansionDelta * this.ACCELERATION_RATE;
      this.ay = -Math.cos(this.direction) * this.expansionDelta * this.ACCELERATION_RATE;
      this.baseX = this.renderer.getRandomValue(this.BASE_RANGE_X);
      this.baseY = this.renderer.getRandomValue(this.BASE_RANGE_Y);
      this.baseCPX = this.renderer.getRandomValue(this.BASE_RANGE_CP_X);
      this.baseCPY = this.renderer.getRandomValue(this.BASE_RANGE_CP_Y);
      this.expansionOffset = this.renderer.getRandomValue(this.EXPANTION_OFFSET_RANGE);
      this.feelerLength = this.renderer.getRandomValue(this.FEELER_LENGTH_RANGE);
      this.feelerWidth = this.renderer.getRandomValue(this.FEELER_WIDTH_RANGE);
      this.extensionRate = this.renderer.getRandomValue(this.EXTENSION_RATE_RANGE);
      this.theta = 0;
    },
    render : function(context, x, y){
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.direction);
      
      var opacity = 0.1 + 0.9 * Math.pow(1 - Math.min(1, Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)) / this.renderer.distance), 2),
        feelerColor = 'hsla(240, 80%, 80%, ' + 0.5 * opacity + ')',
        patternColor = 'hsla(240, 80%, 80%, ' + 0.8 * opacity + ')',
        gradient = context.createRadialGradient(0, this.baseCPY, 0, 0, this.baseCPY, this.baseY - this.baseCPY);
        
      gradient.addColorStop(0, 'hsla(245, 100%, 100%, ' + opacity + ')');
      gradient.addColorStop(0.5, 'hsla(245, 100%, 80%, ' + 0.6 * opacity + ')');
      gradient.addColorStop(1, 'hsla(245, 100%, 60%, ' + 0.4 * opacity + ')');
      
      context.fillStyle = gradient;
      context.strokeStyle = patternColor;
      context.lineWidth = 2;
      
      var baseX = this.baseX * (1 + this.expansionOffset * Math.cos(this.expansion)),
        theta = Math.PI / 2 - Math.abs((Math.PI - this.expansion)) / 2;
      
      context.save();
      this.createHead(context, baseX);
      context.restore();
      
      this.createMainPattern(context, baseX);
      this.createSubPattern(context, 0, this.baseCPY * 0.45, 0);
      this.createSubPattern(context, -7, this.baseCPY * 0.4, -theta);
      this.createSubPattern(context, 7, this.baseCPY * 0.4, theta);
      this.createFeeler(context, feelerColor);
      context.restore();
      
      if(this.expansion >= Math.PI - this.expansionDelta && this.expansion <= Math.PI){
        this.expansion += this.expansionDelta / this.EXTENSION_COUNT;
      }else{
        this.expansion += this.expansionDelta;
      }
      this.expansion %= Math.PI * 2;
      this.x += this.vx;
      this.y += this.vy;
      
      if(this.expansion >= 0 && this.expansion <= Math.PI){
        this.vx += this.ax;
        this.vy += this.ay;
      }
      this.vx *= this.FRICTION;
      this.vy *= this.FRICTION;
      
      this.judgeToReset();
    },
    createHead : function(context, baseX){
      context.beginPath();
      context.moveTo(-baseX, this.baseY);
      context.bezierCurveTo(-this.baseCPX, this.baseCPY, this.baseCPX, this.baseCPY, baseX, this.baseY);
      context.closePath();
      context.fill();
    },
    createMainPattern : function(context, baseX){
      context.beginPath();
      context.moveTo(-baseX * 0.6, this.baseY);
      context.bezierCurveTo(-this.baseCPX * 0.8, this.baseCPY * 0.5, this.baseCPX * 0.8, this.baseCPY * 0.5, baseX * 0.6, this.baseY);
      context.stroke();
    },
    createSubPattern : function(context, translateX, translateY, rotate){
      context.save();
      context.beginPath();
      context.translate(translateX, translateY);
      context.rotate(rotate);
      context.scale(1, 0.5);
      context.arc(0, 0, 4, 0, Math.PI * 2, false);
      context.stroke();
      context.restore();
    },
    createFeeler : function(context, feelerColor){
      for(var i = -3; i <= 3; i++){
        context.save();
        context.beginPath();
        context.strokeStyle = feelerColor;
        context.translate(i * 2, this.baseY);
        context.moveTo(0, 0);
        
        var x, cy;
        
        if(this.expansion >= 0 && this.expansion <= Math.PI){
          cy = (Math.PI - this.expansion) / Math.PI;
          x = i * this.feelerWidth * cy;
        }else{
          cy = (this.expansion - Math.PI) / Math.PI;
          x = i * this.feelerWidth * cy;
        }
        var rate = (cy > 0.5) ? (1 - cy) : cy;
        context.bezierCurveTo(x * this.extensionRate, this.feelerLength * rate, x * this.extensionRate, this.feelerLength * (1 - rate), x, this.feelerLength);
        context.stroke();
        context.restore();
      }
    },
    judgeToReset : function(){
      if(this.x < -this.OFFSET_TO_JUDGE && this.vx < 0 || this.x > this.renderer.width + this.OFFSET_TO_JUDGE && this.vx > 0
        || this.y < -this.OFFSET_TO_JUDGE && this.vy < 0 || this.y > this.renderer.height + this.OFFSET_TO_JUDGE && this.vy > 0){
        this.init(false);
      }
    }
  };
  var DUST = function(renderer){
    this.renderer = renderer;
    this.init();
  };
  DUST.prototype = {
    RADIUS : 5,
    VELOCITY : 0.1,
    
    init : function(){
      var phi = this.renderer.getRandomValue({min : 0, max : Math.PI * 2});
      this.x = this.renderer.getRandomValue({min : 0, max : this.renderer.width});
      this.y = this.renderer.getRandomValue({min : 0, max : this.renderer.height});
      this.vx = this.VELOCITY * Math.sin(phi);
      this.vy = this.VELOCITY * Math.cos(phi);
      this.opacity = 0;
      this.theta = 0;
      this.deltaTheta = this.renderer.getRandomValue({min : Math.PI / 500, max : Math.PI / 100});
      this.gradient = this.renderer.context.createRadialGradient(0, 0, 0, 0, 0, this.RADIUS);
      this.gradient.addColorStop(0, 'hsla(2, 80%, 100%, 1)');
      this.gradient.addColorStop(0.1, 'hsla(22, 80%, 80%, 1)');
      this.gradient.addColorStop(0.25, 'hsla(220, 80%, 50%, 1)');
      this.gradient.addColorStop(1, 'hsla(220, 80%, 30%, 0)');
    },
    render : function(context, x, y){
      context.save();
      context.translate(this.x, this.y);
      context.globalAlpha = Math.abs(Math.sin(this.theta)) * (0.2 + 0.8 * Math.pow(Math.min(1, Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)) / this.renderer.distance), 2));
      context.fillStyle = this.gradient;
      context.beginPath();
      context.arc(0, 0, this.RADIUS, 0, Math.PI * 2, false);
      context.fill();
      context.restore();
      this.x += this.vx;
      this.y += this.vy;
      this.theta += this.deltaTheta;
      this.theta %= Math.PI * 2;
      
      if(this.x < -this.RADIUS || this.x > this.renderer.width + this.RADIUS
        || this.y < -this.RADIUS || this.y > this.renderer.height + this.RADIUS){
        this.init();
      }
    }
  };
  $(function(){
    RENDERER.init();
  });