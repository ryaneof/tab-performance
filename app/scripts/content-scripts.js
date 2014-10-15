(function() {
  'use strict';
  var sendTiming;

  sendTiming = function() {
    return window.setTimeout(function() {
      var env;
      env = chrome.runtime && chrome.runtime.sendMessage ? 'runtime' : 'extension';
      return chrome[env].sendMessage(window.performance.timing);
    }, 0);
  };

  if (document.readyState === 'complete') {
    sendTiming();
  } else {
    window.addEventListener('load', sendTiming);
  }

}).call(this);
