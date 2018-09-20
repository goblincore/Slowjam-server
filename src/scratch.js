'use strict';

let id ='6OjVJyYE70k';
let videoUrls=`http://www.youtube.com/get_video_info?video_id=${id}&el=embedded&ps=default&eurl=&gl=US&hl=en`;


videoUrls
.split(',')
  .map(item => item
    .split('&')
    .reduce((prev, curr) => (curr = curr.split('='),
      Object.assign(prev, {[curr[0]]: decodeURIComponent(curr[1])})
    ), {})
  )
  .reduce((prev, curr) => Object.assign(prev, {
    [curr.quality + ':' + curr.type.split(';')[0]]: curr
  }), {});
console.log(videoUrls);