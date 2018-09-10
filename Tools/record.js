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
/* currencies is an array that contains objects like {
	coin: 'VTC',
	address: 'VTC_address',
	CMCid: 'token id for CMC',
	token_sum: 'total mined tokens',
	fiat_price: 'current price in chosen fiat',
	fiat_value: 'current value of token_sum in fiat'
	txhistory: 'entire JSON tx history'
} */
var general = {
	cost_daily: 0, 				//fixed kWh*PWR
	cost_total: 0, 				//cost_daily*days_mining
	fiat: '',					//user-selected fiat currency
	kWh: '',					//user-selected kWh price
	profit_daily: [0, 0, 0], 	//average daily profit last day, week, month
	profit_total: 0, 			//revnue_total - cost_total
	PWR: '',					//user-selected PWR consumption
	revenue_daily: [0, 0, 0],	//average daily revnue last day, week, month
	revenue_total: 0,			//sum of current value of all tokens
	start_check: false,			//flag that is set iff start_date remains empty
	start_date: ''				//start date of mining
};

// should merge these in a single object!
var fiat; // contains chosen type of fiat currency
//var kWh; // contains chosen kWh price
//var PWR; // contains chosen PWR consumption.

//Function to generate the record
function create_record() {
  //Temporary variables
  cointypes = document.getElementsByName('cointype');
  coins = [];

  //variables
  general.fiat = document.getElementById('fiat').value;
  general.kWh = document.getElementById('pwrcost').value;
  general.PWR = document.getElementById('pwrcons').value;
  general.start_date = Date.parse(document.getElementById('startdate').value);
  currencies = [];
  sheet = '0';
  json_count = 0; //reset json_counter each time button is pressed
  general.start_check = false;

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
  if (general.kWh == '') {
    document.getElementById('recordsheet').value = 'ERROR - Please enter your price per kWh.';
    return;
  } else if (general.kWh.indexOf(',') !== -1) {
    document.getElementById('recordsheet').value = 'ERROR - Please use X.X as a format for your price per kWh.';
    return;
  } else {
    general.kWh = parseFloat(general.kWh);
    if (isNaN(general.kWh)) {
      document.getElementById('recordsheet').value = 'ERROR - The entered price per kWh is not a number.';
      return;
    }
  }

  // check if power consumption is entered.
  if (general.PWR == '') {
    document.getElementById('recordsheet').value = 'ERROR - Please enter your power consumption in Watt.';
    return;
  } else if ((general.PWR.indexOf(',') !== -1) || (general.PWR.indexOf('.') !== -1)) {
    document.getElementById('recordsheet').value = 'ERROR - Please round your power consumption to an integer.';
    return;
  } else {
    general.PWR = parseInt(general.PWR);
    if (isNaN(general.PWR)) {
      document.getElementById('recordsheet').value = 'ERROR - The entered power consumption is not a number.';
      return;
    }
  }

  //convert empty date to 0
  if (isNaN(general.start_date)) {
  	general.start_date = 9999999999000;
  	general.start_check = true;
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

    //Do general stuff while we're waiting for the JSON calls to finish
    general.cost_daily = 24 * general.kWh * general.PWR / 1000;
    general.cost_daily = general.cost_daily.toFixedNumber(8);
  }
  
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

  //add entire tx history to currencies
  currencies[count].txhistory = json_data.tx;

  //check if this is earliest startdate
  if (general.start_check) {
  	if (currencies[count].txhistory[0].ts*1000 < general.start_date) {
  		general.start_date = currencies[count].txhistory[0].ts*1000; //convert from seconds to ms (latter is JS standard)
  	}
  }

  // Sum all 'amounts'
  var sum = 0;
  for (var i=0, n=json_data.tx.length;i<n;i++) {
    sum += parseFloat(json_data.tx[i].amount);
  }
  sum = sum*-1;

  //add total number of tokens to currencies[]
  currencies[count].token_sum = sum.toFixedNumber(8);

  json_coinmarket(doStuffwithJSON, count);
}

// CoinMarketCap JSON call, sends fiat_price to callback()
function json_coinmarket(callback, count) {
	fetch('https://api.coinmarketcap.com/v2/ticker/'+currencies[count].CMCid+'/?convert='+general.fiat)
  	.then(blob => blob.json())
  	.then(data => {
    	//console.table(data);
    	//console.log(data.data.quotes[fiat].price);
    	callback(data.data.quotes[general.fiat].price, count);
    	return data;
  	})
  	.catch(e => {
    	console.log(e);
    	return e;
  	});
}

function doStuffwithJSON(fiat_price, count) {
	// Add all fiat_price s to currencies.
	currencies[count].fiat_price = fiat_price;
	currencies[count].fiat_value = fiat_price*currencies[count].token_sum;

	// Sum fiat_value in general
	general.revenue_total += currencies[count].fiat_value;

	//compute dailies
	oneday = 1000*60*60*24; //oneday
	today = new Date().getTime();
	today2 = Math.round(new Date().getTime() / oneday)*oneday;
	today3 = today2 - oneday;
	
	//FIX ME, probably don't need to do this fancy rounding. Just take all payouts between NOW() and NOW()-oneday.

	console.log(today);
	console.log(new Date(today).toISOString().slice(0,-14));
	console.log(today2);
	console.log(new Date(today2).toISOString().slice(0,-14));
	console.log(today3);
	console.log(new Date(today3).toISOString().slice(0,-14));
	general.revenue_daily[0] += -currencies[count].txhistory.slice(-1)[0].amount * currencies[count].fiat_price;
	//FIX ME, this only works for my personal miner as I have daily payouts. Need to implement logic that checks for the date!

	//psuedo for weekly/monthly
	/*
	for (i = -1 to -7) {
		general.revenue_daily[1] += -currencies[count].txhistory.slice(i)[0].amount * currencies[count].fiat_price;		
	}

	*/

	// Wait till all crypto JSON calls are finished.
	json_count++;
	if (json_count == currencies.length) {
		// in here is synced!
		console.log('All EasyMine API calls fetched!');

		for (var i=0, n=currencies.length;i<n;i++) {


			sheet += 'You have mined ' + currencies[i].token_sum + ' ' + currencies[i].coin + '. Which is equal to ' + currencies[i].fiat_value + ' ' + general.fiat + '.\n';
		}

		newdate = new Date(general.start_date).toISOString().slice(0,-14);
		sheet += 'General settings: ' + general.kWh + ' ' + general.PWR + ' start_date= ' + newdate;
		document.getElementById('recordsheet').value = sheet;
	}

}

function doesNothing() {
	//nothing
}

// Converts float to a "float" with rounded decimals, mimicing fixed number
Number.prototype.toFixedNumber = function(x, base){
  var pow = Math.pow(base||10,x);
  return +( Math.round(this*pow) / pow );
}