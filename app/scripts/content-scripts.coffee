'use strict';

sendTiming = ->
  # console.log window.performance.timing
  window.setTimeout(() ->
    env = if chrome.runtime and chrome.runtime.sendMessage then 'runtime' else 'extension'
    chrome[env].sendMessage window.performance.timing
  , 0)

if document.readyState is 'complete'
  sendTiming()
else
  window.addEventListener('load', sendTiming)
