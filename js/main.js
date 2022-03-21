document.querySelector('button').addEventListener('click', function () {
  var merger = new VideoStreamMerger({width: 480, height:270})

  var mp4Element1 = document.createElement('video')
  var mp4Element2 = document.createElement('video')
  var mp4Element3 = document.createElement('video')
  var mp4Element4 = document.createElement('video')

  mp4Element1.playsinline = true;
  mp4Element2.playsinline = true;
  mp4Element3.playsinline = true;
  mp4Element4.playsinline = true;

  mp4Element1.muted = true
  mp4Element2.muted = true
  mp4Element3.muted = true
  mp4Element4.muted = true

  mp4Element1.src = "video/p1.mp4"
  mp4Element2.src = "video/p2.mp4"
  mp4Element3.src = "video/p3.mp4"
  mp4Element4.src = "video/p4.mp4"

  mp4Element1.autoplay = true
  mp4Element2.autoplay = true
  mp4Element3.autoplay = true
  mp4Element4.autoplay = true

  mp4Element1.loop = true
  mp4Element1.play()

  mp4Element2.loop = true
  mp4Element2.play()

  mp4Element3.loop = true
  mp4Element3.play()

  mp4Element4.loop = true
  mp4Element4.play()

  var mp4Stream1 = mp4Element1.captureStream()
  var mp4Stream2 = mp4Element2.captureStream()
  var mp4Stream3 = mp4Element3.captureStream()
  var mp4Stream4 = mp4Element4.captureStream()

  // Try setting resolution, doesn't work
  // mp4Stream1.getVideoTracks().forEach(track => {
  //   track.applyConstraints({
  //     width: {exact: 10},
  //     height: {exact: 10},
  //     frameRate: {exact: 1}
  //   });
  // });

  merger.addStream(mp4Stream1, {
    x: 0,
    y: 0,
    width: 120,
    height: 270,
    mute: false,
    draw: function (ctx, frame, done) {
      ctx.drawImage(frame, 0, 0, 120, 270)
      mp4Stream1.getVideoTracks().forEach(track => {
        const constraints = track.getConstraints()
        var str = JSON.stringify(constraints);
        console.log(`#### ${str}`)
      });
      done()
    }
  })

  merger.addStream(mp4Stream2, {
    x: 120,
    y: 0,
    width: 120,
    height: 270,
    mute: false,
    draw: function (ctx, frame, done) {
      // Try setting resolution, doesn't work
      // mp4Stream2.getVideoTracks().forEach(track => {
      //   track.applyConstraints({
      //     width: 10,
      //     height: 10,
      //     frameRate: {exact: 1}
      //   });
      // });
      ctx.drawImage(frame, 120, 0, 100, 270)
      done()
    }
  })

  merger.addStream(mp4Stream3, {
    x: 240,
    y: 0,
    width: 120,
    height: 270,
    mute: false,
    draw: function (ctx, frame, done) {
      // Try setting resolution, doesn't work
      // mp4Stream3.getVideoTracks().forEach(track => {
      //   track.applyConstraints({
      //     width: 10,
      //     height: 10,
      //     frameRate: {exact: 1}
      //   });
      // });
      ctx.drawImage(frame, 240, 0, 120, 270)
      done()
    }
  })

  merger.addStream(mp4Stream4, {
    x: 360,
    y: 0,
    width: 120,
    height: 270,
    mute: false,
    draw: function (ctx, frame, done) {
      // Try setting resolution, doesn't work
      // mp4Stream4.getVideoTracks().forEach(track => {
      //   track.applyConstraints({
      //     width: 10,
      //     height: 10,
      //     frameRate: {exact: 1}
      //   });
      // });
      ctx.drawImage(frame, 360, 0, 120, 270)
      done()
    }
  })

  merger.start()

  var outputElement = document.querySelector('#output')
  outputElement.srcObject = merger.result
  outputElement.autoplay = true
})