//Fetch and place variabes from local storage, if available!
function load_localstorage() {
  //It is empty if the site has never been used before!
  if (localStorage.length > 0) {
    document.getElementById('pwrcons').value    = localStorage.getItem('local_pwrcons');
    document.getElementById('pwrcost').value    = localStorage.getItem('local_pwrcost');
    document.getElementById('fiat').value       = localStorage.getItem('local_fiat');
    document.getElementById('startdate').value  = localStorage.getItem('local_startdate');

    //Add settings for what coins/addresses!
    document.getElementById('add_MON').value    = localStorage.getItem('local_add_MON');
    document.getElementById('add_VTC').value    = localStorage.getItem('local_add_VTC');
    document.getElementById('add_ARG').value    = localStorage.getItem('local_add_ARG');
    document.getElementById('add_XMY').value    = localStorage.getItem('local_add_XMY');
    document.getElementById('add_UIS').value    = localStorage.getItem('local_add_UIS');

    //load checkboxes
    var cointypes = document.getElementsByName('cointype');
    for (var i=0, n=cointypes.length;i<n;i++) {
      cointypes[i].checked = (localStorage.getItem('local_cointypes_'+i) == 'true');
    }
    change_form_record();
  }
}

//called when record is computed, saves settings to localstorage.
function save_localstorage() {
  localStorage.setItem("local_pwrcons",     document.getElementById('pwrcons').value);
  localStorage.setItem("local_pwrcost",     document.getElementById('pwrcost').value);
  localStorage.setItem("local_fiat",        document.getElementById('fiat').value);
  localStorage.setItem("local_startdate",   new Date(general.start_date).toISOString().slice(0,-14)); //should be computed date!

  //Add settings for what coins/addresses!
  localStorage.setItem("local_add_MON",     document.getElementById('add_MON').value);
  localStorage.setItem("local_add_VTC",     document.getElementById('add_VTC').value);
  localStorage.setItem("local_add_ARG",     document.getElementById('add_ARG').value);
  localStorage.setItem("local_add_XMY",     document.getElementById('add_XMY').value);
  localStorage.setItem("local_add_UIS",     document.getElementById('add_UIS').value);

  //save checked boxes
  var cointypes = document.getElementsByName('cointype');
  for (var i=0, n=cointypes.length;i<n;i++) {
    localStorage.setItem("local_cointypes_"+i, cointypes[i].checked);
  }
}

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
	cost_total: [0, 0, 0],		//average daily cost last day, week, month (just multiples of eachother)
	days_mining: 0,				//now-startdate
	fiat: '',					//user-selected fiat currency
	kWh: '',					//user-selected kWh price
	profit_daily: [0, 0, 0], 	//average daily profit last day, week, month
	profit_total: 0, 			//revenue_total - cost_total
	PWR: '',					//user-selected PWR consumption
	revenue_daily: [0, 0, 0],	//average daily revenue last day, week, month
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

  //setting general
  general.cost_daily = [0, 0, 0];
  general.cost_total = 0;
  general.days_mining = 0;
  general.fiat = document.getElementById('fiat').value;
  general.kWh = document.getElementById('pwrcost').value;
  general.profit_daily = [0, 0, 0];
  general.profit_total = 0;
  general.PWR = document.getElementById('pwrcons').value;
  general.revenue_daily = [0, 0, 0];
  general.revenue_total = 0;
  general.start_date = Date.parse(document.getElementById('startdate').value);
  general.start_check = false;

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
    general.cost_daily[0] = 24 * general.kWh * general.PWR / 1000;
    general.cost_daily[1] = 7  * general.cost_daily[0];
    general.cost_daily[2] = 30 * general.cost_daily[0];
    general.cost_daily[0] = general.cost_daily[0].toFixedNumber(8);
    general.cost_daily[1] = general.cost_daily[1].toFixedNumber(8);
    general.cost_daily[2] = general.cost_daily[2].toFixedNumber(8);
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
	period = [(today - oneday)/1000, (today - oneday*7)/1000, (today - oneday*30)/1000];

	//compute revenues
	for (var i=0, n=currencies[count].txhistory.length-1;i<=n;n--) {
		if (currencies[count].txhistory[n].ts >= period[0]) {
			//add daily
			general.revenue_daily[0] += -currencies[count].txhistory[n].amount * currencies[count].fiat_price;
			general.revenue_daily[1] += -currencies[count].txhistory[n].amount * currencies[count].fiat_price;
			general.revenue_daily[2] += -currencies[count].txhistory[n].amount * currencies[count].fiat_price;
		} else if (currencies[count].txhistory[n].ts >= period[1]) {
			//add weekly/monthly
			general.revenue_daily[1] += -currencies[count].txhistory[n].amount * currencies[count].fiat_price;
			general.revenue_daily[2] += -currencies[count].txhistory[n].amount * currencies[count].fiat_price;
		} else if (currencies[count].txhistory[n].ts >= period[2]) {
			//add monthly
			general.revenue_daily[2] += -currencies[count].txhistory[n].amount * currencies[count].fiat_price;
		} else {
			break;
		}
	}

	// Wait till all crypto JSON calls are finished.
	json_count++;
	if (json_count == currencies.length) {
		// in here is synced!
		console.log('All EasyMine API calls fetched!');
		general.days_mining = ((today - general.start_date)/oneday).toFixedNumber(8);
		general.cost_total = (general.days_mining * general.cost_daily[0]).toFixedNumber(8);
		general.profit_total = (general.revenue_total - general.cost_total).toFixedNumber(8);

		//convert to FixedNumber in here, so it occurs only once.
		general.revenue_daily[0] = general.revenue_daily[0].toFixedNumber(8);
		general.revenue_daily[1] = general.revenue_daily[1].toFixedNumber(8);
		general.revenue_daily[2] = general.revenue_daily[2].toFixedNumber(8);
		general.revenue_total = general.revenue_total.toFixedNumber(8);

		for (var i=0, n=general.profit_daily.length;i<n;i++) {
			general.profit_daily[i] = general.revenue_daily[i] - general.cost_daily[i];
		}
		general.profit_daily[0] = general.profit_daily[0].toFixedNumber(8);
		general.profit_daily[1] = general.profit_daily[1].toFixedNumber(8);
		general.profit_daily[2] = general.profit_daily[2].toFixedNumber(8);

		for (var i=0, n=currencies.length;i<n;i++) {
			sheet += 'You have mined ' + currencies[i].token_sum + ' ' + currencies[i].coin + ', which is currently worth ' + (currencies[i].fiat_value).toFixedNumber(2) + ' ' + general.fiat + '.\n';
		}
    if (currencies.length > 1) {
      sheet += 'So in total your mining efforts are currently worth ' + (general.revenue_total).toFixedNumber(2) + ' ' + general.fiat + '.\n';
    }

		newdate = new Date(general.start_date).toISOString().slice(0,-14);
		//sheet += 'General settings: ' + general.kWh + ' ' + general.PWR + ' start_date= ' + newdate;
		sheet += '\nSince you have started mining on ' + newdate + ' and your rigs consume ' + general.PWR + 'W at a rate of ' + general.kWh + ' ' + general.fiat + ' per kWh.';
		sheet += ' Your total costs add up to ' + general.cost_total + ' ' + general.fiat + '.\n';
		sheet += '\n';
		sheet += 'OVERVIEW:\n';
		sheet += 'Profit past 24 hours: ' + (general.profit_daily[0]).toFixedNumber(4) + '\n';
		sheet += 'Profit past  7 days:  ' + (general.profit_daily[1]).toFixedNumber(4) + '\n';
		sheet += 'Profit past 30 days:  ' + (general.profit_daily[2]).toFixedNumber(4) + '\n';
		sheet += 'Profit total:         ' + (general.profit_total).toFixedNumber(4);
		document.getElementById('recordsheet').value = sheet;
		document.getElementById('recordsheet').rows = 10+currencies.length;

    //save settings to local storage
    save_localstorage();
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