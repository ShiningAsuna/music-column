/**
 * 模板替换组件
 */

var easytpl = {
  /** 
   * append: 根据名称填充数据并append到容器的尾部
   * $container: 要添加到的容器JQ对象
   * $tpl: 每个对象的模板JQ对象
   * data: 接口数据object对象
   */
  append: function($container, $tpl, data){
    $tpl.find('[tpl-data]').each(function(){
      var key = $(this).attr('tpl-data');
      if($(this).prop('tagName').toLowerCase() === 'img'){
        $(this).attr('src', data[key]);
      }
      $(this).text(data[key]);
    });
    $container.append($tpl);
  },

  /**
   * replace: 替换某模板区块内部的各个数据
   */
  replace: function($tpl, data){
    $tpl.find('[tpl-data]').each(function(){
      var key = $(this).attr('tpl-data');
      if($(this).prop('tagName').toLowerCase() === 'img'){
        $(this).attr('src', data[key]);
      }
      $(this).text(data[key]);
    });
  }
};
