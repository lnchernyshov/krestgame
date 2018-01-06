var nk = 15 // число клеток nk*nk
var zmax = 5// 5 в ряд
var col = "#F00"  // цвет знаков
var colw = "#0F0"  // цвет победы
var bs = false    // шкала
var bk = true    // подтверждение "отправить"
var hy = 15  // на шкалу
var dd = 25  // размер клетки
var nstep = 1
var np = 0 // число попыток
var i0=-1; var j0 = -1
arr = []
var sw = ""
for (i=0;i<nk;i++){ // поле 1 - крестик, 2 - нолик
	arr[i] = new Array()
	for (j=0;j<nk;j++) arr[i][j]=0
}
swin = new Array(zmax); // выигрышный ряд
 
function fz(i,j){
	return "abcdefghijklmnopqrstuvwxyz".substr(i,1)+j
}
function setScale(){ // режим по флажку "шкала" 
	bs = $("#sk").prop("checked")
	if(bs){ // шкала
		dd=25; hy=15
	}else{
		dd = 26; hy=0
	}
	setka0();  // перерисовка сетки
}	
function setSend(){// режим по флажку "повтор" 
	bk = $("#ssend").prop("checked")
	$("#send").prop("disabled",!bk)
}	
 
function win(i0,j0,t){ // выигрыш при zmax в ряд 
	var i = 0
	var kz = 0
    while (i<nk && kz<zmax){ // по горизонтали
		if (arr[j0][i]==t) swin[kz++]=fz(i,j0); else kz=0
		i++
	}
	if (kz>=zmax) return true 
	var j = 0
	kz = 0
    while (j<nk && kz<zmax){ // по вертикали 
		if (arr[j][i0]==t) swin[kz++]=fz(i0,j); else kz=0
		j++
	}
	if (kz>=zmax) return true 
	j = Math.max(j0 - i0,0)		// i-j = i0-j0   j = i-(i0-j0)
	i = j + (i0-j0)
    while (j<nk && i<nk &&kz<zmax){ // по диагонали || главной 
		if (arr[j][i]==t) swin[kz++]=fz(i,j); else kz=0
		i++; j++
	}
	if (kz>=zmax) return true 
	j = Math.max(j0 + i0 - nk - 1,0)			// i+j = i0+j0 j = i0+j0 - i
	i = (i0+j0) - j
    while (j<nk && i>=0 && kz<zmax){ // по диагонали || побочной
		if (arr[j][i]==t) swin[kz++]=fz(i,j); else kz=0
		i--; j++
	}
	return kz>=zmax
}

function set1(i,j,t,color){ // вывод крестика (t=1) или нолика (t=0) в ячейку (i,j)
	// i = 0..nk-1   j = 0..nk-1
	if(i>nk-1 || j>nk-1) return
	var d2 = Math.floor(dd/2)
	var d1 = d2 - dm    			// dd = размер, d2 полуразмер клетки
	var x = i*dd+d2+hy; var y = j*dd+d2+hy // центр клетки 
	with (cnt1) {
		strokeStyle = color; // цвет линий
		beginPath();
		if (t==1){
			moveTo(x-d1, y-d1); lineTo(x+d1, y+d1);
			moveTo(x-d1, y+d1); lineTo(x+d1, y-d1);
		} else {
			arc(x, y, d1, 0, Math.PI*2, true);
		}		
		stroke();
	}
	arr[j][i] = t
}

function clear1(i,j){ // очистить клетку
	var x = i*dd+2; var y = j*dd+2 
	cnt1.clearRect(x+hy, y+hy, dd-4,dd-4)
	arr[j][i] = 0
}

function getOffL(ele) {	var n = 0;		// нормализаци¤ координаты X
	while (ele)	{ n += ele.offsetLeft || 0;	ele = ele.offsetParent;	}
	return n;
}
function getOffT(ele) {	var n = 0;		// нормализаци¤ координаты Y
	while (ele)	{n += ele.offsetTop || 0; ele = ele.offsetParent;}
	return n;
}
function getMouse(e){  // нормализованные координаты мыши
	var x = e.clientX - getOffL(cs1)
	var y = e.clientY - getOffT(cs1)
	return [x,y];
}

fdown = function(e) {         	// событие по нажатию кнопки мыши
	var mouse = getMouse(e);
	x = mouse[0]-hy; y = mouse[1]-hy;	// приведение координат к левому верхнему углу
	var i = Math.floor(x/dd); var j = Math.floor(y/dd); // координаты клетки 
	// 0 1 ... по горизаонтали    0 1 по вертикали
	if (arr[j][i]!=0) return  // занято
	if (np>0){ // новая позиция
		if (sw.length>0){ // были отметки
			for(var k=0;k<zmax;k++){
				var mij = coord(swin[k])  // a0 -> [0,0] ... 
				set1(mij[0],mij[1],tznak,col)
			}
		}
		clear1(i0,j0) //,"#FFF") // очистить прежнюю позицию
	}
	set1(i,j,tznak,col)		// вывод крестика
	sw = ""
	if (win(i,j,tznak)){ // выделение выигрышной комбинации
		// побочный эффект построение swin 
		sw = swin.join() 
		for(var k=0;k<zmax;k++){
			var mij = coord(swin[k])  // a0 -> [0,0] ... 
			set1(mij[0],mij[1],tznak,colw)
		}
	}
	i0 = i; j0 = j
	np++
	var msg = fz(i,j) // преобразование координат в код (0,0) -> a0 
	$('input').val(msg); // код хода в поле ввода
	if (!bk){ // без подтверждения
		fsend()
	}else{
		$("#send").prop("disabled",false) // сделать кнопку доступной
	}
}

function setka0(){ // отрисовка сетки со шкалой (bs=true) и без
	with (cnt1) {
		clearRect(0, 0, wc,hc)
		strokeStyle = "#000"; // черный 
		beginPath();
		lineWidth = 1;  
		if (bs){
			//var hy=15
			for (var i=0;i<=nk;i++) {moveTo(0, i*dd+hy);	lineTo(wc, i*dd+hy) } // гориз.
			for (var i=1;i<=nk;i++) {
				strokeText("abcdefghijklmnopqrstuvwxyz".substr(i-1,1),i*dd,10) // [, maxWidth ]
			}
			for (var i=0; i<=nk; i++) {moveTo(i*dd+hy, 0);	lineTo(i*dd+hy, hc) }// верт
			for (var i=1; i<=nk; i++) {
				var da = (i<=10)?4:0
				strokeText(i-1, 1+da, i*dd+6 ) // [, maxWidth ]
			}
		}else{
			for (var i=0; i<=nk; i++) {moveTo(0, i*dd);	lineTo(wc, i*dd) }
			for (var i=0; i<=nk; i++) {moveTo(i*dd, 0);	lineTo(i*dd, hc) }
		}
		stroke();
	}	
	cnt1.lineWidth = 4;  var kk=0
	for (i=0;i<nk;i++){ // поле 1 - крестик, 2 - нолик
		for (j=0;j<nk;j++) if (arr[i][j]>0) {set1(j,i,arr[i][j],col); kk++}
	}	
	//alert(kk)
}

function start() {
	function setka(){ // отрисовка сетки
		dd = 26; hy=0
		if(bs) {dd=25; hy=15}
		with (cnt1) {
			beginPath();
			if (bs){
				//var hy=15
				for (var i=0;i<=nk;i++) {moveTo(0, i*dd+hy);	lineTo(wc, i*dd+hy) } // гориз.
				for (var i=1;i<=nk;i++) {
					strokeText("abcdefghijklmnopqrstuvwxyz".substr(i-1,1),i*dd,10) // [, maxWidth ]
				}
				for (var i=0; i<=nk; i++) {moveTo(i*dd+hy, 0);	lineTo(i*dd+hy, hc) }// верт
				for (var i=1; i<=nk; i++) {
					var da = (i<=10)?4:0
					strokeText(i-1, 1+da, i*dd+6 ) // [, maxWidth ]
				}
			}else{
				for (var i=0; i<=nk; i++) {moveTo(0, i*dd);	lineTo(wc, i*dd) }
				for (var i=0; i<=nk; i++) {moveTo(i*dd, 0);	lineTo(i*dd, hc) }
			}
			stroke();
		}	

		$("#txt").val("Крестики-нолики 5 в ряд")
	}

	var cs1 = document.getElementById("cs1");	// <canvas id="cs1" ... квадратное!
	if (!cs1.getContext)	return;         	// есть поддержка canvas?
	cs1.onmousedown =  null
	wc = cs1.width;  hc = cs1.height;	//  ширина и высота поля
	//dd = Math.floor(cs1.width/nk)				// размер клетки
	//dd = 26
	dm = 5;                                	// отступ знака от краев клетки
	cnt1 = cs1.getContext("2d");           	// установка граф.контекста
	setka();                            	// 
	cnt1.lineWidth = 4;                    	// толщина линии у крестиков и ноликов
} // start
