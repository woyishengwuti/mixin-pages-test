/*!
 * error.js v0.0.1
 * (c) 记录报错信息
 */

'use strict';

const xmlHttp = new XMLHttpRequest();

window.onerror = function(msg, url, row, col, error) {
    col = col || (window.event && window.event.errorCharacter) || 0;
    
    const errorMsgs = {
	    msg: error.stack,  
	    url: url,  
	    row: row, 
	    col: col,  
	    nowTime: new Date(),
	};

    let str = JSON.stringify(errorMsgs);
    
    xmlHttp.open("GET", `/BS/IDMS/php/TDMS/通用/YWGL_JBBCJL.php?YHID=''&YHXM=''&JBMC=0&ZDID=''&CS=${str}&URL=''&FHZ=''&SZYM=''`, true);
  	xmlHttp.send(null);
   
    //return true
}
 
window.addEventListener("unhandledrejection", function(e){
  	e.preventDefault();
  	//console.error(e.reason.stack)
  	xmlHttp.open("GET", `/BS/IDMS/php/TDMS/通用/YWGL_JBBCJL.php?YHID=''&YHXM=''&JBMC=0&ZDID=''&CS=${e.reason.stack}&URL=''&FHZ=''&SZYM=''`, true);
  	xmlHttp.send(null);
  	
  	//return true;
});


