(function() {
  'use strict';
  var calcPerfMetrics, defaultMetrics, env, installListener, messageListener, removeListener, storageDataKey, storageKey, storageOptionKey, tabIdKey;

  env = chrome.runtime && chrome.runtime.sendMessage ? 'runtime' : 'extension';

  storageKey = 'metrics';

  storageOptionKey = 'option';

  storageDataKey = 'structure';

  defaultMetrics = 'tabLoad';

  tabIdKey = function(id) {
    return 'tab' + id;
  };

  calcPerfMetrics = function(raw) {
    var init, res;
    res = raw;
    init = !raw.redirectStart ? raw.fetchStart : raw.redirectStart;
    res.init = init;
    res.redirectTime = 0;
    res.redirectSpent = raw.redirectEnd - raw.redirectStart;
    res.domainLookupTime = raw.domainLookupStart - init;
    res.domainLookupSpent = raw.domainLookupEnd - raw.domainLookupStart;
    res.connectTime = raw.connectStart - init;
    res.connectSpent = raw.connectEnd - raw.connectStart;
    res.requestTime = raw.responseStart - init;
    res.requestSpent = raw.responseEnd - raw.responseStart;
    res.responseTime = raw.responseStart - init;
    res.responseSpent = raw.responseEnd - raw.responseStart;
    res.domTime = raw.domLoading - init;
    res.domSpent = raw.domComplete - raw.domLoading;
    res.domContentLoadedEventTime = raw.domContentLoadedEventStart - init;
    res.domContentLoadedEventSpent = raw.domContentLoadedEventEnd - raw.domContentLoadedEventStart;
    res.loadEventTime = raw.loadEventStart - init;
    res.loadEventSpent = raw.loadEventEnd - raw.loadEventStart;
    res.tabLoadSpent = raw.loadEventEnd - init;
    return res;
  };

  messageListener = function(performance, sender) {
    var perf;
    perf = calcPerfMetrics(performance);
    return chrome.storage.local.get([storageKey, storageOptionKey, storageDataKey], function(data) {
      var badgeOpts;
      data[storageKey][tabIdKey(sender.tab.id)] = perf;
      badgeOpts = {
        text: ((perf[data[storageOptionKey] + 'Spent'] / 1000).toPrecision(3) + '').substring(0, 4),
        tabId: sender.tab.id
      };
      chrome.browserAction.setBadgeText(badgeOpts);
      return chrome.storage.local.set(data);
    });
  };

  removeListener = function(tabId) {
    return chrome.storage.local.get(storageKey, function(data) {
      if (data[storageKey]) {
        delete data[storageKey][tabIdKey(tabId)];
      }
      return chrome.storage.local.set(data);
    });
  };

  installListener = function() {
    var data;
    data = {};
    data[storageKey] = {};
    data[storageOptionKey] = defaultMetrics;
    data[storageDataKey] = {
      tabLoad: {
        name: 'Total',
        green: 1000,
        red: 3000
      },
      redirect: {
        name: 'Redirect',
        green: 10,
        red: 1000
      },
      domainLookup: {
        name: 'DNS',
        green: 50,
        red: 1000
      },
      connect: {
        name: 'Connect',
        green: 50,
        red: 1000
      },
      request: {
        name: 'Request',
        green: 50,
        red: 1000
      },
      response: {
        name: 'Response',
        green: 50,
        red: 1000
      },
      dom: {
        name: 'DOM Loading',
        green: 50,
        red: 1000
      },
      domContentLoadedEvent: {
        name: 'DOM Content Loaded Event',
        green: 50,
        red: 1000
      },
      loadEvent: {
        name: 'Load Event',
        green: 50,
        red: 1000
      }
    };
    return chrome.storage.local.set(data);
  };

  chrome[env].onMessage.addListener(messageListener);

  chrome.tabs.onRemoved.addListener(removeListener);

  chrome[env].onInstalled.addListener(installListener);

}).call(this);
