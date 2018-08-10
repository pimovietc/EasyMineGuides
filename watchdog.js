function gethashrate(coin) {
  	
	var address = document.getElementById('address').value;

  var element = document.createElement('a');

  var hashrate = '5';
  var temp = 'nothing';

  var target = 'https://vertcoin.easymine.online/miner/VgT29UCrpQyJphre4LztiU1qf1cAaA4RNG/'
  
  /*var url = "https://anyorigin.com/go?url=" + encodeURIComponent(target) + "&callback=?";
  $.get(url, function(response) {
    console.log(response);
  });*/

  $.getJSON('https://anyorigin.com/go?url=https%3A//vertcoin.easymine.online/miner/VgT29UCrpQyJphre4LztiU1qf1cAaA4RNG&callback=?', function(data){
  $('#output').html(data.contents);
  console.log(data.contents);
});

	element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
	document.getElementById('output').value = hashrate;
 	document.getElementById('output').setAttribute('size',102);
}