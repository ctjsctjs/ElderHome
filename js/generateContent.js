
$(document).ready(function () {
  console.log("OK");

  $.getJSON("js/data.json", function (json) {
    var container = $("#data-row");

    //Generate app list from adapters.JSON
    json.adapters.forEach(function (day) {
      var li = $('<li class="app">').appendTo(container);
      var a = $('<a target="_blank">').attr('href', adapter.link).appendTo(li);
      var img = $('<img>').attr('src', adapter.image).appendTo(a);
      $('<div class="item-name black-font"></div>').text(adapter.name).appendTo(li);
    });
  });
});
