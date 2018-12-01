var eventCenter = {
  on: function(type, handler){
    $(document).on(type, handler);
  },
  fire: function(type, data){
    $(document).trigger(type, data);
  }
}

// example
// eventCenter.on('event1', function(e, data1, data2){
//   console.log(data1, data2);
// })

// eventCenter.fire('event1', ['c1', 'c2']);
