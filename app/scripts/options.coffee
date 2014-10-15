'use strict';

storageOptionKey = 'option'
$ = window.$

# init form data
chrome.storage.local.get(storageOptionKey, (data) ->
  metricsKey = data[storageOptionKey]
  $('input[name=metrics][value=' + metricsKey + ']').prop('checked', true)
  data[storageOptionKey] = metricsKey
  chrome.storage.local.set(data)
)

# init form submit
$('#btnSaveOptions').on('click', () ->  

  chrome.storage.local.get(storageOptionKey, (data) ->
    data[storageOptionKey] = $('input[name=metrics]:checked').val()
    chrome.storage.local.set(data)

    $('#formInfo').removeClass()
                  .addClass('alert alert-success')
                  .html('Options Saved!')
                  .show();
  )

  return false
)

