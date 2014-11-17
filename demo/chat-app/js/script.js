/***********************************************************************************************

 Filename: script.js
 Description: Root Controller - Skylink Demo
 Author: Leticia Choo <leticia.choo@temasys.com.sg>
 Contributors:
 Created: 17/11/2014

 Notes:

 Copyright: (c) 2014 Temasys Communications Pte Ltd - All Rights Reserved

 This Web-site and its contents are subject to copyright protection under the
 laws of Singapore and, through international treaties, other countries. The
 copyright in the contents and materials available on this Web-site as a whole
 is owned by Temasys Communications Pte Ltd. However, the copyright in some
 contents and materials incorporated within this Web-site may be owned by
 third parties where so indicated.

 No part of the contents or materials available on this Web-site may be
 reproduced, licensed, sold, published, transmitted, modified, adapted,
 publicly displayed, broadcast (including storage in any medium by
 electronic means whether or not transiently for any purpose save as
 permitted herein) without the prior written permission of
 Temasys Communications. You may view this Web-site and its contents using
 your Web browser and save an electronic copy, or print out a copy, of parts
 of this Web site solely for your own information, research or study, provided
 you (a) do not modify the copy from how it appears in this Web-site; and (b)
 include the copyright notice "Temasys Communications Pte Ltd" on such copy.

 Temasys logos and product logos should never be removed from pages on
 which they originally appear. Temasys Communications webpages should always
 appear exactly as posted without variation, unless the prior written
 approval of Temasys Communications is obtained.

 You must not otherwise exercise the copyright in the whole or any part of the
 contents and materials in this Web-site for any other purpose except as
 expressly permitted by any applicable law or with
 Temasys Communications prior written consent.

 ***********************************************************************************************/

// use strict
'use strict';

// mobile hack - touch to simulate hover
angular.element('body').on('touchstart', function() {});

angular.module('Skylink', []);

angular.module('Skylink').controller('RoomController', function ($location, $scope) {
  var _this = this;

  _this.Skylink = new Skylink();

  /** Variables **/
  // in lobby
  _this.inLobby = false;

  // current page
  _this.currentPage = $location.hash();

  // list of active pages
  _this.activePages = {
    lobby: '',
    profile: ''
  };

  // list of active chats
  _this.activeChats = {
    lobby: ''
  };

  // list of unread chats
  _this.unreadChats = {
    lobby: 0
  };

  // self information
  _this.self = {};

  // current apikey
  _this.apiKey = '5f874168-0079-46fc-ab9d-13931c2baa39';

  // current username
  _this.username = '';

  // the peers
  _this.peers = [];

  // the chats
  _this.chats = {
    lobby: []
  };

  // the curent chat
  _this.currentChat = '';

  // the current room
  _this.currentRoom = '';

  // Room ready
  _this.ready = false;

  // current join room impl
  _this.joinRoomImpl = function () { };


  /** Skylink events **/
  _this.Skylink.on('readyStateChange', function (state) {
    if (state === _this.Skylink.READY_STATE_CHANGE.COMPLETED) {
      _this.ready = true;
      console.info('ready', _this.joinRoomImpl);
      _this.joinRoomImpl();
    }
  });

  /** Peer events **/
  _this.Skylink.on('peerJoined', function (peerId, peerInfo, isSelf) {
    if (isSelf) {
      if (_this.Skylink._selectedRoom === _this.apiKey) {
        _this.inLobby = true;
        // redirect to lobby
        $location.hash('lobby');
      } else {
        _this.inRoom = true;
      }
      // set the user information
      _this.self = {
        id: peerId,
        data: peerInfo
      };
    } else {
      // push a new peer
      _this.peers.push({
        id: peerId,
        data: peerInfo
      });
      // add chat
      _this.activeChats[peerId] = '';
      _this.unreadChats[peerId] = 0;
    }
  });

  _this.Skylink.on('peerLeft', function (peerId, peerInfo, isSelf) {
    for (var i = 0; i < _this.peers.length; i++) {
      if (_this.peers[i].id === peerId) {
        _this.peers.splice(i, 1);
      }
    }
    delete _this.activeChats[peerId];
    delete _this.unreadChats[peerId];
  });

  _this.Skylink.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
    if (message.isPrivate) {
      var targetPeerId = (isSelf) ? message.targetPeerId : peerId;
      // prevent undefined error
      _this.chats[targetPeerId] = _this.chats[targetPeerId] || [];

      _this.chats[targetPeerId].push({
        username: peerInfo.userData.username,
        message: message.content,
        timestamp: (new Date())
      });
      _this.unreadChats[targetPeerId] += 1;
    } else {
      _this.chats.lobby.push({
        username: peerInfo.userData.username,
        message: message.content,
        timestamp: (new Date())
      });
      _this.unreadChats.lobby += 1;
    }
  });


  /** Methods **/
  _this.joinLobby = function () {
    // inits the skylink
    _this.joinRoomImpl = function () {
      _this.Skylink.joinRoom({
        userData: {
          username: _this.username,
          timestamp: (new Date())
        }
      });
    };
    _this.Skylink.init(_this.apiKey);
  };

  _this.leaveRoom = function () {
    _this.Skylink.leaveRoom();
    _this.peers = [];
    _this.unreadChats = {
      lobby: 0
    };
    _this.chats = {
      lobby: []
    };
    _this.inLobby = false;
    _this.inRoom = false;
    $location.hash('');
  };

  _this.joinRoom = function (peerId) {
    _this.Skylink.joinRoom(peerId);
  };

  _this.sendMessage = function () {
    _this.Skylink.sendMessage(_this.messageContent, _this.currentChat);
    _this.messageContent = '';
  };

  _this.setActivePage = function () {
    var currentHash = _this.currentPage.replace('#', '').split('!!')[0];

    angular.forEach(_this.activePages, function(value, key) {
      if (key === currentHash) {
        _this.activePages[key] = 'active';
      } else {
        _this.activePages[key] = '';
      }
    });
  };

  _this.setUnreadChats = function () {
    angular.forEach(_this.unreadChats, function(value, key) {
      if (!_this.currentChat) {
        if (key === 'lobby') {
          _this.unreadChats[key] = 0;
        }
      } else {
        if (_this.currentChat === key) {
          _this.unreadChats[key] = 0;
        }
      }
    });
    window.unreadChats = _this.unreadChats;
  };

  _this.setActiveChat = function () {
    var peerId = $location.hash().split('!!')[1];

    angular.forEach(_this.activeChats, function(value, key) {
      if (peerId) {
        if (peerId === key) {
          _this.activeChats[key] = 'active';
          _this.currentChat = key;
        } else {
          _this.activeChats[key] = '';
        }
      } else {
        if (key === 'lobby') {
          _this.activeChats[key] = 'active';
          _this.currentChat = '';
        } else {
          _this.activeChats[key] = '';
        }
      }
    });
  };

  // set interval
  setInterval(function () {
    _this.currentPage = $location.hash();
    _this.setActivePage();
    _this.setActiveChat();
    _this.setUnreadChats();
    $scope.$apply();
  }, 500);
});


angular.module('Skylink').directive('ngEnter', function () {
  return function ($scope, $element, $attrs) {
    $element.bind('keydown keypress', function (event) {
      if(event.which === 13) {
        $scope.$apply(function (){
          $scope.$eval($attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});

$(document).ready(function () {
  function resizeChat () {
    $('.chat-panel').css('height', ($(window).height() - 71 - 41 - 55 - 35) + 'px');
    $('.chat-panel').css('max-height', ($(window).height() - 71 - 41 - 55 - 35) + 'px');
  }
  $(window).resize(resizeChat);
  resizeChat();
});