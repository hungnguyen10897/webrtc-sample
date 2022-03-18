// we need to "warm up" the AudioContext with a user event
document.querySelector('button').addEventListener('click', function () {
  var merger = new VideoStreamMerger()

  var mp4Element = document.createElement('video')
  var aacElement = document.createElement('audio')

  mp4Element.playsinline = true;
  aacElement.playsinline = true;

  mp4Element.muted = true
  aacElement.muted = true

  mp4Element.src = "video/sample.mp4"
  aacElement.src = "video/sample.aac"

  mp4Element.autoplay = true
  aacElement.autoplay = true

  mp4Element.loop = true
  mp4Element.play()

  var count = 100

  var aacStream = aacElement.captureStream()
  var mp4Stream = mp4Element.captureStream()

  // merger.addMediaElement('aac', aacElement)
  // merger.addMediaElement('mp4', mp4Element, {
  //   mute: true,
  //   draw: function (ctx, frame, done) {
  //     count++
  //     ctx.drawImage(frame, merger.width / 2 - count / 2, merger.height / 2 - count / 2, count, count)
  //     done()
  //   }
  // })

  merger.addStream(aacStream)
  merger.addStream(mp4Stream, {
    mute: true,
    draw: function (ctx, frame, done) {
      count++
      ctx.drawImage(frame, merger.width / 2 - count / 2, merger.height / 2 - count / 2, count, count)
      done()
    }
  })

  merger.start()

  var outputElement = document.querySelector('#output')
  outputElement.srcObject = merger.result
  outputElement.autoplay = true
})