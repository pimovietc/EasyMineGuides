function download() {
  	
	var address = document.getElementById('address').value;
	var worker = document.getElementById('worker').value;
	var addwork;

	addwork = encodeURIComponent(address)
	if (encodeURIComponent(worker)) {
		addwork = encodeURIComponent(address) + '.' + encodeURIComponent(worker);
	}

  	var element = document.createElement('a');
  	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + 'ccminer-x64 -a lyra2v2 -o stratum+tcp://lyra2.easymine.online:5000 -u ' + addwork + ' -p x');
  	element.setAttribute('download', 'EasyMine.bat');

	element.style.display = 'none';
  	document.body.appendChild(element);

  	element.click();

  	document.body.removeChild(element);

  	document.getElementById('output').value = 'ccminer-x64 -a lyra2v2 -o stratum+tcp://lyra2.easymine.online:5000 -u ' + addwork + ' -p x';
  	document.getElementById('output').setAttribute('size',102);
}