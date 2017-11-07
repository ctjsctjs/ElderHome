$(document).ready(function () {
  console.log("OK");

  /*Mobile nav dropdown trigger*/
  $('#nav-hamburger').click(function(){
    $(".nav-mobile").slideToggle(100, "linear");
  });

  /*Profile menu dropdown trigger*/
  $('.profile-dropdown').click(function(){
    $(".dropdown").fadeToggle(100, "linear");
  });
});

/*Map level increase button*/
function increaseValue() {
  var value = parseInt(document.getElementById('number').value, 10);
  value = isNaN(value) ? 0 : value;
  value++;
  document.getElementById('number').value = value;
};

/*Map level decrease button*/
function decreaseValue() {
  var value = parseInt(document.getElementById('number').value, 10);
  value = isNaN(value) ? 0 : value;
  value < 1 ? value = 1 : '';
  value--;
  document.getElementById('number').value = value;
};
