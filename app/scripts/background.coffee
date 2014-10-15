'use strict';

env = if chrome.runtime and chrome.runtime.sendMessage then 'runtime' else 'extension'

storageKey = 'metrics'
storageOptionKey = 'option'
storageDataKey = 'structure'
defaultMetrics = 'tabLoad'

tabIdKey = (id) -> 'tab' + id

# calc metrics
calcPerfMetrics = (raw) ->
  res = raw

  init = if !raw.redirectStart then raw.fetchStart else raw.redirectStart

  res.init = init
  res.redirectTime = 0
  res.redirectSpent = raw.redirectEnd - raw.redirectStart
  res.domainLookupTime = raw.domainLookupStart - init
  res.domainLookupSpent = raw.domainLookupEnd - raw.domainLookupStart
  res.connectTime = raw.connectStart - init
  res.connectSpent = raw.connectEnd - raw.connectStart
  res.requestTime = raw.responseStart - init
  res.requestSpent = raw.responseEnd - raw.responseStart
  res.responseTime = raw.responseStart - init
  res.responseSpent = raw.responseEnd - raw.responseStart
  res.domTime = raw.domLoading - init
  res.domSpent = raw.domComplete - raw.domLoading
  res.domContentLoadedEventTime = raw.domContentLoadedEventStart - init
  res.domContentLoadedEventSpent = raw.domContentLoadedEventEnd - raw.domContentLoadedEventStart
  res.loadEventTime = raw.loadEventStart - init
  res.loadEventSpent = raw.loadEventEnd - raw.loadEventStart
  res.tabLoadSpent = raw.loadEventEnd - init
  
  return res

# on page loaded, apply calc metrics
messageListener = (performance, sender) ->
  perf = calcPerfMetrics(performance)
  
  chrome.storage.local.get([
    storageKey, 
    storageOptionKey, 
    storageDataKey
  ], (data) ->  
    data[storageKey][tabIdKey(sender.tab.id)] = perf
    
    badgeOpts = 
      text: ((perf[data[storageOptionKey] + 'Spent'] / 1000).toPrecision(3) + '').substring(0, 4)
      tabId: sender.tab.id

    chrome.browserAction.setBadgeText(badgeOpts)
    chrome.storage.local.set(data)
  )

# on tab removed
removeListener = (tabId) ->
  chrome.storage.local.get(storageKey, (data) ->
    if data[storageKey]
      delete data[storageKey][tabIdKey(tabId)]

    chrome.storage.local.set(data)
  )

# init data strcture, default metrics
installListener = () ->
  data = {}

  data[storageKey] = {}
  data[storageOptionKey] = defaultMetrics
  data[storageDataKey] = 
    tabLoad: 
      name: 'Total'
      green: 1000
      red: 3000
    redirect: 
      name: 'Redirect'
      green: 10
      red: 1000
    domainLookup:
      name: 'DNS'
      green: 50
      red: 1000
    connect:
      name: 'Connect'
      green: 50
      red: 1000
    request:
      name: 'Request'
      green: 50
      red: 1000
    response:
      name: 'Response'
      green: 50
      red: 1000
    dom:
      name: 'DOM Loading'
      green: 50
      red: 1000
    domContentLoadedEvent:
      name: 'DOM Content Loaded Event'
      green: 50
      red: 1000
    loadEvent:
      name: 'Load Event'
      green: 50
      red: 1000

  chrome.storage.local.set(data)

# add event listeners

chrome[env].onMessage.addListener(messageListener)
chrome.tabs.onRemoved.addListener(removeListener)
chrome[env].onInstalled.addListener(installListener)

