console.log("loaded");
var config = {
	apiKey: "AIzaSyApGTfyP55awWZJfKqbt1difYxpiIu1PCo",
	authDomain: "ict2102-aa233.firebaseapp.com",
	databaseURL: "https://ict2102-aa233.firebaseio.com",
	projectId: "ict2102-aa233",
	storageBucket: "ict2102-aa233.appspot.com",
	messagingSenderId: "709698411605"
};

var intervalId = 0;
//LOAD ELDERLY ID OVER HERE
var elderlyId = "ELDERLY123"

firebase.initializeApp(config);

// Reference to the recommendations object in your Firebase database
var fbElderlyMedRecord = firebase.database().ref("ElderlyMedRecord/" + elderlyId);
elderlyMedRecords = {};

var dataRangeNoOfDays = 5; //Change no of days of data to display

function getDateFormatDDMMYYYY(date) {
	var dd = date.getDate();
	var mm = date.getMonth() + 1; //January is 0!
	var yyyy = date.getFullYear();

	if (dd < 10) {
		dd = '0' + dd
	}

	if (mm < 10) {
		mm = '0' + mm
	}

	date = dd + '/' + mm + '/' + yyyy;
	return date;
}

//FEED 90% OF THE TIME
function missFedGenerator() {
	if (Math.random() > 0.9) {
		return "miss";
	} else {
		return "fed";
	}
}

function getCurrentTime24h() {
	var date = new Date();
	return date.getHours();
}

function generatePsudoData() {
	//Generate 30 days of data week data
	var daysToGenerate = 30;
	for (var i = daysToGenerate; i > 0; i--) {
		var decreasingDate = new Date();
		decreasingDate.setDate(decreasingDate.getDate() - i);

		fbElderlyMedRecord.push({
			"date": getDateFormatDDMMYYYY(decreasingDate),
			"eightAm": missFedGenerator(),
			"elevenAm": missFedGenerator(),
			"twoPm": missFedGenerator(),
			"sixPm": missFedGenerator(),
			"tenPm": missFedGenerator()
		});
	}
	//Add todays date
	var am8 = "not_fed";
	var am11 = "not_fed";
	var pm2 = "not_fed";
	var pm6 = "not_fed";
	var pm10 = "not_fed";

	if (getCurrentTime24h() > 9) {
		am8 = missFedGenerator();
	}
	if (getCurrentTime24h() > 12) {
		am11 = missFedGenerator();
	}
	if (getCurrentTime24h() > 15) {
		pm2 = missFedGenerator();
	}
	if (getCurrentTime24h() > 19) {
		pm6 = missFedGenerator();
	}
	if (getCurrentTime24h() > 20) {
		pm7 = missFedGenerator();
	}

	fbElderlyMedRecord.push({
		"date": getDateFormatDDMMYYYY(new Date()),
		"eightAm": am8,
		"elevenAm": am11,
		"twoPm": pm2,
		"sixPm": pm6,
		"tenPm": pm10
	});
}

//Get current date in format dd/mm/yyyy
function getCurrentDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1; //January is 0!
	var yyyy = today.getFullYear();

	if (dd < 10) {
		dd = '0' + dd
	}

	if (mm < 10) {
		mm = '0' + mm
	}

	today = dd + '/' + mm + '/' + yyyy;
	return today;
}

function getCssClassFromMealResult(result) {
	if (result === 'fed') {
		return "data-box fed";
	} else if (result === 'miss') {
		return "data-box missed";
	} else {
		return "data-box";
	}
}

function getFlagFromMealResult(result) {
	if (result === 'fed') {
		return "Fed";
	} else if (result === 'miss') {
		return "Miss";
	} else {
		//Random 3 diff med
		var random = Math.random();
		if (random > 0.3) {
			return "Zapdol";
		} else if (random > 0.5) {
			return "Panadol";
		} else if (random > 0.7) {
			return "Bacterium";
		}
		return "Injection";
	}
}

function createAndSetData() {
	console.log("Create UI and set Data");
	var dateRangeList = []; //Date range selected
	for (var i = dataRangeNoOfDays-1; i >= 0; i--) {
		var decreasingDate = new Date();
		decreasingDate.setDate(decreasingDate.getDate() - i);
		dateRangeList.push(getDateFormatDDMMYYYY(decreasingDate));
	}

	var keyVal = {};
	var datesToShow = []; //Dates to show on UI
	console.log(elderlyMedRecords);
	elderlyMedRecords.forEach(function(medRecord) {
		//Check if data is in selected date range
		if (dateRangeList.includes(medRecord.val().date)) {
			datesToShow.push(medRecord.val().date);
			keyVal[medRecord.val().date] = {
				"eightAm": medRecord.val().eightAm,
				"elevenAm": medRecord.val().elevenAm,
				"twoPm": medRecord.val().twoPm,
				"sixPm": medRecord.val().sixPm,
				"tenPm": medRecord.val().tenPm
			};
		}
	});

	datesToShow.reverse();

	//Loop throught arrays of dates to be shown
	for (var i = 0; i < datesToShow.length; i++) {
		var value = keyVal[datesToShow[i]]; //Values store in kv pair
		var dataRow = '<div class="data"><span class="data-date">' + datesToShow[i] + '</span>' +
			'<div class="data-row"><ul>';
		//8am
		dataRow += '<li class="' + getCssClassFromMealResult(value.eightAm) + '"><span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> 8 a.m</span><hr class="data-divider"><span class="data-bp-main">' + getFlagFromMealResult(value.eightAm) + '</span></li> ';
		//11am
		dataRow += '<li class="' + getCssClassFromMealResult(value.elevenAm) + '"><span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> 11 a.m</span><hr class="data-divider"><span class="data-bp-main">' + getFlagFromMealResult(value.elevenAm) + '</span></li> ';
		//2pm
		dataRow += '<li class="' + getCssClassFromMealResult(value.twoPm) + ' "><span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> 2 p.m</span><hr class="data-divider"><span class="data-bp-main">' + getFlagFromMealResult(value.twoPm) + '</span></li> ';
		//6pm
		dataRow += '<li class="' + getCssClassFromMealResult(value.sixPm) + ' "><span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> 6 p.m</span><hr class="data-divider"><span class="data-bp-main">' + getFlagFromMealResult(value.sixPm) + '</span></li> ';
		//10pm
		dataRow += '<li class="' + getCssClassFromMealResult(value.tenPm) + ' "><span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> 10 p.m</span><hr class="data-divider"><span class="data-bp-main">' + getFlagFromMealResult(value.tenPm) + '</span></li> ';

		//End div and ul for data row
		dataRow += '</ul></div>';
		$('#fbMedData').append(dataRow);
	}
}

function getFromDatabase() {
	fbElderlyMedRecord.once('value', function(snapshot) {
		if (snapshot.numChildren() === 0) {
			//NO DATA. POPULATE PSUDO DATA
			generatePsudoData();
			intervalId = setInterval(getFromDatabase, 2000);
		} else {
			clearInterval(intervalId);
			elderlyMedRecords = snapshot;
			createAndSetData();
		}
	});
}

getFromDatabase();