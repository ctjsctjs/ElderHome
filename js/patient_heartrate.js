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
var fbElderlyHeartrate = firebase.database().ref("ElderlyHeartrate/" + elderlyId);
//Elderly path
var Elderlies = firebase.database().ref("Elderlies");

//List of eldery heartbeasts
var elderlyHeartbeats = {};

var dataRangeNoOfDays = 6; //Change no of days of data to display

//Get heartbeat between 70 -100
function getHeartbeat() {
    return Math.floor((Math.random() * 31) + 70);
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

function getYesterdayDate() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
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

function getCurrentTime24h() {
    var date = new Date();
    return date.getHours();
}

function updateBpm() {
    fbElderlyHeartrate.push({
        "bpm": getHeartbeat(),
        'date': getCurrentDate(),
        'hour24': getCurrentTime24h()
    });
}

function createAndSetData() {
    console.log("Create UI and set Data");
    //Get a list of selcted date range
    var dateRangeList = []; //Date range selected
    // include todays date by seting i >= 0 instead of i > 0
    for (var i = dataRangeNoOfDays - 1; i >= 0; i--) {
        var decreasingDate = new Date();
        decreasingDate.setDate(decreasingDate.getDate() - i);
        dateRangeList.push(getDateFormatDDMMYYYY(decreasingDate));
    }

    dateRangeList.reverse();

    //Loop through data base and find rows that matched date
    var keyVal = {};
    var datesToShow = {}; //Dates to show on UI
    var dateKeys = [];
    elderlyHeartbeats.forEach(function(heartbeat) {
        //Check if db date is in date range
        if (dateRangeList.includes(heartbeat.val().date)) {
            if (datesToShow[heartbeat.val().date] === undefined) {
                //Create date/ date changed
                datesToShow[heartbeat.val().date] = {};
                dateKeys.push(heartbeat.val().date);
                keyVal = {};
            }
            //Put 24h data to key val
            if (keyVal[heartbeat.val().hour24] == undefined) {
                keyVal[heartbeat.val().hour24] = {
                    averageBpm: heartbeat.val().bpm,
                    lowest: heartbeat.val().bpm,
                    highest: heartbeat.val().bpm
                };
            } else {
                //hour exist
                //Compare highest
                keyVal[heartbeat.val().hour24].averageBpm = Math.floor((heartbeat.val().bpm + keyVal[heartbeat.val().hour24].averageBpm) / 2);
                if (heartbeat.val().bpm > keyVal[heartbeat.val().hour24].highest) {
                    keyVal[heartbeat.val().hour24].highest = heartbeat.val().bpm;
                }
                //Compare lowest
                if (heartbeat.val().bpm < keyVal[heartbeat.val().hour24].lowest) {
                    keyVal[heartbeat.val().hour24].lowest = heartbeat.val().bpm;
                }
            }
            datesToShow[heartbeat.val().date] = keyVal;
        }
    });

    dateKeys.reverse();

    //Loop throught arrays of dates to be shown
    for (var i = 0; i < dateKeys.length; i++) {
        var dateHoursValues = datesToShow[dateKeys[i]];
        var hourKeys = Object.keys(dateHoursValues);
        hourKeys.reverse();


        var dataRow = '<div class="data"><span class="data-date">' + dateKeys[i] + '</span>' +
            '<div class="data-row"><ul>';

        //Loop through hour keys and display the info
        for (var a = 0; a < hourKeys.length; a++) {
            var value = dateHoursValues[hourKeys[a]];
            dataRow +=
                '<li class="data-box">' +
                '<span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i> ' + twentyFourHourTo12Hour(hourKeys[a]) + '</span>' +
                '<hr class="data-divider"><span class="data-heartrate-label">Avg</span>' +
                '<span class="data-heartrate-main">' + value.averageBpm + '</span>' +
                '<hr class="data-divider">' +
                '<div class="float-left">' +
                '<span class="data-heartrate-label">min</span>' +
                '<span>' + value.lowest + '</span>' +
                '</div>' +
                '<div class="float-right">' +
                '<span class="data-heartrate-label">max</span>' +
                '<span>' + value.highest + '</span>' +
                '</div>' +
                '</li> ';
        }
        //End div and ul for data row
        dataRow += '</ul></div>';
        $('#fbBpmData').append(dataRow);
        // }
    }


    //Find and create data in selected date range
    // for (var i = dataRangeNoOfDays; i > 0; i--) {
    //     //Create div for data row
    //     var dict = new Object();
    //     var datesToShow = []; //Dates to show on UI
    //     elderlyHeartbeats.forEach(function(heartbeat) {
    //         //Current date filter
    //         if (dateRangeList.includes(heartbeat.val().date)) {
    //             if (!datesToShow.includes(heartbeat.val().date)) {
    //                 datesToShow.push(heartbeat.val().date);
    //             }
    //             //heartbeat.val(). bpm, date, hour24
    //             if (dict[heartbeat.val().hour24] == undefined) {
    //                 dict[heartbeat.val().hour24] = {
    //                     averageBpm: heartbeat.val().bpm,
    //                     lowest: heartbeat.val().bpm,
    //                     highest: heartbeat.val().bpm
    //                 };
    //             } else {
    //                 //hour exist
    //                 //Compare highest
    //                 if (heartbeat.val().bpm > dict[heartbeat.val().hour24].highest) {
    //                     dict[heartbeat.val().hour24].highest = heartbeat.val().bpm;
    //                 }
    //                 //Compare lowest
    //                 if (heartbeat.val().bpm < dict[heartbeat.val().hour24].lowest) {
    //                     dict[heartbeat.val().hour24].lowest = heartbeat.val().bpm;
    //                 }
    //             }
    //         }
    //     });
    //     console.log("Create row: " + datesToShow[i - 1]);
    //     var keys = new Array();
    //     for (var hour in dict) {
    //         keys.unshift(hour);
    //     }
    //     var dataRow = '<div class="data"><span class="data-date">' + datesToShow[i - 1] + '</span>' +
    //         '<div class="data-row"><ul>';

    //     //Loop through day from dict
    //     console.log(JSON.stringify(dict));
    //     //loop through from 0 to keys length
    //     for (var a = keys.length, n = 0; n < a; n++) {
    //         var hour = keys[n];
    //         value = dict[hour];
    //         dataRow +=
    //             '<li class="data-box">' +
    //             '<span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i>' + twentyFourHourTo12Hour(hour) + '</span>' +
    //             '<hr class="data-divider"><span class="data-heartrate-label">Avg</span>' +
    //             '<span class="data-heartrate-main">' + value.averageBpm + '</span>' +
    //             '<hr class="data-divider">' +
    //             '<div class="float-left">' +
    //             '<span class="data-heartrate-label">min</span>' +
    //             '<span>' + value.lowest + '</span>' +
    //             '</div>' +
    //             '<div class="float-right">' +
    //             '<span class="data-heartrate-label">max</span>' +
    //             '<span>' + value.highest + '</span>' +
    //             '</div>' +
    //             '</li> ';
    //     }
    //     //End div and ul for data row
    //     dataRow += '</ul></div>';
    //     $('#fbBpmData').append(dataRow);
    // }

}

function getFromDatabase() {
    fbElderlyHeartrate.once('value', function(snapshot) {
        if (snapshot.numChildren() === 0) {
            //NO DATA. POPULATE PSUDO DATA
            generatePsudoData();
            intervalId = setInterval(getFromDatabase, 2000);
        } else {
            clearInterval(intervalId);
            elderlyHeartbeats = snapshot;
            createAndSetData();
            setInterval(updateHeartbeatPerodically, 2000);
            $("#currentBpm").text("Last reading: " + getHeartbeat() + " " + " BPM");
            $("#DayBpm").text("Last 24 hours: " + getHeartbeat() + " " + " BPM");
            $("#weekBpm").text("Last week: " + getHeartbeat() + " " + " BPM");
            $("#monthBpm").text("Last month: " + getHeartbeat() + " " + " BPM");
        }

    });
}

function updateHeartbeatPerodically() {
    $("#currentBpm").text("Last reading: " + getHeartbeat() + " " + " BPM");
}

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

/*
Generate random heartrate 10 heartrate per h per day
Generate heartrate for yesterday and till the time today
*/
function generatePsudoData() {
    //day data data
    var daysToGenerate = 7;
    for (var a = daysToGenerate; a > 0; a--) {
        var decreasingDate = new Date();
        decreasingDate.setDate(decreasingDate.getDate() - a);
        //24h
        for (var i = 0; i <= 23; i++) {
            //Generate 5 data for each hour
            for (var z = 0; z < 5; z++) {
                fbElderlyHeartrate.push({
                    "bpm": getHeartbeat(),
                    'date': getDateFormatDDMMYYYY(decreasingDate),
                    'hour24': i
                });
            }
        }
    }

    //todays data from 0 to current time
    for (var i = 0; i <= getCurrentTime24h(); i++) {
        for (var a = 0; a < 10; a++) {
            fbElderlyHeartrate.push({
                "bpm": getHeartbeat(),
                'date': getCurrentDate(),
                'hour24': i
            });
        }
    }
}

function twentyFourHourTo12Hour(hour) {
    if (hour >= 12) {
        hour -= 12;
        if (hour == 0) {
            hour += 12;
        }
        return "" + hour + " p.m";
    } else {
        return "" + hour + " a.m.";
    }
}

//Create UI to display bpm for today
function createAndSetTodayBpm() {
    $("#todayBpm").text("Today, " + getCurrentDate());
    //Create div for data row
    var dataRow = '<div class="data-row"><ul>';

    var dict = new Object();
    elderlyHeartbeats.forEach(function(heartbeat) {
        //Current date filter
        if (heartbeat.val().date === getCurrentDate()) {
            //heartbeat.val(). bpm, date, hour24
            if (dict[heartbeat.val().hour24] == undefined) {
                dict[heartbeat.val().hour24] = {
                    averageBpm: heartbeat.val().bpm,
                    lowest: heartbeat.val().bpm,
                    highest: heartbeat.val().bpm
                };
            } else {
                //hour exist
                //Compare highest
                if (heartbeat.val().bpm > dict[heartbeat.val().hour24].highest) {
                    dict[heartbeat.val().hour24].highest = heartbeat.val().bpm;
                }
                //Compare lowest
                if (heartbeat.val().bpm < dict[heartbeat.val().hour24].lowest) {
                    dict[heartbeat.val().hour24].lowest = heartbeat.val().bpm;
                }
            }
        }
    });

    var keys = new Array();
    for (var hour in dict) {
        keys.unshift(hour);
    }

    //loop through from 0 to keys length
    for (var i = keys.length, n = 0; n < i; n++) {
        var hour = keys[n];
        value = dict[hour];
        dataRow +=
            '<li class="data-box">' +
            '<span class="data-time"><i class="fa fa-clock-o" aria-hidden="true"></i>' + twentyFourHourTo12Hour(hour) + '</span>' +
            '<hr class="data-divider"><span class="data-heartrate-label">Avg</span>' +
            '<span class="data-heartrate-main">' + value.averageBpm + '</span>' +
            '<hr class="data-divider">' +
            '<div class="float-left">' +
            '<span class="data-heartrate-label">min</span>' +
            '<span>' + value.lowest + '</span>' +
            '</div>' +
            '<div class="float-right">' +
            '<span class="data-heartrate-label">max</span>' +
            '<span>' + value.highest + '</span>' +
            '</div>' +
            '</li> ';
    }

    //End div and ul for data row
    dataRow += '</ul></div>';
    $('#fbBpmData').html(dataRow);

}

//MAIN CODE HERE
getFromDatabase();