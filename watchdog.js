function gethashrate(coin) {
  	
	var address = document.getElementById('address').value;

  var element = document.createElement('a');

  var hashrate = '5';
  var temp = 'nothing';

  var target = 'https://vertcoin.easymine.online/miner/VgT29UCrpQyJphre4LztiU1qf1cAaA4RNG/'
  
  var name = "codemzy";
  var url = "https://anyorigin.com/go?url=" + encodeURIComponent(target) + name + "&callback=?";
  $.get(url, function(response) {
    console.log(response);
  });

	element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
	document.getElementById('output').value = hashrate;
 	document.getElementById('output').setAttribute('size',102);
}