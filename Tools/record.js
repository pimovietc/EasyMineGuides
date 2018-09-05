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

//Function to generate the record
function create_record() {
  //Temporary variables
  cointypes = document.getElementsByName('cointype');
  coins = [];

  //Permanent variables
  var fiat = document.getElementById('fiat').value;
  var kWh = document.getElementById('pwrcost').value;
  var PWR = document.getElementById('pwrcons').value;
  var currencies = [];
  var sheet = '0';

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
      sheet = sheet + 'ERROR - '+ currencies[i].coin + ' address is too short.\n';
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
  for (var i=0, n=currencies.length;i<n;i++) {
    if (i<n-1) {
      sheet = sheet + currencies[i].coin + ' ';
    } else {
      sheet = sheet + currencies[i].coin;
    }
  }
  
  sheet = sheet + '\nfiat ' + fiat + '\ncost ' + kWh + '\npower ' + PWR;

  //remove '0' from string
  sheet = sheet.substr(1);
  document.getElementById('recordsheet').value = sheet;
}