function noop() {
  return false;
}

function popup(mylink, windowname) {
  return popupSize(mylink, windowname, 400, 200);
}

function popupSize(mylink, windowname, width, height) {
  var href;
  if (typeof (mylink) == "string") {
    href = mylink;
  } else {
    href = mylink.href;
  }

  var w = window.open(href, windowname, "width=" + width + ",height=" + height
      + ",scrollbars=yes,resizable=yes");
  w.focus();
  w.moveTo(300, 200);
  return false;
}

function loadFrame(el) {
  el = jQuery(el);
  el.load(el.data("src"));
  return false;
}
function findTarget(el) {
  el = jQuery(el);
  var target = el.data("target");
  if(target) {
    return target;
  }
  
  target = el.attr("target");
  if (!target) {
    target = "main";

    var parents = el.parents("[data-target]");
    if (parents.length > 0) {
      target = jQuery(parents[0]).data("target");
    }
  }
  return target;
}
function loadInFrame(el, href) {
  el = jQuery(el);
  target = findTarget(el);
  jQuery("." + target).load(href);

}

function submitForm(el, msg) {
  el = jQuery(el);

  var form = el;
  if (el.length == 1 && el[0].tagName.toLowerCase() != 'form') {
    form = el.parents('form');
  }

  var action = form.attr("action");
  var success = function(data) {
    target = findTarget(el);
    jQuery("." + target).html(data);
    if(msg) {
      var statusMessage = jQuery("." + target).find(".statusMessage").html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + msg).addClass("alert alert-success alert-dismissable");
    }
  };
  var fail = function(jqXHR, textStatus, errorThrown) {
    var statusMessage = jQuery("." + target).find(".statusMessage").html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + errorThrown).addClass("alert alert-danger alert-dismissable");
  };
  
  try {
  if (form.attr('enctype') && form.attr('enctype').indexOf('multipart') === 0) {
    var formData = new FormData(form[0]);
    console.log(formData);
    $.ajax({
      url: action,
      type: 'POST',
      data: formData,
      async: false,
      cache: false,
      contentType: false,
      processData: false
    }).done(success).fail(fail);
  } else {
    jQuery.post(action, form.serialize(), success).fail(fail);    
  }
  } catch(e) {
    console.trace(e);
  }
  
  

  return false;
}
function search(el, page) {
  try {
    el = jQuery(el);

    var form = el;
    if (el.length == 1 && el[0].tagName.toLowerCase() != 'form') {
      form = el.parents('form');
    }
    var data = form.serialize();
    if (!page) {
      page = 0;
    }
    data += "&page=" + page;
    jQuery('#songs').load('advancedSearchResult.view?' + data);
    window.scrollTo(0, 0);
  } catch(e) {
    window.console.log(e);
  }
  return false;
}
function dwrErrorHandler(msg, exc) {
  window.console.trace();
  window.console.log(msg);
  window.console.log(exc);
}

function changeClass(elem, className1, className2) {
  elem.className = (elem.className == className1) ? className2 : className1;
}
function playGenreRadio() {
  var genres = new Array();
  var e = document.getElementsByTagName("span");
  for ( var i = 0; i < e.length; i++) {
    if (e[i].className == "on") {
      genres.push(e[i].firstChild.data.trim());
    }
  }
  window.console.log(genres);
  onPlayGenreRadio(genres);
  return false;
}
var chooseDevice_modal_tmpl = '<div class="modal fade" id="chooseDeviceModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
'  <div class="modal-dialog">' +
'    <div class="modal-content">' +
'      <div class="modal-header">' +
'        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
'        <h4 class="modal-title" id="myModalLabel">{{title}}</h4>' +
'      </div>' +
'      <div class="modal-body">' +
'        <select id="chooseDeviceSelect">' +
'          {{#devices}}' + 
'            <option value="{{serial}}">{{name}}</option>' +
'          {{/devices}}' +
'        </select>' +
'      </div>' +
'      <div class="modal-footer">' +
'        <button type="button" class="btn btn-primary" onclick="return saveDevice(this);">Ok</button>' +
'        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
'      </div>' +
'    </div>' +
'  </div>' +
'</div>'
function chooseDevice(response) {
  var devices = [];
  jQuery.each(response, function(key, value) {
    devices[devices.length] = {"serial": key, "name": value};
  });
  if(jQuery("#chooseDeviceModal").length == 0) {
    jQuery(Mustache.render(chooseDevice_modal_tmpl, {"title": "Choose Device", "devices": devices})).modal();
  } else {
    jQuery("#chooseDeviceModal").modal("show");
  }
}
function saveDevice() {
  jQuery("#deviceName").val(jQuery("#chooseDeviceSelect").val());
  jQuery("#chooseDeviceModal").modal("hide");
  return true;
}


var app = (function() {
  $ = this.jQuery;
  var module = {};
  
  module.pleaseWaitDiv = $('<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false"><div class="modal-header"><h1>Loading...</h1></div><div class="modal-body"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div></div>');
  module.showPleaseWait = function() {
          module.pleaseWaitDiv.modal();
  };
  module.hidePleaseWait = function () {
          module.pleaseWaitDiv.modal('hide');
  };
  
  module.loadMain = function(path, type, data) {
    if(!type) {
      type = 'GET';
    }
    module.loadIndex(true);
    try {
      module.showPleaseWait();
    $.when($.ajax( path, {type: type, data: data})).then(function( data, textStatus, jqXHR ) {
      try {
        jQuery('div.left').hide();
        jQuery('div.main').html(data);
        module.hidePleaseWait();
      } catch(e) {
        console.trace(e);
      }
    });
    } catch(e) {
      window.console.log.error(e);
    }
  }
  
  module.loadLeft = function(params) {
    if(!params) {
      params = "";
    }
    $.when( $.ajax( "left.view" + params ) ).then(function( data, textStatus, jqXHR ) {
      jQuery('div.left').html(data);
    });
    return false;
  }
  
  module.loadIndex = function(skipMain) {
    
    if($('div.upper').html().trim() != "") {
      return;
    }
    window.console.log("Loading everything");
    $.when( $.ajax( "top.view" ) ).then(function( data, textStatus, jqXHR ) {
      jQuery('div.upper').html(data);
    });
    module.loadLeft();
    $.when( $.ajax( "right.view" ) ).then(function( data, textStatus, jqXHR ) {
      jQuery('div.right').html(data);
    });
    if(!skipMain) {
      module.loadMain("nowPlaying.view");
    }
    module.reloadPlaylist("playlist.view");
  };
  
  module.reloadPlaylist = function(view) {
    $.when( $.ajax( view ) ).then(function( data, textStatus, jqXHR ) {
      jQuery('div.playlist').html(data);
    });    
  };

  module.loadArtist = function(params) {
    module.loadIndex(true);
    var url ="artist.view" + params;
    
    // we should test if this is already loaded
    $.when( $.ajax( url ) ).then(function( data, textStatus, jqXHR ) {
      jQuery('div.left').hide();
      jQuery('div.main').html(data);
      /*
      // we should do the expansion here
      if(albumId) {
        var id = $('div[data-album="' + albumId + '"]').attr("id").replace("alb", "");
        toggleAlbum(id);
        scrollArtist(artistId);
      }
      */
    });
  }
  module.loadHome = function(query) {
    console.log("Loading home " + query, this);
    var url = "home.view";
    module.loadMain(url + query);
  }
  module.loadGenreByName = function(genre) {
    module.loadGenres(genre, "genre");
  }
  module.loadGenreById = function(genre) {
    module.loadGenres(genre, "genreUtf8Hex");
  }
  module.loadGenres = function(genre, paramName) {
    var url = "genres.view";
    if(genre) {
      url += "?" + paramName + "=" + genre;
    }
    module.loadMain(url);
  }
  module.loadArtistGenres = function(params) {
    var url = "artistGenres.view" + params;
    module.loadMain(url);
  }
  
  module.loadSearchSettings = function(type) {
    var url = "searchSettings.view";
    if(type) {
      url += "?update=" + type;
    }
    module.loadMain(url);
  }
  
  
  module.loadRadio = function() {
    module.loadMain("radio.view");
  }
  module.loadFileTree = function(params) {
    module.loadMain("fileTree.view" + params);
  }
  module.loadPodcastReceiver = function() {
    module.loadMain("podcastReceiver.view");
  }
  module.loadNowPlaying = function() {
    module.loadMain("nowPlaying.view");
  }
  module.loadSettings = function() {
    module.loadMain("settings.view");
  }
  module.loadStatus = function() {
    module.loadMain("status.view");
  }
  module.loadHelp = function() {
    module.loadMain("help.view");
  }
  module.loadPersonalSettings = function() {
    module.loadMain("personalSettings.view");
  }
  module.loadPlayerSettings = function() {
    module.loadMain("playerSettings.view");
  }
  module.loadPasswordSettings = function() {
    module.loadMain("passwordSettings.view");
  }
  module.loadShareSettings = function() {
    module.loadMain("shareSettings.view");
  }
  module.loadMusicCabinetSettings = function() {
    module.loadMain("musicCabinetSettings.view");
  }
  
  module.loadSearch = function(query) {
    window.console.log(query);
    module.loadMain("search.view", 'POST', {query: query});
  }
  
  module.loadPath = function(pathId) {
    module.loadMain("main.view?pathUtf8Hex=" + pathId);
  }
  
  module.genericLoader = function(path) {
    return function() {
      module.loadMain(path);
    };
  }
  module.changeCoverArt = function(albumId, artistId, albumId) {
    var url = "changeCoverArt.view";
    url += "?idUtf8Hex=" + albumId + "&artistIdUtf8Hex=" + artistId + "&albumIdUtf8Hex=" + albumId;
    module.loadMain(url);
  }
  
  module.editTags = function(id, albumId, artistId) {
    var url = "editTags.view";
    url += "?idsUtf8Hex=" + id + "&artistIdUtf8Hex=" + artistId + "&albumIdUtf8Hex=" + albumId;
    module.loadMain(url);
  }
  
  module.createShare = function(id) {
    var url = "createShare.view";
    url += "?idsUtf8Hex=" + id;
    module.loadMain(url);
  };
  
  module.loadPage = function(page, query) {
    window.console.log("Loading page: " + page + ":" + query, this);
    module.loadMain(page + ".view" + query);
  };
  
  module.routes = {
      '/': module.loadIndex,
      '/home(.*)': module.loadHome,
      '/changeCoverArt/idUtf8Hex/:id/artistIdUtf8Hex/:artistId/albumIdUtf8Hex/:albumId': module.changeCoverArt,
      '/editTags/idsUtf8Hex/:id/artistIdUtf8Hex/:artistId/albumIdUtf8Hex/:albumId': module.editTags,
      '/createShare/idsUtf8Hex/:id': module.createShare,
      '/genres(.*)': module.loadGenres,
      '/radio': module.loadRadio,
      '/(fileTree)(.*)': module.loadPage,
      '/podcastReceiver': module.loadPodcastReceiver,
      '/nowPlaying': module.loadNowPlaying,
      '/settings': module.loadSettings,
      '/status': module.loadStatus,
      '/help': module.loadHelp,
      '/more': module.loadMore,
      '/missingAlbums': module.genericLoader('missingAlbums.view'),
      '/generalSettings': module.genericLoader('generalSettings.view'),
      '/advancedSettings': module.genericLoader('advancedSettings.view'),
      '/userSettings': module.genericLoader('userSettings.view'),
      '/networkSettings': module.genericLoader('networkSettings.view'),
      '/transcodingSettings': module.genericLoader('transcodingSettings.view'),
      '/internetRadioSettings': module.genericLoader('internetRadioSettings.view'),
      '/podcastSettings': module.genericLoader('podcastSettings.view'),
      '/(setRating)(.*)': module.loadPage,
      '/tagSettings': module.genericLoader('tagSettings.view'),
      '/searchSettings': module.loadSearchSettings,
      '/searchSettings/update/:type': module.loadSearchSettings,
      '/mediaFolderSettings': module.genericLoader('mediaFolderSettings.view'),
      '/personalSettings': module.loadPersonalSettings,
      '/passwordSettings': module.loadPasswordSettings,
      '/playerSettings': module.loadPlayerSettings,
      '/shareSettings': module.loadShareSettings,
      '/musicCabinetSettings': module.loadMusicCabinetSettings,
      '/artistGenres(.*)': module.loadArtistGenres,
      '/artist/idUtf8Hex/:id': module.loadArtist,
      '/search/query/(.*)': module.loadSearch,
      '/(groupSettings)(.*)': module.loadPage,
      '/(loadPlaylistConfirm)(.*)': module.loadPage,
      '/artist(.*)': module.loadArtist,
      '/main/pathUtf8Hex/:path_id': module.loadPath
  };
  return module;
})();
function loadLeft(params) {
  return app.loadLeft(params);
}
function scrollLetter(letter) {
  var parent = jQuery('div.left div.inner-scroll');
  parent.scrollTop(0);
  // 220 is magic and should be fixed.
  parent.scrollTop(jQuery("a[name=" + letter + "]").offset().top - 220);
  return false;
}
function scrollArtist(uri) {
  var parent = jQuery('div.left div.inner-scroll');
  parent.scrollTop(0);
  // 220 is magic and should be fixed.
  window.console.log(uri);
  parent.scrollTop(jQuery("a[data-artist=" + uri + "]").offset().top - 228);
}
function toggleLeft() {
  jQuery('div.left').show();
  jQuery('div.left').height($('body').height() - 93);
  if($('div.left').position().left === 0) {
    $('div.left').offset({left: -$('div.left').outerWidth()});
  } else {
    $('div.left').css('left', '0');
  }
  return false;
}
