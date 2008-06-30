var graphics = {

  draw: function(x,y,width,height,radius,opacity){
    var ctx = this.getContext("2d");
  	var style; 
  	var os = radius/2;
  	
  	ctx.beginPath(); 
  	  ctx.rect(x+radius,y,width-(radius*2),y+os); 
  	ctx.closePath();
  	
  	style = this.addLinearStyle(ctx,x+radius,y+os,x+radius,y,opacity);
  	ctx.fillStyle = style; ctx.fill();
  	ctx.beginPath(); ctx.rect(x,y,radius,radius); ctx.closePath();
  	style = this.addRadialStyle(ctx,x+radius,y+radius,radius-os,x+radius,y+radius,radius,opacity);
  	ctx.fillStyle = style; ctx.fill();
  	ctx.beginPath(); ctx.rect(x,y+radius,os,height-(radius*2)); ctx.closePath();
  	style = this.addLinearStyle(ctx,x+os,y+radius,x,y+radius,opacity);
  	ctx.fillStyle = style; ctx.fill();
  	ctx.beginPath(); ctx.rect(x,y+height-radius,radius,radius); ctx.closePath();
  	style = this.addRadialStyle(ctx,x+radius,y+height-radius,radius-os,x+radius,y+height-radius,radius,opacity);
  	ctx.fillStyle = style; ctx.fill();
  	ctx.beginPath(); ctx.rect(x+radius,y+height-os,width-(radius*2),os); ctx.closePath();
  	style = this.addLinearStyle(ctx,x+radius,y+height-os,x+radius,y+height,opacity);
  	ctx.fillStyle = style; ctx.fill();
  	ctx.beginPath(); ctx.rect(x+width-radius,y+height-radius,radius,radius); ctx.closePath();
  	style = this.addRadialStyle(ctx,x+width-radius,y+height-radius,radius-os,x+width-radius,y+height-radius,radius,opacity);
  	ctx.fillStyle = style; ctx.fill();
  	ctx.beginPath(); ctx.rect(x+width-os,y+radius,os,height-(radius*2)); ctx.closePath();
  	style = this.addLinearStyle(ctx,x+width-os,y+radius,x+width,y+radius,opacity);
  	ctx.fillStyle = style; ctx.fill();
  	ctx.beginPath(); ctx.rect(x+width-radius,y,radius,radius); ctx.closePath();
  	style = this.addRadialStyle(ctx,x+width-radius,y+radius,radius-os,x+width-radius,y+radius,radius,opacity);
  	ctx.fillStyle = style; ctx.fill();
  },
  addRadialStyle: function(ctx,x1,y1,r1,x2,y2,r2,opacity) {
  	var tmp = ctx.createRadialGradient(x1,y1,r1,x2,y2,r2);
  	var opt = Math.min(parseFloat(opacity+0.1),1.0);
  	tmp.addColorStop(0,'rgba(0,0,0,'+opt+')');
  	tmp.addColorStop(0.25,'rgba(0,0,0,'+opacity+')');
  	tmp.addColorStop(1,'rgba(0,0,0,0)');
  	return tmp;
  },
  this.addLinearStyle: function() {}


}
