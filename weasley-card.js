class WeasleyClockCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    this.zones = [];
    this.targetstate = [];
  
    if (this.lastframe && this.lastframe != 0){
      cancelAnimationFrame(this.lastframe);
      this.lastframe = 0;
    }

    var num;
    if (this.config.locations){
      for (num = 0; num < this.config.locations.length; num++){
        if (this.zones.indexOf(this.config.locations[num]) == -1){
          this.zones.push(this.config.locations[num]);
        }
      }
    }
    for (num = 0; num < this.config.wizards.length; num++){
      
      const state = this._hass.states[this.config.wizards[num].entity];
      var stateStr = state && state.state != "off" ? 
        (state.attributes ? 
          (state.attributes.message ? state.attributes.message : state.state) 
          : state.state
        )
        :  "not_home";
      if (this._hass.states["zone." + stateStr])
      {
        stateStr = this._hass.states["zone." + stateStr].attributes.friendly_name;
      }    
      if (this.zones.indexOf(stateStr) == -1 && stateStr != "not_home" && stateStr != "Travelling") {
        this.zones.push(stateStr);
      }
    }
    this.zones.push("Travelling");
    this.zones.push("Lost");
    if (!this.canvas) {
      const card = document.createElement('ha-card');
      //card.header = 'Wizard Clock';
      var fontstyle = document.createElement('style');
      if (this.config.fontface){
        fontstyle.innerText = "@font-face { " + this.config.fontface + " }  ";
      } else {
        // my default
        fontstyle.innerText = "@font-face {    font-family: itcblkad_font;    src: local(itcblkad_font), url('/local/ITCBLKAD.TTF') format('opentype');}  ";
      }
      document.body.appendChild(fontstyle);

      this.canvas = document.createElement('canvas');
      card.appendChild(this.canvas);
      this.appendChild(card);
      this.ctx = this.canvas.getContext("2d");
    }

    this.canvas.style.maxWidth = "-webkit-fill-available";
    this.canvas.style.maxHeight = "-webkit-fill-available";
    //this.canvas.style.width = "500";
    //this.canvas.style.height = "500";
    this.canvas.width="500";
    this.canvas.height="500";

    this.radius = this.canvas.height / 2;
    this.ctx.translate(this.radius, this.radius);
    this.radius = this.radius * 0.90

    if (this.config.fontName) {
      this.selectedFont = this.config.fontName;
    } else { 
      this.selectedFont = "itcblkad_font";
    }
    this.fontScale = 1.1;

    var obj = this;
    this.lastframe = requestAnimationFrame(function(){ 
      obj.drawClock(); 
    });
  }

  setConfig(config) {
    if (!config.wizards) {
      throw new Error('You need to define some wizards');
    }
    // if (!config.locations) {
    //   throw new Error('You need to define some locations');
    // }
    this.config = config;
    this.currentstate = [];
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 6;
  }

  drawClock() {
      this.lastframe = 0;
      this.ctx.clearRect(-this.canvas.width/2, -this.canvas.height/2, this.canvas.width/2, this.canvas.height/2)
      this.drawFace(this.ctx, this.radius);
      this.drawNumbers(this.ctx, this.radius, this.zones);
      this.drawTime(this.ctx, this.radius, this.zones, this.config.wizards);
      this.drawHinge(this.ctx, this.radius);
      // request next frame if required
      var redraw = false;
      var num;
      for (num = 0; num < this.currentstate.length; num++){
        if (Math.round(this.currentstate[num].pos*100) != Math.round(this.targetstate[num].pos*100))
        {
          redraw = true;
        }
      }

      if (redraw){
        var obj = this;
        this.lastframe = requestAnimationFrame(function(){ 
          obj.drawClock(); 
        });
      }
  }

  drawFace(ctx, radius) {
    ctx.shadowColor = null;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2*Math.PI);
    ctx.fillStyle = '#f2e6d9';
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.lineWidth = radius*0.06;
    ctx.stroke();
  }

  drawHinge(ctx, radius) {
    ctx.beginPath();
    ctx.arc(0, 0, radius*0.05, 0, 2*Math.PI);
    ctx.fillStyle = '#333';
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
  }

  drawNumbers(ctx, radius, locations) {
      /* 
        Look at integrating this code to draw the text on a curve rather than just straight text at an angle:
        http://jsfiddle.net/hyyvpp8g/179/
      */
      var ang;
      var num;
      ctx.font = radius*0.15*this.fontScale + "px " + this.selectedFont;
      ctx.textBaseline="middle";
      ctx.textAlign="center";
      for(num= 0; num < locations.length; num++){
          ang = num * Math.PI / locations.length * 2;
          ctx.rotate(ang);
          ctx.translate(0, -radius*0.80);
          if (ang > Math.PI / 2 && ang < ((Math.PI * 2) - (Math.PI / 2))) 
              ctx.rotate(Math.PI);
          //ctx.rotate(-ang); 
          ctx.fillText(locations[num], 0, 0);
          if (ang > Math.PI / 2 && ang < ((Math.PI * 2) - (Math.PI / 2))) 
              ctx.rotate(-Math.PI);
          //ctx.rotate(ang);
          ctx.translate(0, radius*0.80);
          ctx.rotate(-ang);
      }
  }

  drawTime(ctx, radius, locations, wizards){
      this.targetstate = [];
      var num;
      for (num = 0; num < wizards.length; num++){
        const state = this._hass.states[wizards[num].entity];
        const stateStr = state && state.state != "off" ? 
          (state.attributes ? 
            (state.attributes.message ? state.attributes.message : state.state) 
            : state.state
          )
          :  "Lost";
        const stateVelo = state && state.attributes ? (state.attributes.velocity ? state.attributes.velocity : 0) : 0; 
        var locnum;
        var wizardOffset = ((num-((wizards.length-1)/2)) / wizards.length * 0.6);
        var location = wizardOffset; // default
        for (locnum = 0; locnum < locations.length; locnum++){
          if ((locations[locnum].toLowerCase() == stateStr.toLowerCase()) 
              || (locations[locnum] == "Travelling" && stateVelo > 15)
              || (locations[locnum] == "Lost" && stateStr == "not_home" && stateVelo <= 15))
          {
            location = locnum + wizardOffset;
            break;
          }
        }
        //var location = locations.indexOf(wizards[num].location) + ((num-((wizards.length-1)/2)) / wizards.length * 0.75);
        location = location * Math.PI / locations.length * 2;
        // set targetstate
        this.targetstate.push({pos: location, length: radius*0.7, width: radius*0.1, wizard: wizards[num].name});
      }
      // update currentstate from targetstate
      if (!this.currentstate)
      {
        this.currentstate = [];
      }
      for (num = 0; num < wizards.length; num++){
        if (this.currentstate[num]){
          this.currentstate[num].pos = this.currentstate[num].pos + ((this.targetstate[num].pos - this.currentstate[num].pos) / 60); 
        } else {
          // default to 12 o'clock to start
          this.currentstate.push({pos: 0, length: this.targetstate[num].length, width: this.targetstate[num].width, wizard: this.targetstate[num].wizard});
        }
      }
      // draw currentstate
      for (num = 0; num < wizards.length; num++){
        this.drawHand(ctx, this.currentstate[num].pos, this.currentstate[num].length, this.currentstate[num].width, this.currentstate[num].wizard);
      }
  }

  drawHand(ctx, pos, length, width, wizard) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.fillStyle = '#333';
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.moveTo(0,0);
    ctx.rotate(pos);
    ctx.quadraticCurveTo(width, -length*0.5, width, -length*0.75);
    ctx.quadraticCurveTo(width*0.2, -length*0.8, 0, -length);
    ctx.quadraticCurveTo(-width*0.2, -length*0.8, -width, -length*0.75);
    ctx.quadraticCurveTo(-width, -length*0.5, 0, 0);

    ctx.fill();

    ctx.font = width*this.fontScale + "px " + this.selectedFont;
    ctx.fillStyle = 'white';
    ctx.translate(0, -length/2);
    ctx.rotate(Math.PI/2)
    if (pos < Math.PI && pos >= 0) 
        ctx.rotate(Math.PI);
    ctx.fillText(wizard, 0, 0);
    if (pos < Math.PI && pos >= 0) 
        ctx.rotate(-Math.PI);
    ctx.rotate(-Math.PI/2);
    ctx.translate(0, length/2);
    
    ctx.rotate(-pos);
  }
}

customElements.define('weasley-card', WeasleyClockCard);
