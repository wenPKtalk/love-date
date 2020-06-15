var canvas_rain=document.getElementById('canvas_rain');
var ctx_rain=canvas_rain.getContext('2d');
var w = canvas_rain.width = window.innerWidth;
var h = canvas_rain.height = window.innerHeight;

	var counts=30;//声明雨滴的数量
	var drops=[];//用数组来存放每一个实例化出来的雨滴；
	
	//帧动画兼容
	window.requestAnimation = (function(){
		return window.resquestAnimationFrame||
		window.webkitRequestAnimationFrame||
		window.mozRequestAnimationFrame||
		function(callback){
			window.setTimeout(callback,1000/60)
		}
	})
	// 当浏览器窗口发生改变，画布尺寸也随着也改变
	window.onresize=function(){
		w = canvas_rain.width=window.innerWidth;
		h = canvas_rain.height=window.innerHeight;
	}
	console.log(h)
	//生成一个随机数
	function random(max,min){
		Math.random(0,1)
		return Math.random()*(max-min)+min
	}
	//创建一个雨滴对象
	function Drop(){}
	// 给雨滴添加属性及方法
	Drop.prototype = {
		// 雨滴的初始值(雨滴的宽高，颜色)
		init: function(){
		      this.x = random(0,w)//随机生成0到w雨滴的横坐标；
		      this.y = random(0,h)//随机生成0到h雨滴的纵坐标；
		      this.vy = random(4,5)//随机生成一个雨滴降落的速度；
		      this.l = random(h*0.8,h*0.9)//随机生成雨滴的落点;
		      this.r = 1;//圆形的初始半径为1；
		      this.vr = 1;//圆形半径的跟新速度；
		      this.a = 1;//圆形的初始透明度；
		      this.va = 0.96;//圆形透明度更新系数；
		  },
		// 绘制雨滴
		draw: function(){
			if(this.y>=this.l){
			  	ctx_rain.beginPath();//开始路径
			  	ctx_rain.arc(this.x,this.y,this.r,0,2*Math.PI,false);
			  	ctx_rain.strokeStyle="rgba(0,255,255,"+this.a+")";
			  	ctx_rain.stroke();
			  }else{

			  	ctx_rain.fillStyle=randomColor(this.a);
			  	ctx_rain.fillRect(this.x,this.y,2,8);
			  }
			  this.update();//雨滴的纵坐标不断更新
			},
			update: function(){
				if(this.y<this.l){
		      	 this.y+=this.vy;//更新y坐标
		      	}else{
		      		if(this.a>0.03){
		      		this.r += this.vr//更新圆形的半径
		      		if(this.r>50){
		      			this.a*=this.va//让圆形消失改变透明度
		      		}
		      	}else{
		      		//雨滴消失就重新初始化雨滴对象
		      		this.init();
		      	}
		      }
		  }
		}
	//实例化雨滴对象
	// var drop = new Drop();//drop拥有了Drop身上的属性及方法
		// drop.init();//初始化雨滴的属性值
		// drop.draw();//绘制出雨滴
	//让雨滴开始动画
	function move(){
		// ctx.clearRect(0,0,w,h)//相当于对整个画布重绘一个空白的图形
		ctx_rain.fillStyle="rgba(0,0,0,.1)";
		ctx_rain.fillRect(0,0,w,h);
		for(var i=0;i<drops.length;i++){
			drops[i].draw();
		}
		requestAnimationFrame(move)
	}
	
    //延迟实例化每个雨滴对象
    function setDrop(){
    	for(var i=0;i<counts;i++){
    		(function(j){
    			setTimeout(function(){
    				var drop = new Drop();
    				drop.init();
    				drops.push(drop);
    			},j*200)
    		})(i)
    	}
    }
    
    //生成随机颜色
    function randomColor(a){
    	var r = Math.floor(Math.random()*255);
    	var g = Math.floor(Math.random()*255);
    	var b = Math.floor(Math.random()*255);
    	return "rgba("+r+","+g+","+b+","+a+")"
    }