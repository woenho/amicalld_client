var gObj;
var gKey;
var gID;
var gMenuName;
var gAuth;

var main = (function () {

	return function MakeSocket() {
		try {
			if (!window.top.msocket) {
				window.top.msocket = new WebSocket('ws://' + window.location.host + '/login');
			} else {
				alert("main: alleady created websocket!");
				return;
			}

			window.top.msocket.onopen = function () {
				console.log("main opened websocket!");
			}

			window.top.msocket.onmessage = function (msg) {
				console.log("main recieved maessage websocket!");
				console.log(msg.data);
				gObj = JSON.parse(msg.data);
				if (gObj.openss) {
					// 수신메시지....


				}
			}

			window.top.msocket.onclose = function () {
				console.log("main websocket closed");
				window.top.msocket = undefined;
				window.top.gKey = undefined;
				var vLoc = window.frames['subFrame'];
				//same as --> var vLoc = document.getElementsByTagName( "iframe" )[ 0 ].contentWindow);
				//same as --> var vLoc = window.top.document.getElementById('subFrame');
				vLoc.srcdoc = "<p><h1>서버와의 연결이 종료되었습니다.</h1><h2 onclick='window.top.location.reload(true);' style='color: blue;'>재연결</h2></p>";
			}

			window.top.msocket.onerror = function (error) {
				console.log('main websocket error: ' + error.data);
				window.top.msocket.close();
			}

		} catch (exception) {
			console.log("main websocke exception: " + exception);
		}
	}
})();

function websocket_check(obj) {
	try {
		if (!window.top.msocket) {
			alert("서버와 연결이 되지 않았습니다.");
			window.location.assign("/index.html");
			return;
		}
		if (window.top.gID !== obj.location.pathname) {
			window.top.gID = obj.location.pathname;
			console.log('src=' + window.top.gID);
			var vLoc = window.top.frames['subFrame'];
			if (vLoc)
				vLoc.contentWindow.location.reload(true);
			else
				window.location.assign("/index.html");
			return;
		}

		window.top.msocket.onmessage = function (msg) {
			console.log(msg.data);
			gObj = JSON.parse(msg.data);
			if (gObj.errcode === 0) {
				window.top.gAuth = gObj.msg;
				if (typeof init_screen === 'function') {
					init_screen();
				}
			} else {
				if (gObj.msg)
					alert(gObj.msg);
				window.location.assign("/index.html");
			}
		}

		function CheckLogin() {
			var segments = [];
			segments.push('cmd=check');
			segments.push('key=' + window.top.gKey);
			console.log('key:' + window.top.gKey);
			window.top.msocket.send(segments.join('&'));
		}

		CheckLogin();

	} catch (exception) {
		console.log("login websocke exception: " + exception);
	}
	return true;
}


// menu 2곳 이상에서 사용-------------------------------------------------------------------
var submenu_visible = 1;
function view_submenu() {
	if (submenu_visible === 1) {
		submenu_visible = 0;
	} else {
		submenu_visible = 1;
	}
	var vMenu = document.getElementById('gnb');
	var vUL = vMenu.childNodes;
	for (var i = 0; i < vUL.length; i++) {
		if (vUL[i].nodeName === 'UL') {
			var vUI = vUL[i].childNodes;
			for (var j = 0; j < vUI.length; j++) {
				if (vUI[j].nodeName === 'LI') {
					var vTarget = vUI[j].childNodes;
					for (var k = 0; k < vTarget.length; k++) {
						if (vTarget[k].nodeName === 'UL') {
							if (submenu_visible === 1) {
								vTarget[k].style.visibility = 'visible';
							} else {
								vTarget[k].style.visibility = 'hidden';
							}
						}
					}
				}
			}
		}
	}
}

// list ----------------------------

function displaydata(oData, bLastfit, bLastSelect) {
	document.getElementById("total_cnt").innerHTML = "<a style='font-size: 12px; color: #000;'>total count is " + oData.length + "</a> &nbsp;&nbsp; <input type='button' onclick='savelist()' value='저장'/>";

	var szTmp;
	szTmp = "<table id='tbmain'>";
	var ss = Object.keys(oData[0]);
	szTmp += "<thead><tr class='tb_itemheader' onclick='SelectRow(this)'>";
	for (var col in ss) {
		if (bLastfit === 'no') {
			szTmp += "<td>";
		} else {
			if (Number(col) === (ss.length - 1))
				szTmp += "<td  width='100%'>";
			else
				szTmp += "<td>";
		}
		szTmp += ss[col];
		szTmp += "</td>";
	}
	szTmp += "</tr></thead><tbody>";
	for (var row in oData) {
		szTmp += "<tr class='tb_none' onclick='SelectRow(this)'>";
		for (var col in oData[row]) {
			if (bLastSelect === 'yes' && col === 'IMAGE_PATH') {
				szTmp += "<td onclick='ClickTD(this)'>";
			} else {
				szTmp += "<td>";
			}
			szTmp += oData[row][col];
			szTmp += "</td>";
		}
		szTmp += "</tr>";
	}
	szTmp += "</tbody></table>";
	document.getElementById("lc_main").innerHTML = szTmp;
	if (typeof custom_display === 'function') {
		custom_display();
	}
}

function savelist() {
	if (typeof custom_save === 'function') {
		custom_save();
		return;
	}
	//console.log(gData);
	gObj = JSON.parse(gData);
	if (!gObj.data) {
		alert("저장할 정보가 없습니다.");
		return;
	}
	function download() {
		var fileContents = "";
		var ss = Object.keys(gObj.data[0]);
		for (var col in ss) {
			fileContents += '\t' + ss[col];
		}
		fileContents += "\r\n";
		for (var row in gObj.data) {
			for (var col in gObj.data[row]) {
				if (gObj.data[row][col].length > 8)
					fileContents += '\t\'' + gObj.data[row][col];
				else
					fileContents += '\t' + gObj.data[row][col];
			}
			fileContents += "\r\n";
		}
		var fileName = "report.csv";

		var pp = document.createElement('a');
		pp.setAttribute('href', 'data:text/plain;;charset=utf-8,' + encodeURIComponent(fileContents));
		pp.setAttribute('download', fileName);
		pp.click();
	}
	setTimeout(function () { download() }, 500);
}
