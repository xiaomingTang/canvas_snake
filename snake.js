window.onload=function(){
 	"use strict";
	function $(id){
		return document.getElementById(id);
	}
	//数组赋值时解绑(由指针传递变为值传递)
 	function unbind(arr){
		return [arr[0],arr[1]];
	}
 	function Map(){
		this.width=50;
		this.height=40;
		this.available={};	//可用点, 不含蛇头蛇身, 一维对象
		this.head=[];		//蛇头, 一维数组
		this.body=[];		//蛇体, 二维数组
		this.food=[];		//食物, 一维数组
		this.ctx= $("snake").getContext ? $("snake").getContext("2d") : null;		//作图上下文
	}
	Map.prototype={
		constructor: Map,
		init: function(){
			this.ctx.clearRect(0,0,500,500);
			//构建地图
			for(var i=0,leni=this.width;i<leni;i++){
				for(var j=0,lenj=this.height;j<lenj;j++){
					this.available[i+"_"+j]=1;
				}
			}
			//随机蛇头
			this.head[0]=Math.floor(Math.random()*this.width);
			this.head[1]=Math.floor(Math.random()*this.height);
			delete this.available[this.head[0]+"_"+this.head[1]];
			//随机食物
			this.randFood();
			//渲染地图,蛇头,食物
			this.renderMap();
			this.renderHead();
			this.renderFood();
			
		},
		randFood(){
			var keys=Object.keys(this.available),
				len=keys.length;
			if(len>0){
				var n=Math.floor(Math.random()*len),
					key=keys[n],
					pos=key.split("_");
				this.food[0]=parseInt(pos[0]);
				this.food[1]=parseInt(pos[1]);
				delete this.available[key];
			}
			else{
				alert("没地方放食物了!就算你赢了吧...");
			}
			return this;
		},
		clear: function(arr){
			var x=arr[0],y=arr[1];
			this.ctx.clearRect(10*x,10*y,10,10);
			this.render(x,y,"#666");
		},
		render: function(x,y,color){
			this.ctx.fillStyle=color;
			this.ctx.strokeStyle= "#ddd";
			this.ctx.fillRect(10*x,10*y,10,10);
			this.ctx.strokeRect(10*x,10*y,10,10);
		},
		renderMap: function(){
			for(var i=0,leni=this.height;i<leni;i++){
				for(var j=0,lenj=this.width;j<lenj;j++){
					this.render(j,i,"#666");
				}
			}
		},
		renderHead: function(){
			this.render(this.head[0],this.head[1],"red");
		},
		renderBody: function(){
			for(var i=0,len=this.body.length;i<len;i++){
				this.render(this.body[i][0],this.body[i][1],"pink");
			}
		},
		renderFood: function(){
			this.render(this.food[0],this.food[1],"blue");
		},
		//param n: 37--left  38--top  39--right  40--bottom ;
		move: function(n){
			var preHead=unbind(this.head),
				nextHead=unbind(this.head);
			switch(n){
				case 37:
					nextHead[0]--;
					break;
				case 39:
					nextHead[0]++;
					break;
				case 38:
					nextHead[1]--;
					break;
				case 40:
					nextHead[1]++;
					break;
				default:
					return this;
			}
			this.head=unbind(nextHead);
			
			if( !(nextHead[0]+"_"+nextHead[1] in this.available) && (nextHead.toString() != this.food.toString())){
				clearInterval(loop);
				loop=undefined;
				dir=0;
				alert("胜败乃兵家常事 大侠请重新来过");
				this.ctx.clearRect(0,0,500,500);
				map=new Map();
				map.init();
				return this;
			}
			delete this.available[nextHead[0]+"_"+nextHead[1]];
			this.clear(preHead);
			for(var i=0,len=this.body.length;i<len;i++){
				this.clear(this.body[i]);
			}
			this.body.unshift(preHead);
			if(this.head.toString() != this.food.toString()){
				var tail=this.body.pop();
				this.available[tail[0]+"_"+tail[1]]=1;
			}
			else{
				this.randFood();
				this.renderFood();
			}
			this.renderBody();
			this.renderHead();
		},
		
		isHeadAgainst: function(){
			return (this.head[0]<0 || this.head[0]==this.width || this.head[1]<0 ||this.head[1]==this.height );
		}
		
	}
 	
	var map=new Map(),
		dir=0,
		loop=undefined,
		lastPos=[];
 	if(!map.ctx){
		alert("你的浏览器不支持canvas,所以你看不到这个页面,请升级浏览器至最新版本,并:该页面即将关闭!");
		window.close();
	}
	
	map.init();
	
	//键盘事件绑定
	document.onkeydown=function(e){
		var event=e || window.event;
		if(event.keyCode-dir==2 || event.keyCode-dir==-2){
			return false;
		}
		dir=event.keyCode;
		if(typeof loop === "undefined" && (dir.toString() in {"37":0,"38":0,"39":0,"40":0})){
			loop=setInterval(function(){
				map.move(dir);
			},200);
		}
	}
	//触摸事件绑定
	function handleTouchEvent(event){
		if(event.touches.length==1){
			switch(event.type){
				case "touchstart":
					lastPos=[event.touches[0].screenX,event.touches[0].screenY];
					break;
				case "touchmove":
					event.preventDefault();
					var dx= event.touches[0].screenX-lastPos[0],
						dy= event.touches[0].screenY-lastPos[1],
						m=dx>0 ? 1 : -1 ,
						n=dy>0 ? 1 : -1 ,
						_dir=Math.abs(dx)-Math.abs(dy)>0 ? 38+m : 39+n ;
					if(_dir-dir==2 || _dir-dir==-2){
						return false;
					}
					dir=_dir;
					if(typeof loop === "undefined" && (dir.toString() in {"37":0,"38":0,"39":0,"40":0})){
						loop=setInterval(function(){
							map.move(dir);
						},200);
					}
					lastPos=[event.touches[0].screenX,event.touches[0].screenY];
					break;
				default:
					break;
			}
			
		}
	}
	
	document.ontouchstart=handleTouchEvent;
	document.ontouchmove=handleTouchEvent;
	
}
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
