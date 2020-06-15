(function (){
	var i = 0;
	var j = 0;
		//获取canvas
		var canvasEl = document.getElementById("canvas");
		var ctx = canvasEl.getContext("2d");
		var mousePos = [0,0];
		//颜色初始化
		var easingFactor = 5.0;
		var backgroundColor = '#000';
		var nodeColor = '#fff';
		var edgeColor = '#fff';

		//定义节点与变数组
		var nodes = [];
		var edges = [];
		//构造星星对象
		function constructNodes(){
			for(var i = 0; i < 100; i++){
				//为了实现后面一个更炫酷的效果，
				//给第一个点加了一个 drivenByMouse 属性，
				//这个点的位置不会被粒子系统管理，也不会绘制出来，
				//但是它会与其他点连线，这样就实现了鼠标跟随的效果了。
				var node = {
					drivenByMouse :i ==0,
					x:Math.random() * canvasEl.width,
					y:Math.random() * canvasEl.height,
					vx:Math.random() * 1-0.5,
					vy:Math.random() * 1-0.5,
					radius : Math.random() >0.9?3+Math.random() * 3 : 1+Math.random()*3

				};
				nodes.push(node);
			}
			//假设我们之前连接了 A、B两点，也就是外侧循环是A，内侧循环是B，
			//那么在下一次循环中，外侧为B，内侧为A，是不是也会创建一条边呢？
			//而实际上，这两个边除了方向不一样以外是完全一样的，
			//这完全没有必要而且占用资源。
			//因此我们在 addEdge 函数中进行一个判断：

			nodes.forEach(function(e){
				nodes.forEach(function(e2){
					if(e == e2){
						return;
					}
					//线对象
					var edge = {
						from : e,
						to : e2
					}
					addEdge(edge);
				});
			});

			console.log(edges);
		}

		/**
		 * 假设我们之前连接了 A、B两点，也就是外侧循环是A，内侧循环是B，
		 *那么在下一次循环中，外侧为B，内侧为A，是不是也会创建一条边呢？
		 */
		 function addEdge(edge){
		 	var ignore = false;
		 	edges.forEach(function(e){
		 		if(e.from == edge.from && e.to == edge.to){
		 			ignore = true;
		 		}

		 		if(e.to == edge.from && e.from == edge.to){
		 			ignore = true;
		 		}
		 	});

		 	if(!ignore){
		 		edges.push(edge);
		 	}
		 }
		/**
		 * 让点动起来
		 * 就是遍历粒子，并且更新其状态。更新的公式就是
		 *v = v + a
		 *s = s + v
		 * a是加速度，v是速度，s是位移。由于我们这里不涉及加速度，所以就不写了。
		 * 然后我们需要作一个边缘的碰撞检测，
		 * 不然我们的“星星”都无拘无束地一点点飞～走～了～。
		 * 边缘碰撞后的处理方式就是让速度矢量反转，这样粒子就会“掉头”回来。

		 *还记得我们需要做的鼠标跟随吗？
		 *也在这处理，
		 *我们让第一个点的位置一点一点移动到鼠标的位置，
		 *下面这个公式很有意思，可以轻松实现缓动：
		 *x = x + (t - x) / factor

		 *其中 factor 是缓动因子，t 是最终位置，x 是当前位置。
		 *至于这个公式的解释还有个交互大神 Bret Victor 在他的演讲中提到过，
		 *视频做的非常好，有条(ti)件(zi)大家一定要看看： Bret Victor – Stop Drawing Dead Fish

		 *好了，回到主题。我们在上面的函数中处理完了一帧中的数据，
		 *我们要让整个粒子系统连续地运转起来就需要一个timer了，
		 *但是十分不提倡大家使用 setInterval，而是尽可能使用 requestAnimationFrame，
		 *它能保证你的帧率锁定在

		 * @return {[type]} [description]
		 */
		 function step() {
		 	nodes.forEach(function (e) {
		 		if (e.drivenByMouse) {
		 			return;
		 		}

		 		e.x += e.vx;
		 		e.y += e.vy;

		 		function clamp(min, max, value) {
		 			if (value > max) {
		 				return max;
		 			} else if (value < min) {
		 				return min;
		 			} else {
		 				return value;
		 			}
		 		}

		 		if (e.x <= 0 || e.x >= canvasEl.width) {
		 			e.vx *= -1;
		 			e.x = clamp(0, canvasEl.width, e.x)
		 		}

		 		if (e.y <= 0 || e.y >= canvasEl.height) {
		 			e.vy *= -1;
		 			e.y = clamp(0, canvasEl.height, e.y)
		 		}
		 	});

		 	adjustNodeDrivenByMouse();
		 	render();
		 	window.requestAnimationFrame(step);
		 }
		/**
		 * 根据鼠标移动调整点
		 * @return {[type]} [description]
		 */
		 function adjustNodeDrivenByMouse(){

		 	nodes[0].x += (mousePos[0] - nodes[0].x)/easingFactor;
		 	nodes[0].y += (mousePos[1] - nodes[0].y)/easingFactor;
		 }


		/**
		 * 线长
		 * @param  {[type]} edge [description]
		 * @return {[type]}      [description]
		 */
		 function lengthOfEdge(edge) {
		 	return Math.sqrt(Math.pow((edge.from.x - edge.to.x), 2) + Math.pow((edge.from.y - edge.to.y), 2));
		 }

		/**
		 * 常规的 Canvas 绘图操作，
		 * 注意 beginPath 一定要调用，
		 * 不然你的线就全部穿在一起了… 
		 * 需要说明的是，在绘制边的时候，
		 * 我们先要计算两点距离，
		 * 然后根据一个阈值来判断是否要绘制这条边，
		 * 这样我们才能实现距离远的点之间连线不可见的效果。

		 * @return {[type]} [description]
		 */
		 function render(){
		 	ctx.fillStyle = backgroundColor;
		 	ctx.fillRect(0,0,canvasEl.width,canvasEl.height);

		 	edges.forEach(function(e){
		 		var l = lengthOfEdge(e);
		 		var threhold = canvasEl.width/8;
		 		if( l > threhold){
		 			return;
		 		}
		 		ctx.strokeStyle = edgeColor;
		 		ctx.lineWidth = (1.0 - l/threhold)*2.5;
		 		ctx.globalAlpha = 1.0 - l/threhold;
		 		ctx.beginPath();
		 		ctx.moveTo(e.from.x,e.from.y);
		 		ctx.lineTo(e.to.x,e.to.y)
		 		ctx.stroke();
		 	});

		 	ctx.globalAlpha = 1.0;

		 	nodes.forEach(function(e){
		 		if(e.drivenByMouse){
		 			return;
		 		}
		 		ctx.fillStyle = nodeColor;
		 		ctx.beginPath();
		 		ctx.arc(e.x,e.y,e.radius,0,2*Math.PI);
		 		ctx.fill();
		 	});
		 }

		//随着窗口的改变重绘画布
		window.onresize = function(){
			canvasEl.width = document.body.clientWidth;
			canvasEl.height = canvasEl.clientHeight;

			if(nodes.length == 0){
				//构造点
				constructNodes();
			}

			render();
		}
		/**
		 * [onmousemove description]
		 * @param  {[type]} e [description]
		 * @return {[type]}   [description]
		 */
		 window.onmousemove = function (e) {
		 	mousePos[0] = e.clientX;
		 	mousePos[1] = e.clientY;
		 }

	 	window.onresize(); // trigger the event manually.

	 	window.requestAnimationFrame(step);
	 }).call(this);