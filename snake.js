window.onload=function(){
 	"use strict";
	!(function(){
	
	function $(id){
		return document.getElementById(id);
	}
	//数组赋值时解绑(由指针传递变为值传递)
 	function unbind(arr){
		return [arr[0],arr[1]];
	}
	
	
	//	取得屏幕的宽高并赋给canvas
	var sx = document.documentElement.clientWidth || document.body.clientWidth;
	var	sy = document.documentElement.clientHeight || document.body.clientHeight;
	var canvas = $("snake");
	var w = sx > 0 ? sx > sy ? sy * 0.8 : sx * 0.8 : canvas.width;
	canvas.width = canvas.height = w;
	canvas.style.marginTop = w * 0.1 + "px";
	
	var cellWidth = parseInt($("cell-width").value);
	var speed = parseInt($("speed").value);
	//	config作为全局变量，因为输了之后的重新初始化需要用到
	var config = {
		canvas: canvas,
		width: w,
		height: w,
		cellWidth: cellWidth,
		speed: speed
	};
	var dir = 0;
	var loop = undefined;
	
	function deployMap(instanceOfMap, config){
		instanceOfMap.cellWidth = config.cellWidth;
		instanceOfMap.speed = config.speed;
		instanceOfMap.width = config.width;
		instanceOfMap.height = config.height;
		instanceOfMap.num = Math.floor(instanceOfMap.width / instanceOfMap.cellWidth);
		
		instanceOfMap.available={};	//可用点, 不含蛇头蛇身, 一维对象
		instanceOfMap.head=[];		//蛇头, 一维数组
		instanceOfMap.body=[];		//蛇体, 二维数组
		instanceOfMap.food=[];		//食物, 一维数组
		
		loop = undefined;
		dir = 0;
	}
	
	
 	function Map(config){
		this.ctx = config.canvas.getContext ? config.canvas.getContext("2d") : null;
		
		deployMap(this, config);
	}
	Map.prototype={
		constructor: Map,
		init: function(){
			this.ctx.clearRect(0,0,this.width,this.height);
			//构建地图
			for(var i=0,leni=this.num;i<leni;i++){
				for(var j=0,lenj=this.num;j<lenj;j++){
					this.available[i+"_"+j]=1;
				}
			}
			//随机蛇头
			this.head[0]=Math.floor(Math.random()*this.num);
			this.head[1]=Math.floor(Math.random()*this.num);
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
			this.ctx.clearRect(x * this.cellWidth, y * this.cellWidth, this.cellWidth, this.cellWidth);
			this.render(x,y,"#666");	//	background，清除的时候和背景色不同，可以显示轨迹，意外之喜哦。。。
		},
		render: function(x,y,color){
			this.ctx.fillStyle=color;
			this.ctx.strokeStyle= "#5d5d5d";	//	border
			this.ctx.fillRect(x * this.cellWidth, y * this.cellWidth, this.cellWidth, this.cellWidth);
			this.ctx.strokeRect(x * this.cellWidth, y * this.cellWidth, this.cellWidth, this.cellWidth);
		},
		renderMap: function(){
			for(var i=0,leni=this.num;i<leni;i++){
				for(var j=0,lenj=this.num;j<lenj;j++){
					this.render(j,i,"#636363");	//	background
				}
			}
		},
		renderHead: function(){
			this.render(this.head[0],this.head[1],"#c34");	//	head
		},
		renderBody: function(){
			for(var i=0,len=this.body.length;i<len;i++){
				this.render(this.body[i][0],this.body[i][1],"#cab");	//	body
			}
		},
		renderFood: function(){
			this.render(this.food[0],this.food[1],"#78c");	//	food
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
			if( !(nextHead[0]+"_"+nextHead[1] in this.available) && (nextHead.toString() != this.food.toString())){
				clearInterval(loop);
				loop=undefined;
				dir=0;
				alert("胜败乃兵家常事 大侠请重新来过");
				this.ctx.clearRect(0, 0, this.width, this.height);
				map=new Map(config);
				map.init();
				return this;
			}
			this.head=unbind(nextHead);
			delete this.available[nextHead[0]+"_"+nextHead[1]];
			this.clear(preHead);
			for(var i=0,len=this.body.length;i<len;i++){
				this.clear(this.body[i]);
			}
			this.body.unshift(preHead);
			if(this.head.toString() != this.food.toString()){
				var tail=this.body.pop();
				this.available[tail[0]+"_"+tail[1]]=1;
			} else {
				delete this.available[preHead[0]+"_"+preHead[1]];
				this.randFood();
				this.renderFood();
			}
			this.renderBody();
			this.renderHead();
		},
		
		isHeadAgainst: function(){
			return (this.head[0]<0 || this.head[0]==this.num || this.head[1]<0 ||this.head[1]==this.num );
		}
		
	}

	var map = new Map(config);
	if(!$("snake").getContext){
		alert("your browser don't support canvas, so you can't see the snake !");
	}
		
	map.init();
	
	console.log("GUIDE: Arrow key for control ** Space key for pause ** there is setting bar at top left ** ok, wish you have a nice trip with my snake ! (IE and SF isn't supported and I don't know why...)");
	
	var interval = 1000 / map.speed;
	//	键盘事件绑定
	document.onkeydown=function(e){
		var event = e || window.event;
		var temp = event.keyCode;
		if(temp-dir==2 || temp-dir==-2){
			return false;
		} else if(temp === 32 || (temp.toString() in {"37":0,"38":0,"39":0,"40":0})){
			dir=temp;
		}
		if(typeof loop === "undefined" && (dir.toString() in {"37":0,"38":0,"39":0,"40":0})){
			loop=setInterval(function(){
				if(interval-- < 0){
					interval = 1000 / map.speed;
					map.move(dir);
				}
			},1);
		}
	}
	
	
	//	修改参数事件处理程序
	function onchangeHandler(event){
		var e = myjs.getEvent(event);
		var t = myjs.getTarget(e);
		switch(t.id){
			case "speed":
				t.blur();
				config.speed = parseInt(t.value);
				deployMap(map,config);
				break;
			case "cell-width":
				t.blur();
				config.cellWidth = parseInt(t.value);
				deployMap(map,config);
				map.init();
				
				break;
			default:
				break;
		}
	}
	$("snake-setting").onchange = onchangeHandler;
	
	
	//	触摸事件及绑定
	var lastPos = [];
	var interval = 1000 / map.speed;
	function handleTouchEvent(event){
		if(event.touches.length==1){
			switch(event.type){
				case "touchstart":
					lastPos=[event.touches[0].screenX,event.touches[0].screenY];
					break;
				case "touchmove":
					if(event.target.className && event.target.className.indexOf("setting-bar")){
						return false;
					}
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
							if(interval-- < 0){
								interval = 1000 / map.speed;
								map.move(dir);
							}
						},1);
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
	
	})();
	
}
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
 	
