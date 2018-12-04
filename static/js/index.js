var player = {
  init: function(){
    this.song = new Audio();
    this.song.autoplay = true;
    this.songid = '';
    this.songObj = {};
    this.curAlbumId = '';
    this.curAlbumName = '';
    this.lyricObj = {};
    this.isCollected = false;
    this.collectionIndex = 0;
    this.$info = $('main .info');
    this.$controller = $('main .controller');
    this.collectionId = localStorage.getItem('collection-id') == null ? [] : JSON.parse(localStorage.getItem('collection-id'));
    this.songCollection = localStorage.getItem('song-collection') == null ? [] : JSON.parse(localStorage.getItem('song-collection'));
    this.bind();
  },
  bind: function(){
    var _this = this;

    // 切换封面
    eventCenter.on('album-change', function(e, albumId, albumName){ 
      _this.getMusic(albumId, function(song){
        if(albumId === 'channal_collection' && song == undefined){
          // 收藏列表为空
          alertMsg.show('收藏列表为空');
          return;
        } 
        song.album_name = albumName;
        _this.curAlbumId = albumId;
        _this.curAlbumName = albumName;
        _this.songObj = song;
        _this.render(song);
        _this.getLyric();
      });
    });

    // 下一曲
    _this.$controller.find('.icon-next').on('click', function(){
      _this.getMusic(_this.curAlbumId, function(song){
        song.album_name = _this.curAlbumName;
        _this.songObj = song;
        _this.render(song);
        _this.getLyric();
      });
    })

    // 歌曲播放时更新事件
    _this.song.addEventListener('timeupdate', function(){
      _this.updateTime(this);
      _this.renderLyric(this);
    })

    // 歌曲播放完毕
    _this.song.addEventListener('ended', function(){
      _this.$controller.find('.icon-next').trigger('click');
    })

    // 设置进度条点击
    _this.$info.find('.prog-sum').on('click', function(e){
      var sumLength = parseInt($(this).width());
      var percent = e.offsetX / sumLength;
      _this.song.currentTime = _this.song.duration * percent;
      // 设置歌词
      var latestKey = '';
      for(var key in _this.lyricObj){
        keyTimeArr = key.split(':');
        keySec = parseInt(keyTimeArr[0])*60 + parseInt(keyTimeArr[1]);
        if(keySec >= _this.song.currentTime){
          if(_this.lyricObj[latestKey] !== _this.$info.find('.lyrics').text()){
            _this.$info.find('.lyrics').text(_this.lyricObj[latestKey]);
            _this.$info.find('.lyrics').animateText('fadeIn');
          }
          break;
        }
        latestKey = key;
      }
    })

    // 设置播放按钮
    _this.$controller.find('.ico-play').on('click', function(){
      if (_this.song.paused) {
        _this.song.play();
        $(this).addClass('icon-pause').removeClass('icon-start');
      } else {
        _this.song.pause();
        $(this).addClass('icon-start').removeClass('icon-pause');
      }
    })

    // 收藏
    _this.$controller.find('.icon-aixin').on('click', function(){
      if(_this.isCollected){
        _this.removeFromArr(_this.songCollection, _this.songObj);
        _this.removeFromArr(_this.collectionId, _this.songid);
        localStorage.setItem('song-collection', JSON.stringify(_this.songCollection));
        localStorage.setItem('collection-id', JSON.stringify(_this.collectionId));
        _this.isCollected = false;
        $(this).css('color', 'rgba(255, 255, 255, 0.6)');
        alertMsg.show('取消收藏成功');
        var lovesNum = parseInt(_this.$info.find('.loves-num').text());
        _this.$info.find('.loves-num').text(--lovesNum);
      } else {
        _this.songCollection.push(_this.songObj);
        _this.collectionId.push(_this.songid);
        localStorage.setItem('song-collection', JSON.stringify(_this.songCollection));
        localStorage.setItem('collection-id', JSON.stringify(_this.collectionId));
        _this.isCollected = true;
        $(this).css('color', 'red');
        alertMsg.show('收藏成功，歌曲已收藏至“我的收藏”歌单');
        var lovesNum = parseInt(_this.$info.find('.loves-num').text());
        _this.$info.find('.loves-num').text(++lovesNum);
      }
    })
  },
  render: function(song){
    var _this = this;
    _this.lyricObj = {};
    _this.$info.find('.lyrics').html('');

    if(_this.collectionId.indexOf(song.sid)>-1){
      _this.$controller.find('.icon-aixin').css('color', 'red');
      _this.isCollected = true;
    } else {
      _this.$controller.find('.icon-aixin').css('color', 'rgba(255, 255, 255, 0.6)');
      _this.isCollected = false;
    }

    _this.songid = song.sid;
    _this.$controller.find('figure').css('background-image', 'url("' + song.picture + '")');
    $('#background').css('background-image', 'url("' + song.picture + '")');
    easytpl.replace(_this.$info, song);
    _this.song.src = song.url;
    _this.$controller.find('.ico-play').addClass('icon-pause').removeClass('icon-start');

    var lovesNum = Math.floor(Math.random()*200);
    var likesNum = Math.floor(lovesNum + Math.random()*1000);
    var listenedNum = Math.floor(likesNum + Math.random()*5000);
    _this.$info.find('.listened-num').text(listenedNum);
    _this.$info.find('.loves-num').text(lovesNum);
    _this.$info.find('.like-it-num').text(likesNum);
  },
  getMusic: function(albumId, callback){
    var _this = this;
    if(albumId === 'channal_collection'){
      var num = _this.songCollection.length;
      var index = _this.collectionIndex;
      var song = _this.songCollection[index];
      callback && callback(song);
      _this.collectionIndex = _this.collectionIndex + 1 >= num? 0 : _this.collectionIndex + 1; 
    } else {
      $.ajax({
        type: 'GET',
        url: 'https://jirenguapi.applinzi.com/fm/getSong.php?channel=' + albumId,
        dataType: 'json'
      }).done(function(result){
        callback && callback(result.song[0]);
      })
    }
  },
  getLyric: function(){
    var _this = this;
    $.ajax({
      type: 'GET',
      url: 'https://jirenguapi.applinzi.com/fm/getLyric.php?sid=' + _this.songid,
      dataType: 'json'
    }).done(function(result){
      _this.lyricObj = {};
      var lyric = result.lyric;
      var lyricArr = lyric.split('\n');
      lyricArr.forEach(function(line){
        var times = line.match(/\d{2}:\d{2}/g);
        var words = line.replace(/\[\d{2}:\d{2}\.\d{2,}\]/g, '');
        if(times){
          times.forEach(function(time){
            _this.lyricObj[time] = words;
          })
        }
      })
    }).fail(function(){
      _this.lyricObj = {
        '00:01': '当前歌曲暂无歌词'
      };
    })
  },
  renderLyric: function(radio){
    var _this = this;
    // if(Object.keys(_this.lyricObj).length === 0){
    //   _this.lyricObj['00.10'] = "当前歌曲无歌词";
    // }
    var minute = Math.floor(radio.currentTime / 60) + '';
    var second = Math.floor(radio.currentTime) % 60 + '';
    minute = minute.length === 2 ? minute : '0' + minute;
    second = second.length === 2 ? second : '0' + second;
    var curTime = minute + ':' + second;
    for(var key in _this.lyricObj){
      if(key === curTime){
        if(_this.lyricObj[key] !== _this.$info.find('.lyrics').text()){
          _this.$info.find('.lyrics').text(_this.lyricObj[key]);
          _this.$info.find('.lyrics').animateText('fadeIn');
        }
      }
    }
  },
  updateTime: function(radio){
    var _this = this;
    var curPersent = radio.currentTime / radio.duration;
    var sumLength = parseInt(_this.$info.find('.prog-sum').width());
    _this.$info.find('.prog-cur').css('width', Math.floor(curPersent * sumLength) + 'px');
    var minute = Math.floor(radio.currentTime / 60);
    var second = Math.floor(radio.currentTime) % 60 + '';
    second = second.length === 2 ? second : '0' + second;
    _this.$info.find('.cur-time').text(minute + ':' + second);
  },
  removeFromArr: function(Arr, obj){
    var index = Arr.indexOf(obj);
    if(index<0){
      return [];
    }
    return Arr.splice(index, 1);
  }
}

var footer = {
  init: function(){
    // this.isToEnd = false;
    // this.isToBegin = true;
    this.isAnimating = false;
    this.$footer = $('footer');
    this.$container = $('footer').find('div.fig-ct')
    this.$ul = $('footer').find('ul');
    this.$leftBtn = $('footer').find('.icon-shangyige');
    this.$rightBtn = $('footer').find('.icon-xiayige');
    this.bind();
    this.load();
  },
  bind: function(){
    var _this = this;

    // 右滚动条
    _this.$rightBtn.on('click', function(){
      if (_this.isAnimating) {
        return;
      }
      var sumWidth = _this.$container.width();
      var liWidth = _this.$ul.find('li').outerWidth(true);
      var scrollLength = Math.floor(sumWidth / liWidth) * liWidth;
      _this.isAnimating = true;
      _this.$ul.animate({
        left: '-=' + scrollLength + 'px'
      }, function(){
        _this.$leftBtn.css('display', 'block');
        var left = parseFloat(_this.$ul.css('left'));
        if (Math.abs(left) + scrollLength >= _this.$ul.width()) {
          _this.$rightBtn.css('display', 'none');
        }
        _this.isAnimating = false;
      });
    });

    // 左滚动条
    _this.$leftBtn.on('click', function(){
      if (_this.isAnimating) {
        return;
      }
      var sumWidth = _this.$container.width();
      var liWidth = _this.$ul.find('li').outerWidth(true);
      var scrollLength = Math.floor(sumWidth / liWidth) * liWidth;
      _this.isAnimating = true;
      _this.$ul.animate({
        left: '+=' + scrollLength + 'px'
      }, function(){
        _this.$rightBtn.css('display', 'block');
        var left = parseFloat(_this.$ul.css('left'));
        if (left + scrollLength >= 0) {
          _this.$leftBtn.css('display', 'none');
        }
        _this.isAnimating = false;
      });
    });

    // 点击专辑封面
    _this.$ul.on('click', 'li', function(){
      if (!$(this).hasClass('active')) {
        eventCenter.fire('album-change', [$(this).find('.cover').attr('data-channel-id'), $(this).find('.cover').attr('data-channel-name')]);
        $(this).addClass('active');
        $(this).siblings('li').removeClass('active');
      }
    });
  },
  render: function(data){
    var _this = this;
    var tpl =
      '<li>'
      + '<div class="cover" data-channel-id="channal_id" data-channel-name="歌单"></div>'
      + '<p>小清新</p>'
      + '</li>';
    data.channels.forEach(function(channel){
      var $tpl = $(tpl);
      $tpl.find('p').text(channel.name);
      $tpl.find('.cover').attr('data-channel-id', channel.channel_id);
      $tpl.find('.cover').attr('data-channel-name', channel.name);
      $tpl.find('.cover').attr('style', 'background-image:url("' + channel.cover_middle + '")');
      _this.$ul.append($tpl);
    });
    var liNum = _this.$ul.find('li').length;
    var width = _this.$ul.find('li').outerWidth(true);
    _this.$ul.css('width', liNum * width);
  },
  load: function(){
    var _this = this;
    $.ajax({
      type: 'get',
      url: 'https://jirenguapi.applinzi.com/fm/getChannels.php',
      dataType: 'json'
    }).done(function(result){
      _this.render(result);
    })
  },
}

footer.init();
player.init();

// 静止页面
// 窗口大小改变事件（隐藏或显示下方歌单栏目条）
