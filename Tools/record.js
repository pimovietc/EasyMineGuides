// Function to match the Recordsheet form to the latest applied settings
function change_form_record() {
  var cointypes = document.getElementsByName('cointype');
  var coins = [];
  var ncoins = [];

  for (var i=0, n=cointypes.length;i<n;i++) {
    if (cointypes[i].checked) {
      coins = coins.concat(cointypes[i].value);
    } else {
      ncoins = ncoins.concat(cointypes[i].value);
    }
  }

  if (coins.length) {
    //display text to provide addreses
    document.getElementById('p_coins').style.display = "block";
  } else {
    //hide said text
    document.getElementById('p_coins').style.display = "none";
  }

  for (var i=0, n=coins.length;i<n;i++) {
    document.getElementById('add_'+coins[i]).style.display = "block";
  }
  for (var i=0, n=ncoins.length;i<n;i++) {
    document.getElementById('add_'+ncoins[i]).style.display = "none";
  }
}

// global variables
// global variables
// global variables
var json_data;	//contains fetched json
var sheet;		//final text area
var json_count; //global counter that allows for sync after JSON calls.
var currencies; // array that contains all currencies, addresses, values etc.

// should merge these in a single object!
var fiat; // contains chosen type of fiat currency
var kWh; // contains chosen kWh price
var PWR; // contains chosen PWR consumption.

//Function to generate the record
function create_record() {
  //Temporary variables
  cointypes = document.getElementsByName('cointype');
  coins = [];

  //variables
  fiat = document.getElementById('fiat').value;
  kWh = document.getElementById('pwrcost').value;
  PWR = document.getElementById('pwrcons').value;
  currencies = [];
  sheet = '0';
  json_count = 0; //reset json_counter each time button is pressed

  // Gather selected currencies
  for (var i=0, n=cointypes.length;i<n;i++) {
    if (cointypes[i].checked) {
      coins = coins.concat(cointypes[i].value);
    }
  }

  for (var i=0, n=coins.length;i<n;i++) {
    currencies[i] = {
      coin: coins[i],
      address: document.getElementById('add_'+coins[i]).value
    };
  }

  // clean up unneeded variables
  delete coins;
  delete cointypes;

  // ERROR CHECKING
  // ERROR CHECKING
  // ERROR CHECKING

  // check if currencies were selected
  if (currencies.length == 0) {
    document.getElementById('recordsheet').value = 'ERROR - No currencies were selected.';
    return;
  }

  // check if kWh price is properly entered.
  if (kWh == '') {
    document.getElementById('recordsheet').value = 'ERROR - Please enter your price per kWh.';
    return;
  } else if (kWh.indexOf(',') !== -1) {
    document.getElementById('recordsheet').value = 'ERROR - Please use X.X as a format for your price per kWh.';
    return;
  } else {
    kWh = parseFloat(kWh);
    if (isNaN(kWh)) {
      document.getElementById('recordsheet').value = 'ERROR - The entered price per kWh is not a number.';
      return;
    }
  }

  // check if power consumption is entered.
  if (PWR == '') {
    document.getElementById('recordsheet').value = 'ERROR - Please enter your power consumption in Watt.';
    return;
  } else if ((PWR.indexOf(',') !== -1) || (PWR.indexOf('.') !== -1)) {
    document.getElementById('recordsheet').value = 'ERROR - Please round your power consumption to an integer.';
    return;
  } else {
    PWR = parseInt(PWR);
    if (isNaN(PWR)) {
      document.getElementById('recordsheet').value = 'ERROR - The entered power consumption is not a number.';
      return;
    }
  }

  // List invalid addresses.
  for (var i=0, n=currencies.length;i<n;i++) {
    if (currencies[i].address.length != 34) {
      sheet += 'ERROR - '+ currencies[i].coin + ' address is too short.\n';
    }
  }
  if (sheet != '0') {
    //remove '0' from string
    if (sheet != '0') { sheet = sheet.substr(1); }
    document.getElementById('recordsheet').value = sheet;
    return;
  } else { sheet = '0'; }

  // ACTUAL SHEET GEN STARTS HERE
  // ACTUAL SHEET GEN STARTS HERE
  // ACTUAL SHEET GEN STARTS HERE

  // Generate sheet
  //sheet += 'TEST OVERVIEW\n'
  for (var i=0, n=currencies.length;i<n;i++) {
    if (i<n-1) {
      //sheet += currencies[i].coin + ' ';
    } else {
      //sheet += currencies[i].coin;
    }
  }
  //sheet += '\nfiat ' + fiat + '\ncost ' + kWh + '\npower ' + PWR + '\n\n';

  sheet += 'Please wait while we fetch your miner\'s information.';
  //remove '0' from string
  sheet = sheet.substr(1);
  document.getElementById('recordsheet').value = sheet;

  //reset sheet's content
  sheet = '';

  // Probably should fetch fiat stuff first, then do this in callback of that JSON call.
  var api_url;
  for (var i=0, n=currencies.length;i<n;i++) {
    switch(currencies[i].coin) {
      case 'MON':
        api_url = 'monacoin';
        currencies[i].CMCid = 213;
        break;
      case 'NIX':
        api_url = 'nix';
        currencies[i].CMCid = 2991;
        break;
      case 'VTC':
        api_url = 'vertcoin';
        currencies[i].CMCid = 99;
        break;
      case 'ARG':
        api_url = 'argentum';
        currencies[i].CMCid = 31;
        break;
      case 'XMY':
        api_url = 'myriad';
        currencies[i].CMCid = 182;
        break;
      case 'UIS':
        api_url = 'unitus';
        currencies[i].CMCid = 781;
        break;
    }

    json_easymine(cleanJSON,'https://' + api_url + '.easymine.online/api/minertxhistory/' + currencies[i].address, i);
  }
  
}

function cleanJSON(count) {
  payoutindice = [];
  // Find the indices where there are payouts in the tx history.
  for (var i=0, n=json_data.tx.length;i<n;i++) {
    if (json_data.tx[i].type == 'payout') {
      payoutindice = payoutindice.concat(i);
    }
  }

  // Remove all entries that are NOT on the indices (i.e. all non-payout entries)
  for (var i=-2, n=payoutindice.length-1;i<n;n--) {
    if (n == payoutindice.length-1) {
      removeN = json_data.tx.length - payoutindice[n] - 1;
      json_data.tx.splice(payoutindice[n]+1, removeN);
    } else if (n==-1) {
      removeN = payoutindice[n+1];
      json_data.tx.splice(0, removeN);
    }
    else {
      removeN = payoutindice[n+1] - payoutindice[n] - 1;
      json_data.tx.splice(payoutindice[n]+1, removeN);
    }
  }

  // Sum all 'amounts'
  var sum = 0;
  for (var i=0, n=json_data.tx.length;i<n;i++) {
    sum += parseFloat(json_data.tx[i].amount);
  }
  sum = sum*-1;
  sum = sum.toFixed(8);

  //add total number of tokens to currencies[]
  currencies[count].token_sum = sum;

  json_coinmarket(doStuffwithJSON, count);
}

function doStuffwithJSON(fiat_price, count) {
	// Add all fiat_price s to currencies.
	currencies[count].fiat_price = fiat_price;

	//Currently out of order!
	//Do this in a for-loop after sync to order!
	sheet += 'You have mined ' + currencies[count].token_sum + ' ' + currencies[count].coin + '. Which is equal to ' + (currencies[count].fiat_price * currencies[count].token_sum) + ' ' + fiat + '.\n';

	// Wait till all crypto JSON calls are finished.
	json_count++;
	if (json_count == currencies.length) {
		// in here is synced!
		console.log('All EasyMine API calls fetched!');
		document.getElementById('recordsheet').value = sheet;
	}

}

function doesNothing() {
	//nothing
}


// EasyMine JSON call
function json_easymine(callback, targetUrl, count) {
  var proxyUrl = 'https://cors-anywhere.herokuapp.com/'
  fetch(proxyUrl + targetUrl)
  .then(blob => blob.json())
  .then(data => {
    //console.table(data);
    json_data = data;
    callback(count);
    return data;
  })
  .catch(e => {
    console.log(e);
    return e;
  });
}

// CoinMarketCap JSON call, sends fiat_price to callback()
function json_coinmarket(callback, count) {
	fetch('https://api.coinmarketcap.com/v2/ticker/'+currencies[count].CMCid+'/?convert='+fiat)
  	.then(blob => blob.json())
  	.then(data => {
    	//console.table(data);
    	//console.log(data.data.quotes[fiat].price);
    	callback(data.data.quotes[fiat].price, count);
    	return data;
  	})
  	.catch(e => {
    	console.log(e);
    	return e;
  	});
}