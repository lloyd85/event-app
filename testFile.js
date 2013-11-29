var date = new Date();
var currentDay = date.getDate();
var currentMonth = date.getMonth();
var currentYear = date.getFullYear();
console.log('cirrentDay: ' + currentDay)

var startDateOption = document.getElementById('evtStartDay').getElementsByTagName("option");
var startMonthOption = document.getElementById('evtStartMonth').getElementsByTagName("option");
var startYearOption = document.getElementById('evtStartYear').getElementsByTagName("option");

var endDateOption = document.getElementById('evtEndDay').getElementsByTagName("option");
var endMonthOption = document.getElementById('evtEndMonth').getElementsByTagName("option");
var endYearOption = document.getElementById('evtEndYear').getElementsByTagName("option");

startDateOption[(currentDay-1)].selected = true;
startMonthOption[currentMonth].selected = true;
startYearOption[(currentYear) - (endYearOption[0].text)].selected = true;
endDateOption[(currentDay-1)].selected = true;
endMonthOption[currentMonth].selected = true;
endYearOption[(currentYear) - (endYearOption[0].text)].selected = true;

function getId(id) {
    var obj = document.getElementById(id);
    return obj;
};

function validate(e){
    var eventName = getId('evtName').value;
    var eventInfo = getId('evtInfo').value;
    var eventStartDay = getId('evtStartDay').value;
    var eventStartMonth = getId('evtStartMonth').value;
    var eventStartTime = getId('evtStartTime').value;
    var eventStartTimeType = getId('evtStartTimeType').value;
    var eventStartYear = getId('evtStartYear').value;
    var eventEndDay = getId('evtEndDay').value;
    var eventEndMonth = getId('evtEndMonth').value;
    var eventEndYear = getId('evtEndYear').value;
    var eventEndTime = getId('evtEndTime').value;
    var eventEndTimeType = getId('evtEndTimeType').value;
    var eventStreet = getId('evtStreet').value;
    var eventCity = getId('evtCity').value;
    var eventPostCode = getId('evtPostCode').value;
    var eventCountry = getId('evtCountry').value;
    var eventSite = getId('evtSite').value;
    var eventPhone = getId('evtPhone').value;

    function validateEventDetails(){
        console.log('validateEventDetails');

        var valid = false;

        var months ={
            'January':1,
            'February':2,
            'March':3,
            'April':4,
            'May':5,
            'June':6,
            'July':7,
            'August':8,
            'September':9,
            'October':10,
            'November':11,
            'December':12
        };

        if(eventName.length < 1 || eventInfo.length < 1 || eventPostCode.length < 1 || eventCity.length < 1){
            console.log('Please enter valid event name and info');
        } else if ( months[eventStartMonth] < currentMonth || eventStartYear < currentYear || eventStartDay < currentDay){
            console.log('The start date has already passed')
        } else if (months[eventEndMonth] < currentMonth || eventEndYear < currentYear || eventEndDay < currentDay){
            console.log('The end date has already passed')
        } else if (eventEndDay < eventStartDay || months[eventEndMonth] < months[eventStartMonth] || eventEndYear < eventStartYear){
            console.log('Please make sure that the end date is not earlier than the start date')
        } else if (eventEndDay == eventStartDay && months[eventEndMonth] == months[eventStartMonth] && eventEndYear == eventStartYear){
            if(eventEndTime <= eventStartTime && eventStartTimeType == eventEndTimeType ){
                console.log('Please make sure that the time for the end is not earlier than the start date')
            } else if (eventEndTime > eventStartTime && eventEndTimeType == 'AM' && eventStartTimeType == 'PM' ){
                console.log('Please make sure that the time for the end is not earlier than the start date')
            } else {
                valid = true;
            }
        } else {
            valid = true;
        };
        return valid;
    };

    if(validateEventDetails()){
        console.log('collection insert values')
    } else {
        console.log('Something is wrong');
    };
    console.log('validate');
};

var btn = getId('evtPhone');
btn.addEventListener('click', validate);