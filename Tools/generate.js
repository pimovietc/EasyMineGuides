// Function that generates the actual BAT file.
function download(coin) {
  	
	var address = document.getElementById('address').value;
	var worker = document.getElementById('worker').value;
	var addwork;
  var bashfile;
  var CPU = 0; //if CPU is 1 then cpuminer is used
  var algo; //algo is set for CPU to differentiate
  var zzz; //zzz is cpuminer type

  if (address.length != 34) {
    document.getElementById('output').value = 'Miner address does not contain 34 characters and is therefore invalid!';
    return;
  }

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
  } else if (coin=='BSTY') {
    pool = 'yescrypt.easymine.online:6500';
    CPU = 1;
    algo = 'yescrypt';
    zzz = document.getElementById('cpu-zzz').value;
  } else if (coin=='XMY') {
    pool = 'yescrypt.easymine.online:6000';
    CPU = 1;
    algo = 'yescrypt';
    zzz = document.getElementById('cpu-zzz').value;
  } else if (coin=='ARG') {
    pool = 'argon-argentum.easymine.online:9000';
    CPU = 1;
    algo = 'argon2d';
    zzz = document.getElementById('cpu-zzz').value;
  } else if (coin=='UIS') {
    pool = 'argon.easymine.online:3003';
    CPU = 1;
    algo = 'argon2d';
    zzz = document.getElementById('cpu-zzz').value;
  }

  if (CPU) {
    if (algo=='yescrypt') {
      bashfile = 'cpuminer-' + zzz + '.exe -a yescrypt -o stratum+tcp://' + pool + ' -u ' + addwork + ' -p x';
    } else if (algo=='argon2d') {
      bashfile = 'cpuminer-' + zzz + '.exe -a argon2d4096 -o stratum+tcp://' + pool + ' -u ' + addwork + ' -p x';
    }
  } else {
    bashfile = 'ccminer-x64 -a lyra2v2 -o stratum+tcp://' + pool + ' -u ' + addwork + ' -p x';
  }

  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + bashfile);
  
  element.setAttribute('download', 'EasyMine.bat');

	element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
	document.getElementById('output').value = bashfile;
 	document.getElementById('output').setAttribute('size',102);
}

// Function to match the Generator form to the latest applied settings
function change_form() {
  
  var coin = document.getElementById('cointype').value;
  var showcpu = document.getElementById("cpu-zzz");
  var showtbl = document.getElementById("cpu-zzz-table");
  var placeholder = '';
  var CPU = 0;

  if (coin=='VTC') {
    placeholder = 'VgT29UCrpQyJphre4LztiU1qf1cAaA4RNG';
  } else if (coin=='NIX') {
    placeholder = 'NSP9PpxChtdGNs4E5ajn15w6ZuDMKAiF5L';
  } else if (coin=='MONA') {
    placeholder = 'MPRzNahQY1Ho1k9mV7ERbcw9iFwPQRYWRp';
  } else if (coin=='BSTY') {
    placeholder = '';
    CPU = 1;
    algo = 'yescrypt';
    zzz = document.getElementById('cpu-zzz').value;
  } else if (coin=='XMY') {
    placeholder = 'MW6ka2r1NXKNZgSwXUcRkJ4mJa3tKuvmiR';
    CPU = 1;
    algo = 'yescrypt';
    zzz = document.getElementById('cpu-zzz').value;
  } else if (coin=='ARG') {
    placeholder = 'AZYb5g1xCeKhr1Vgjyz6XpNK9wQfrUXNS4';
    CPU = 1;
    algo = 'argon2d';
    zzz = document.getElementById('cpu-zzz').value;
  } else if (coin=='UIS') {
    placeholder = 'UcBynhRvG5P3mRYXke9wiHhJb2NmuQS8nz';
    CPU = 1;
    algo = 'argon2d';
    zzz = document.getElementById('cpu-zzz').value;
  }

  if (CPU) {
    //show cpu-zzz
    showcpu.style.display = "block";
    showtbl.style.display = "block";
  } else {
    //hide cpu-zzz
    showcpu.style.display = "none";
    showtbl.style.display = "none";
  }

  document.getElementById('address').placeholder = placeholder;
}