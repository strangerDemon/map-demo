/**
 * Created by Administrator on 2017/7/4.
 */
export const fullScreen= function() {
  var docElm = document.documentElement;
  //W3C
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen();
  }

  //FireFox
  else if (docElm.mozRequestFullScreen) {
    docElm.mozRequestFullScreen();
  }

  //Chrome等
  else if (docElm.webkitRequestFullScreen) {
    docElm.webkitRequestFullScreen();
  }

  //IE11
  else if (docElm.msRequestFullscreen) {
    docElm.msRequestFullscreen();
  }
  else {
    alert("暂不支持该浏览器全屏，请按F11进入全屏");
  }
};
export const exitFullScreen = function() {
  //W3C
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
  //FireFox
  else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  }
  //Chrome等
  else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
  //IE11
  else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  else {
    alert("暂不支持该浏览器全屏，请按F11退出全屏");
  }
};
