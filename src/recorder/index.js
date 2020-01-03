let localStream;
let recorder;
let recordChunk;
const fs = require('fs');

navigator.mediaDevices.getUserMedia({
  video: true
}).then(stream => {
  localStream = stream;
  preview.srcObject = stream;
});

function startRecording () {
  console.log('start recording');
  recorder = new MediaRecorder(localStream);
  recorder.ondataavailable = e => {
    recordChunk.push(e.data);
  };
  recordChunk = [];
  recorder.start(1000);
}

function stopRecording () {
  console.log('stop recording')
  recorder.stop();
  const blob = new Blob(recordChunk, {
    type: 'video/webm'
  });
  const reader = new FileReader(blob);
  reader.onload = () => saveToFile(getFileName(), reader.result);
  reader.readAsArrayBuffer(blob);
}

function saveToFile(fileName, arrayBuffer) {
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFile(fileName, buffer, err => {
    if (err) {
      alert("An error ocurred creating the file " + err.message);
    }
  });
}

function getFileName() {
  const dt = new Date();
  return `rec_${[
    dt.getFullYear(),
    dt.getMonth() + 1,
    dt.getDate(),
    dt.getHours(),
    dt.getMinutes(),
    dt.getSeconds(),
    dt.getMilliseconds()
  ].map(val => ('0' + val).slice(-2))}.webm`;
}

btnRecord.onclick = function() {
  const status = this.getAttribute('data-status');
  if (status === 'START') {
    startRecording();
    this.setAttribute('data-status', 'STOP');
  } else {
    stopRecording();
    this.setAttribute('data-status', 'START');
  }
};

