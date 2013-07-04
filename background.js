var resetDefaultSuggestion = function() {
  chrome.omnibox.setDefaultSuggestion({
    description: 'compass: Search the Compass documentation for %s'
  });
}

resetDefaultSuggestion();

var searchSuggestions = function(str, obj) {
  var regex = new RegExp('^' + str, "i");
  var suggestionsArray = [];
  
  for (var key in obj) {
    var arr = obj[key];
    for (var i=0; i < arr.length; i++) {
      //console.log(arr[i]['path']);
      if (arr[i]['name'].match(regex)) {
        suggestionsArray.push(arr[i]);
      }
    }
  }
  return suggestionsArray;
};

var searchSuggestionCategory = function(str, obj) {
  var category;
  for (var key in obj) {
    var arr = obj[key];
    for (var i=0; i < arr.length; i++) {
      if (arr[i]['name'] === str) {
        category = key;
      }
    }
  }
  return category;
}

chrome.omnibox.onInputChanged.addListener( function(text, suggest) {
  var suggestions = searchSuggestions(text,compassSuggestions);
  var lastSuggestion;

  if (suggestions.length > 5) {
    lastSuggestion = 5;
  }
  else if (suggestions.length > 0) {
    lastSuggestion = suggestions.length;
  }
  else {
    lastSuggestion = 0;
  }

  for (var i=0; i < lastSuggestion; i++) {
    suggest([
      {content: suggestions[i]['name'], description: suggestions[i]['name'] }
    ]);
  }
});

chrome.omnibox.onInputCancelled.addListener( function() {
  resetDefaultSuggestion();
});

var navigate = function(url) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.update(tab.id, {url: url});
  });
}

chrome.omnibox.onInputEntered.addListener( function(text) {
  var categorizedSuggestions;
  var wasSuggested;
  var path;
  var suggestions = searchSuggestions(text,compassSuggestions);

  for (var i=0; i < suggestions.length; i++) {
    if (suggestions[i]['name'] == text) {
      wasSuggested = true;
      path = suggestions[i]['path'];
    }
    else {
      wasSuggested = false;
    }
  }

  if (wasSuggested === true) {
    var category = searchSuggestionCategory(text, compassSuggestions).toLowerCase();
    navigate('http://compass-style.org/reference/compass/' + category + '/' + path);
  }
  else {
    navigate("http://compass-style.org/search/?q=" + text);
  }
});
