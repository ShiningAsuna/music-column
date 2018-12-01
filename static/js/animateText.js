$.fn.animateText = function(type){
  type = type || 'fadeIn';
  var words = this.text().split('');
  var charArr = words.map(function(val){
    return '<span>' + val + '</span>';
  })
  this.html(charArr.join(''));

  var index = 0;
  var _this = this; 
  var clock = setInterval(function(){
    if(index>=_this.find('span').length){
      clearInterval(clock);
      return;
    }
    _this.find('span').eq(index).addClass('animated ' + type);
    index++;
  }, 200)
}