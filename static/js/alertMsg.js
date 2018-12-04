var alertMsg = {
  init: function(){
    this.$target = $('#alert-msg');
    this.$target.css({
      'display': 'none',
      'position': 'absolute',
      'top': '45vh',
      'bottom': '45vh',
      'left': '30vw',
      'right': '30vw',
      'text-align': 'center',
      'z-index': '2',
      'background-color': 'black',
      'opacity': '0.6',
      'font-size': '2.5vh',
      'line-height': '10vh',
      'color': '#fff'
    });
  },
  show: function(msg){
    var _this = alertMsg;
    _this.$target.text(msg);
    _this.$target.fadeIn('fast');
    setTimeout(_this.hide, 1500);
  },
  hide: function(){
    var _this = alertMsg;
    _this.$target.fadeOut('slow');
  },
  setCss: function(obj){
    var _this = alertMsg;
    _this.$target.css(obj);
  }
}

alertMsg.init();