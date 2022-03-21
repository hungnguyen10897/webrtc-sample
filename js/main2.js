/*
*  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

var merger = new VideoStreamMerger({width: 480, height:270})

var mp4Element1 = document.createElement('video')
var mp4Element2 = document.createElement('video')
var mp4Element3 = document.createElement('video')
var mp4Element4 = document.createElement('video')

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

const rightVideo = document.querySelector('#output');

let stream1;
let stream2;
let stream3;
let stream4;

let pc1;
let pc2;
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

let startTime;

function maybeCreateStream() {
  stream1 = mp4Element1.captureStream();
  stream2 = mp4Element2.captureStream();
  stream3 = mp4Element3.captureStream();
  stream4 = mp4Element4.captureStream();

  // Try setting resolution, doesn't work
  // stream1.getVideoTracks().forEach(track => {
  //   track.applyConstraints({
  //     width: {exact: 10},
  //     height: {exact: 10},
  //     frameRate: {exact: 10}
  //   });
  // });

  merger.addStream(stream1, {
    x: 0,
    y: 0,
    width: 120,
    height: 270,
    mute: false,
    draw: function (ctx, frame, done) {
      ctx.drawImage(frame, 0, 0, 120, 270)
      stream1.getVideoTracks().forEach(track => {
        const constraints = track.getConstraints()
        var str = JSON.stringify(constraints);
        console.log(`#### ${str}`)
      });
      done()
    }
  })

  merger.addStream(stream2, {
    x: 120,
    y: 0,
    width: 120,
    height: 270,
    mute: false,
    draw: function (ctx, frame, done) {
      // Try setting resolution, doesn't work
      // stream2.getVideoTracks().forEach(track => {
      //   track.applyConstraints({
      //     width: 10,
      //     height: 10,
      //     frameRate: {exact: 10}
      //   });
      // });
      ctx.drawImage(frame, 120, 0, 120, 270)
      done()
    }
  })

  merger.addStream(stream3, {
    x: 240,
    y: 0,
    width: 120,
    height: 270,
    mute: false,
    draw: function (ctx, frame, done) {
      // Try setting resolution, doesn't work
      // stream3.getVideoTracks().forEach(track => {
      //   track.applyConstraints({
      //     width: 10,
      //     height: 10,
      //     frameRate: {exact: 10}
      //   });
      // });
      ctx.drawImage(frame, 240, 0, 120, 270)
      done()
    }
  })

  merger.addStream(stream4, {
    x: 360,
    y: 0,
    width: 120,
    height: 270,
    mute: false,
    draw: function (ctx, frame, done) {
      // Try setting resolution, doesn't work
      // stream4.getVideoTracks().forEach(track => {
      //   track.applyConstraints({
      //     width: 10,
      //     height: 10,
      //     frameRate: {exact: 10}
      //   });
      // });
      ctx.drawImage(frame, 360, 0, 120, 270)
      done()
    }
  })

  merger.start()

  console.log('Captured stream1 from leftVideo with captureStream',
      stream1);
  call();
}

maybeCreateStream();

mp4Element1.loop = true
mp4Element1.play()

mp4Element2.loop = true
mp4Element2.play()

mp4Element3.loop = true
mp4Element3.play()

mp4Element4.loop = true
mp4Element4.play()

rightVideo.onloadedmetadata = () => {
  console.log(`Remote video videoWidth: ${rightVideo.videoWidth}px,  videoHeight: ${rightVideo.videoHeight}px`);
};

rightVideo.onresize = () => {
  console.log(`Remote video size changed to ${rightVideo.videoWidth}x${rightVideo.videoHeight}`);
  // We'll use the first onresize callback as an indication that
  // video has started playing out.
  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
    startTime = null;
  }
};

function call() {
  console.log('Starting call');
  startTime = window.performance.now();
  const videoTracks = stream1.getVideoTracks();
  const audioTracks = stream1.getAudioTracks();
  if (videoTracks.length > 0) {
    console.log(`Using video device: ${videoTracks[0].label}`);
  }
  if (audioTracks.length > 0) {
    console.log(`Using audio device: ${audioTracks[0].label}`);
  }
  const servers = null;
  pc1 = new RTCPeerConnection(servers);
  console.log('Created local peer connection object pc1');
  pc1.onicecandidate = e => onIceCandidate(pc1, e);
  pc2 = new RTCPeerConnection(servers);
  console.log('Created remote peer connection object pc2');
  pc2.onicecandidate = e => onIceCandidate(pc2, e);
  pc1.oniceconnectionstatechange = e => onIceStateChange(pc1, e);
  pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);
  pc2.ontrack = gotRemoteStream;

  let newStream = merger.result

  newStream.getTracks().forEach(track => pc1.addTrack(track, newStream));

  console.log('Added local newStream to pc1');
  console.log('pc1 createOffer start');
  pc1.createOffer(onCreateOfferSuccess, onCreateSessionDescriptionError, offerOptions);
}

function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
}

function onCreateOfferSuccess(desc) {
  console.log(`Offer from pc1
${desc.sdp}`);
  console.log('pc1 setLocalDescription start');
  pc1.setLocalDescription(desc, () => onSetLocalSuccess(pc1), onSetSessionDescriptionError);
  console.log('pc2 setRemoteDescription start');
  pc2.setRemoteDescription(desc, () => onSetRemoteSuccess(pc2), onSetSessionDescriptionError);
  console.log('pc2 createAnswer start');
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  pc2.createAnswer(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
  console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc) {
  console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
  console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(event) {
  if (rightVideo.srcObject !== event.streams[0]) {
    rightVideo.srcObject = event.streams[0];
    console.log('pc2 received remote stream', event);
  }
}

function onCreateAnswerSuccess(desc) {
  console.log(`Answer from pc2:
${desc.sdp}`);
  console.log('pc2 setLocalDescription start');
  pc2.setLocalDescription(desc, () => onSetLocalSuccess(pc2), onSetSessionDescriptionError);
  console.log('pc1 setRemoteDescription start');
  pc1.setRemoteDescription(desc, () => onSetRemoteSuccess(pc1), onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
  getOtherPc(pc).addIceCandidate(event.candidate)
      .then(
          () => onAddIceCandidateSuccess(pc),
          err => onAddIceCandidateError(pc, err)
      );
  console.log(`${getName(pc)} ICE candidate: 
${event.candidate ?
    event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess(pc) {
  console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
  console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc, event) {
  if (pc) {
    console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
    console.log('ICE state change event: ', event);
  }
}

function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}
