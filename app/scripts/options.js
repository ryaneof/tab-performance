(function() {
  'use strict';
  var $, storageOptionKey;

  storageOptionKey = 'option';

  $ = window.$;

  chrome.storage.local.get(storageOptionKey, function(data) {
    var metricsKey;
    metricsKey = data[storageOptionKey];
    $('input[name=metrics][value=' + metricsKey + ']').prop('checked', true);
    data[storageOptionKey] = metricsKey;
    return chrome.storage.local.set(data);
  });

  $('#btnSaveOptions').on('click', function() {
    chrome.storage.local.get(storageOptionKey, function(data) {
      data[storageOptionKey] = $('input[name=metrics]:checked').val();
      chrome.storage.local.set(data);
      return $('#formInfo').removeClass().addClass('alert alert-success').html('Options Saved!').show();
    });
    return false;
  });

}).call(this);
