var room = '';

window.onload = function() {
  self = document.getElementById('self') || '';
  peer = document.getElementById('peer') || '';
}

SkylinkDemo.on('peerJoined', function(peerId, peerInfo, isSelf) {

  addMessage('User '+peerId+' joined room '+SkylinkDemo._room.id);

  if(isSelf) {
    addMessage('Self joined');
    return;
  }

  addMessage('Peer joined. Sending stream');
  /*
  - Turns on media only when peer joins.
  - enableVideo only makes audio unavailable, vice versa.
  - Therefore utilizing sendStream to re-enable connection
  with both video and audio. 
  */
  SkylinkDemo.sendStream({
    audio: true,
    video: true
  });

  if(!document.getElementById(peerId)) {
    var peervid = document.createElement('video');
    peervid.id = peerId;
    peervid.autoplay = true;
    document.body.appendChild(peervid);
  }

});

SkylinkDemo.on('peerLeft', function(peerId, peerInfo, isSelf) {
  addMessage("Peer left: " + peerId);

  //return to own room;
  if(isSelf) {
    return;
  }

  vid = document.getElementById(peerId);
  if (!vid){
    return;
  }

  document.body.removeChild(vid);
  enter();
});

SkylinkDemo.on('incomingStream', function(peerId, stream, isSelf, peerInfo) {

  //Already attached on mediaAccessSuccess
  if(isSelf) {
    return;
  };

  var peervid = document.getElementById(peerId);
  attachMediaStream(peervid, stream);
});

//Create own video element and attach stream to it
SkylinkDemo.on('mediaAccessSuccess', function(stream) {
  if(!document.getElementById('myvideo')) {
    var myvid = document.createElement('video');
    myvid.id = 'myvideo';
    myvid.autoplay = true;
    document.body.appendChild(myvid);
  }
  var myvid = document.getElementById('myvideo');
  attachMediaStream(myvid, stream);
});

function enter() {
  room = self.value;
  SkylinkDemo.joinRoom(room, {
    audio: false,
    video: false
  });
}

function call() {

  room = peer.value;

  /*
  (A) Join peer (B)'s room without mediastream.
  From room owner (B) 's perspective: 
  - Peer A joins room B --> B sends his own media stream
  From peer (A) 's perspective:
  - A joins a new room --> no triggering of A's own stream since A is self
  - However when A joins room B, a 3rd peer also joins B --> trigger sendStream(A's stream)
  - Therefore no need to trigger media when calling. Otherwise will cause duplicate.
  Using the "side effect" (3rd peer) to accomplish stream accessibility.
  */
  SkylinkDemo.joinRoom(room, {
    audio: false,
    video: false
  });
}

function stop() {
  SkylinkDemo.leaveRoom();

  SkylinkDemo.sendMessage('stop');
}

function setName() {
  SkylinkDemo.setUserData(self.value);
}

function clean() {
  var status = document.getElementById('status');
  while(status.hasChildNodes()) {
    status.removeChild(status.firstChild);
  }
}

function enterAndUpdate() {
  enter();
}

function addMessage(message, peer, room, name) {
  var mapObj = {
    _peer: peer,
    _room: room,
    _name: name
  }

  message = message.replace(/_peer|_room|_name/gi, function(matched) {
    return mapObj[matched];
  });

  var status = document.getElementById('status');
  div = document.createElement('div');
  div.innerHTML = message;
  status.appendChild(div);
}
