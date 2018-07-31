function download(coin) {
  	
	var address = document.getElementById('address').value;
	var worker = document.getElementById('worker').value;
	var addwork;
  var bashfile;

	addwork = encodeURIComponent(address)
	if (encodeURIComponent(worker)) {
		addwork = encodeURIComponent(address) + '.' + encodeURIComponent(worker);
	}

  var element = document.createElement('a');

  if (coin=='VTC') {
    pool = 'lyra2.easymine.online:5000';
  } else if (coin=='NIX') {
    pool = 'lyra2-nix.easymine.online:10000';
  } else if (coin=='MONA') {
    pool = 'lyra2-monacoin.easymine.online:7000';
  }

  bashfile = 'ccminer-x64 -a lyra2v2 -o stratum+tcp://' + pool + ' -u ' + addwork + ' -p x';

  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + bashfile);
  
  element.setAttribute('download', 'EasyMine.bat');

	element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
	document.getElementById('output').value = bashfile;
 	document.getElementById('output').setAttribute('size',102);
}