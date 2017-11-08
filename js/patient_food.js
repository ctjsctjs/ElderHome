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
var elderlyId = "ELDERLY12345"

firebase.initializeApp(config);

// Reference to the recommendations object in your Firebase database
var fbElderlyFoodRecord = firebase.database().ref("ElderlyFoodRecord/" + elderlyId);
elderlyFoodRecords = {};

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

		fbElderlyFoodRecord.push({
			"date": getDateFormatDDMMYYYY(decreasingDate),
			"morning": missFedGenerator(),
			"afternoon": missFedGenerator(),
			"evening": missFedGenerator()
		});
	}
	//Add todays date
	var am8 = "not_fed";
	var pm1 = "not_fed";
	var pm7 = "not_fed";

	if (getCurrentTime24h() > 8) {
		am8 = missFedGenerator();
		if (getCurrentTime24h() > 13) {
			pm1 = missFedGenerator();
		}
		if (getCurrentTime24h() > 18) {
			pm7 = missFedGenerator();
		}
	}

	fbElderlyFoodRecord.push({
		"date": getDateFormatDDMMYYYY(new Date()),
		"morning": am8,
		"afternoon": pm1,
		"evening": pm7
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
		//Random 3 diff food
		var random = Math.random();
		if (random > 0.3) {
			return "Nasi Lemak";
		} else if (random > 0.5) {
			return "fed";
		} else if (random > 0.7) {
			return "Bak Chor Mee";
		}
		return "Chicken Rice";
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

	elderlyFoodRecords.forEach(function(foodRecord) {
		//Check if data is in selected date range
		if (dateRangeList.includes(foodRecord.val().date)) {
			datesToShow.push(foodRecord.val().date);
			keyVal[foodRecord.val().date] = {
				"morning": foodRecord.val().morning,
				"afternoon": foodRecord.val().afternoon,
				"evening": foodRecord.val().evening
			};
		}
	});

	datesToShow.reverse();

	//Loop throught arrays of dates to be shown
	for (var i = 0; i < datesToShow.length; i++) {
		var value = keyVal[datesToShow[i]]; //Values store in kv pair
		var dataRow = '<div class="data"><span class="data-date">' + datesToShow[i] + '</span>' +
			'<div class="data-row"><ul>';
		// //8am
		dataRow += '<li class="' + getCssClassFromMealResult(value.morning) + '"><span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> 8 a.m</span><hr class="data-divider"><span class="data-bp-main">' + getFlagFromMealResult(value.morning) + '</span></li> ';
		//1pm
		dataRow += '<li class="' + getCssClassFromMealResult(value.afternoon) + '"><span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> 1 p.m</span><hr class="data-divider"><span class="data-bp-main">' + getFlagFromMealResult(value.afternoon) + '</span></li> ';
		//7pm
		dataRow += '<li class="' + getCssClassFromMealResult(value.evening) + ' "><span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> 7 p.m</span><hr class="data-divider"><span class="data-bp-main">' + getFlagFromMealResult(value.evening) + '</span></li> ';

		//End div and ul for data row
		dataRow += '</ul></div>';
		$('#fbFoodData').append(dataRow);
	}
}

function getFromDatabase() {
	fbElderlyFoodRecord.once('value', function(snapshot) {
		if (snapshot.numChildren() === 0) {
			//NO DATA. POPULATE PSUDO DATA
			generatePsudoData();
			intervalId = setInterval(getFromDatabase, 2000);
		} else {
			clearInterval(intervalId);
			elderlyFoodRecords = snapshot;
			createAndSetData();
		}
	});
}

getFromDatabase();

// <span class="data-food-main">Zapdol, Bacterium</span>