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
    for (var i=0; i < arr.length; i++){
      if (arr[i].match(regex)) {
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
      if (arr[i] === str) {
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
      {content: suggestions[i], description: suggestions[i] }
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
  var suggestions = searchSuggestions(text,compassSuggestions);

  for (var i=0; i < suggestions.length; i++) {
    if (suggestions[i] == text) {
      wasSuggested = true;
    }
    else {
      wasSuggested = false;
    }
  }

  if (wasSuggested === true) {
    var category = searchSuggestionCategory(text, compassSuggestions).toLowerCase();
    var text = text.toLowerCase().replace(/ /g,'_');
    navigate('http://compass-style.org/reference/compass/' + category + '/' + text);
  }
  else {
    navigate("http://compass-style.org/search/?q=" + text);
  }
});
