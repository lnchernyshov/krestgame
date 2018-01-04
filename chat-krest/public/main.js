var port = 3000; // Указываем порт на котором у на стоит сокет
var user = ""    // этот игрок
var userP = ""	// противник
var bu=true, bn= true
var tznak = 2      // 2 - нолик 1 - крестик
var socket = io.connect('http://localhost:' + port); 
// Тут мы объявляем "socket" (дальше мы будем с ним работать) 
// и подключаемся сразу к серверу через порт

socket.on('userName', function(userName){ 
	// Создаем прослушку 'userName' и принимаем переменную name в виде аргумента 'userName'
	//console.log('You\'r username is => ' + userName); 
	// Выводим в поле для текста оповещение для подключенного с его ником
	if (bu)$('textarea').val($('textarea').val() + 'Ваше имя ' + userName+". Ждите!\n" ); 
	bu = false
	user = userName
});

socket.on('newUser', function(userName){ // новый игрок
	//console.log('New user has been connected to chat | ' + userName); // Логгирование
	if (userP.length>0) return  // противник уже есть
	var s0 = $('textarea').val(); 
	var kk = s0.lastIndexOf(" ");
	s0 = s0.substr(0,kk) // ходите
	if (bn) $('textarea').val(s0 + '\n>Ваш противник '+ userName + '. Ходите!\n'); 
	bn = false
	userP = userName
	tznak = 1
	cs1.onmousedown =  fdown
	nstep = 0
	// Это событие было отправлено всем кроме только подключенного, 
	// по этому мы пишем другим юзерам в поле что 'подключен новый юзер' с его ником
});

function coord(xy){ // a1 k10 .... 
	var x = xy.substr(0,1)  // столбец a 
	var y = xy.substr(1)    // строка  10 
	var i = "abcdefghijklmnopqrstuvwxyz".indexOf(x); // -1 если нет
	var j = parseInt(y)
	j = isNaN(j)?-1:j		// a10...	
	s=""; if (i>=0 && j>=0) s = xy.substr(x+j)
	return [i,j,s]
}

$(document).on('click', 'button', function(){ // ход игрока по клику "Отправить"
	fsend()
})

function fsend(){  // отпрвка хода 
	var message = $('input').val();  // то что в поле для ввода
/*	var smus = ""  состояние поля arr
	for (i=0;i<nk;i++){ // поле 1 - крестик, 2 - нолик
		ss += "\n";	for (j=0;j<nk;j++) ss += arr[i][j]
	} ss+="\n";	$('textarea').val($('textarea').val()+ss)
*/	
	var ij = coord(message)
	var i = ij[0];	var j = ij[1]
	if (i==-1 || j==-1 || i>nk-1 || j>nk-1) return
	// i0,j0 - то, что было выбрано
	if (i!=i0 || j!=j0){ // изменено в поле?
		if (arr[j][i]!=0) return // занято
		clear1(i0,j0)
		set1(i,j,tznak,col)
	}
	cs1.onmousedown = null // отправка кода только после ответа
	var s0 = $('textarea').val(); 
	var kk = s0.lastIndexOf(" ");
	s0 = s0.substr(0,kk) // ходите
	var mm = message.split(' '); var ss=""
	if (tznak==1){ // крестик
		nstep++
		ss = "\n" + nstep + '. '+ mm[0]
	}else{ // нолик
		ss = ' '+ mm[0]
	}
	var ss1 = ""
	if (sw.length>0){
		ss1 = "win,"+sw+":"
		ss += 	"\n>Вы победили!\n>Для новой игры обновите страницу."
	}else{
		ss += 	" Ждите!"
	}
	$('textarea').val(s0 + ss); 
	np = 0  // число попыток
	socket.emit('message', userP+":"+ss1 + message); // Отправляем событие 'message' на сервер c текстом
	$('input').val(null); // Очищаем поле для ввода
	$("#send").prop("disabled",true) // сделать кнопку недоступной
}

socket.on('messageToClients', function(umsg, name){ // ход от противника nameP:msg nameP  
	//console.log(name + ' | => ' + msg); 
	// кому:msg от кого или кому:swin:msg   swin="win,a0,a1,a2" - выигрыш
	if (name==user)return
	var s0 = $('textarea').val(); 
	var mu = umsg.split(":")  // user:msg       от кого
	if (nstep>1){
		if (mu[0]!=user && name!=userP) return
	}else{ // первый раз
		if (mu[0]!=user) return 
	} 
	var msg = mu[1]	   // кому:msg	
	if (mu.length>2){ // кому:swin:msg
		msg = mu[2]
	}

	var ij = coord(msg)
	var i = ij[0];	var j = ij[1]
	if (!(i==-1 || j==-1 || i>nk-1 || j>nk-1)){
		set1(i,j,3-tznak,col)		// вывод крестика/нолика - ход противника
		cs1.onmousedown =  fdown
	}	

	if (mu.length>2){ // кому:swin:msg
		var swin = mu[1].split(",")
		if (swin[0]=="win"){
			for(var k=1;k<=zmax;k++){
				var mij = coord(swin[k])  // a0 -> [0,0] ... 
				set1(mij[0],mij[1],3-tznak,colw)
			}
			$('textarea').val(s0 + "\n>Вы проиграли!\n>Для новой игры обновите страницу."); 
			cs1.onmousedown =  null
			return
		}
	}
	$('input').val(ij[2]);
	var kk = s0.lastIndexOf(" "); s0 = s0.substr(0,kk) // ждите
	var mm = msg.split(' '); var ss=""
	
	if (tznak==1){ // крестик
		ss = ' '+ mm[0] + " Ходите!"
	}else{
		var s1 = ""
		if (nstep==1){
			s1 = "\n>Ваш противник "+name+"."//+mu[0]
			userP = name
		}	
		ss = s1+"\n" + nstep + '. '+ mm[0] + " Ходите!"
		nstep++
	}
	$('textarea').val(s0 + ss); 
});
