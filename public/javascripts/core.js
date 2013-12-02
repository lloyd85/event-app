/**
 * Created by Lloyd on 18/11/13.
 */

$(document).ready(function()
{
    var logoutBtn = $('.logoutLink');
    var evtEditBtn = $('.evtEditButton');
    var evtAddBtn = $('.evtAddButton');
    var evtDeleteBtn = $('.evtDeleteButton');
    var evtDeletePopupBtn = $('.evtDeleteButton');
    var evtInvitePopupBtn = $('.evtInvitePopupBtn');
    var profileEditBtn = $('.myDetailsEditButton');
    var profileDeleteBtn = $('.myDetailsDeleteButton');
    var profileTextFields = [
        {name:'user-fname', size:'15'},
        {name:'user-lname', size:'15'},
        {name:'user-email', size:'20'},
        {name:'user-phone', size:'12'}
    ];
    var evtId;
    var editable = false;
    var textFields = [
        {name:'name', size:'35'},
        {name:'info', size:'-1'},
        {name:'startDay', size:'4'},
        {name:'startMonth', size:'5'},
        {name:'startYear', size:'6'},
        {name:'startHours', size:'4'},
        {name:'startMinutes', size:'4'},
        {name:'endDay', size:'4'},
        {name:'endMonth', size:'5'},
        {name:'endYear', size:'6'},
        {name:'endHours', size:'4'},
        {name:'endMinutes', size:'4'},
        {name:'street', size:'30'},
        {name:'city', size:'20'},
        {name:'postcode', size:'10'},
        {name:'country', size:'20'},
        {name:'site' ,size:'40'},
        {name:'phone', size:'20'}
    ];
    var inviteeList = $('.inviteeList');
    var addInviteeBtn = $('.addInviteeButton');
    var evtInviteBtn = $('.sendInviteButton');
    var evtSubscribeBtn = $('.evtSubscribe');
    var evtUnsubscribeBtn = $('.evtUnsubscribe');
    var inviteeCount = 0;

    $(this).bind("mobileinit", function(){
        $.mobile.metaViewportContent = "width=device-width";
    });

    logoutBtn.click(function(){

        $.post('/logout', { _method : 'get' }, function(response) {
            if(response.retStatus === 'Success') {
                if (response.redirectTo ) {
                    window.location = response.redirectTo;
                };
            };
        });
    });

    evtSubscribeBtn.click(function(){

        evtId = $(this).parent().parent().attr('id');

        $.post('/subscribe/' + evtId, { _method : 'put' }, function(response) {
            console.log('Res: ' + response);
            if(response.retStatus === 'Success') {
                console.log('Was successful')
                if (response.redirectTo && response.msg == 'Just go there please') {
                    window.location = response.redirectTo;
                }
            }
        });
    });

    evtUnsubscribeBtn.click(function(){
        evtId = $(this).parent().parent().attr('id');

        $.post('/unsubscribe/' + evtId, { _method : 'put' }, function(response) {
            console.log('Res: ' + response);
            if(response.retStatus === 'Success') {
                if (response.redirectTo && response.msg == 'Just go there please') {
                    window.location = response.redirectTo;
                }
            }
        });
    });

    evtAddBtn.click(function(){

        var eventName = $('#name').val();
        var eventInfo = $('#info').val();
        var eventStartDay = $('#startDay').val();
        var eventStartMonth = $('#startMonth').val();
        var eventStartHours = $('#startHours').val();
        var eventStartMinutes = $('#startMinutes').val();
        var eventStartYear = $('#startYear').val();
        var eventEndDay = $('#endDay').val();
        var eventEndMonth = $('#endMonth').val();
        var eventEndYear = $('#endYear').val();
        var eventEndHours = $('#endHours').val();
        var eventEndMinutes = $('#endMinutes').val();
        var eventStreet = $('#street').val();
        var eventCity = $('#city').val();
        var eventPostCode = $('#postcode').val();
        var eventCountry = $('#country').val();
        var eventSite = $('#site').val();
        var eventPhone = $('#phone').val();

        var eventDetails = {
            name : eventName,
            info : eventInfo,

            startDay : eventStartDay,
            startMonth : eventStartMonth,
            startYear : eventStartYear,

            startHours : eventStartHours,
            startMinutes : eventStartMinutes,    // turn this into utils function called

            endDay : eventEndDay,
            endMonth : eventEndMonth,
            endYear : eventEndYear,

            endHours : eventEndHours,
            endMinutes : eventEndMinutes,

            street : eventStreet,
            city : eventCity,
            postcode : eventPostCode,
            country : eventCountry,

            phone: eventPhone,
            site : eventSite
        };
        console.log('eventDetails: ' + JSON.stringify(eventDetails));
        var err_message = "null";

        function validateEventDetails(){
            var valid = false;
            var date = new Date();
            var months = {
                'Jan':1,
                'Feb':2,
                'Mar':3,
                'Apr':4,
                'May':5,
                'Jun':6,
                'Jul':7,
                'Aug':8,
                'Sep':9,
                'Oct':10,
                'Nov':11,
                'Dec':12
            };

            var currentDay = date.getDate();
            var currentMonth = (date.getMonth()+1);
            var currentYear = date.getFullYear();
            var currentHours = date.getHours();
            var currentMinutes = (date.getMinutes < 10) ? '0' + date.getMinutes() : date.getMinutes();

            if(eventName.length < 1 || eventInfo.length < 1 || eventPostCode.length < 1){
                err_message = 'Please enter valid event name and info';
            }
            else if (eventStartYear < currentYear){
                err_message = 'The start year has already passed';
            }
            else if (eventStartYear == currentYear && months[eventStartMonth] < currentMonth){

                err_message = 'The start month has already passed';
            }
            else if (eventStartDay < currentDay && months[eventStartMonth] == currentMonth && eventStartYear == currentYear){
                err_message = 'The start date has already passed';
            }
            else if (eventStartDay == currentDay && months[eventStartMonth] == currentMonth && eventStartYear == currentYear){
                if(eventStartHours < currentHours){
                    err_message = 'Please make sure that the time for the Start is not earlier than the current time (hours)';
                }
                else if(eventStartHours == currentHours && eventStartMinutes < currentMinutes){
                    err_message = 'Please make sure that the time for the Start is not earlier than the current time (minutes)';
                }
                else {
                    if(eventEndYear < eventStartYear){
                        err_message = 'Please make sure that the end year is not earlier than the start year';
                    }
                    else if (eventEndYear == eventStartYear && months[eventEndMonth] < months[eventStartMonth]){
                        err_message = 'Please make sure that the end month is not earlier than the start month';
                    }
                    else if (eventEndDay < eventStartDay){
                        err_message = 'Please make sure that the end date is not earlier than the start date';
                    }
                    else if (eventEndDay == eventStartDay && months[eventEndMonth] == months[eventStartMonth] && eventEndYear == eventStartYear){
                        if(eventEndHours < eventStartHours){
                            err_message = 'Please make sure that the time for the end is not earlier than the start time (hours)';
                        }
                        else if(eventEndHours == eventStartHours && eventEndMinutes <= eventStartMinutes){
                            err_message = 'Please make sure that the time for the end is not earlier than the start time (minutes)';
                        };
                    };
                };
            } else {
                valid = true;
            };

            return valid;
        };

        if(validateEventDetails()){
            $.ajax({
                url: '/addevent',
                type: 'POST',
                data:  JSON.stringify(eventDetails),
                contentType: 'application/json',

                success: function(data) {
                    if(data.retStatus === 'Success') {
                        if (data.redirectTo) {
                            window.location = data.redirectTo;
                        }
                    }

                }
            });
        }
        else {
            $('#status').html(err_message);
            alert(err_message);
        };
    });

    evtEditBtn.click(function() {
        evtId = $(this).parent().parent().attr('id');
        editable = !editable;
        if(editable) {
            $(this).find('.ui-btn-text').text('Done');
            for (var text in textFields){
                handInputTextFields(textFields[text].name, textFields[text].size, true, '/updateevent/', evtId);
            };
        }
        else {
            $(this).find('.ui-btn-text').text('Edit');
            for (var text in textFields){
                handInputTextFields(textFields[text].name, textFields[text].size, false, '/updateevent/', evtId);
            };
            location.reload();
        };
    });

    evtInvitePopupBtn.click(function(){
        evtId =  $(this).parent().parent().attr('id');
    });

    evtDeletePopupBtn.click(function(){
        evtId =  $(this).parent().parent().attr('id');
    });

    addInviteeBtn.click(function(){
        var parent = $(this).parent().parent();
        if(parent.find('.inviteeField').length < 5){
            inviteeCount++
            inviteeList.append(
                '<li class="inviteeField">' +
                    '<fieldset class="ui-grid-a">' +
                    '<div data-theme="a" style="width:25%;" class="ui-block-a">' +
                    '<label for="inviteeName'+ inviteeCount + '">Name</label>' +
                    '</div>' +
                    '<div data-theme="a" style="width:75%;" class="ui-block-b">' +
                    '<input class="inviteeName'+ inviteeCount + '" type="text" placeholder="Invitee Name" name="inviteeName'+ inviteeCount + '"/>' +
                    '</div>' +
                    '<div data-theme="a" style="width:25%;" class="ui-block-a">' +
                    '<label for="inviteeEmail'+ inviteeCount + '">Email</label>' +
                    '</div>' +
                    '<div data-theme="a" style="width:75%;" class="ui-block-b">' +
                    '<input class="inviteeEmail'+ inviteeCount + '" type="text" placeholder="Invitee Email" name="inviteeEmail'+ inviteeCount + '"/>' +
                    '</div>' +
                    '</fieldset>' +
                    '</li>').listview('refresh').trigger("create");
        }
        else {
            alert('no more invitees' + parent.find('.inviteeField').length);
        };
    });

    evtInviteBtn.click(function(){
        var parent = $(this).parent().parent().parent();
        var evt = parent.parent().parent();
        var inviteeField = parent.find('.inviteeField');
        var evtName = evt.find('.name').html();
        var evtStartDay = evt.find('.startDay').html();
        var evtStartMonth = evt.find('.startMonth').html();
        var evtStartYear = evt.find('.startYear').html();
        var orgFName = evt.find('.orgFname').html();
        var orgPhone = evt.find('.orgPhone').html();
        var orgEmail = evt.find('.orgEmail').html();
        var inviteeModel;
        var inviteeObj = {collection:[]};

        evtId = $(this).parent().attr('id');
        for(var i = 0; i < inviteeField.length; i++) {

            if(inviteeField.find('.inviteeName' + i).val().length > 1 &&  inviteeField.find('.inviteeEmail' + i).val().length > 5){

                inviteeModel = {
                    name:inviteeField.find('.inviteeName' + i).val(),
                    email:inviteeField.find('.inviteeEmail' + i).val(),
                    event:{
                        startDate:evtStartDay + ' ' + evtStartMonth + ' ' +  evtStartYear,
                        name:evtName,
                        _id:evtId
                    },
                    organiser: {
                        fname:orgFName,
                        phone:orgPhone,
                        email:orgEmail
                    }
                };
                inviteeObj.collection[i] = inviteeModel;
                console.log('Model: ' + JSON.stringify(inviteeModel));
            };
        };
        console.log(JSON.stringify( inviteeObj ));
        $.ajax({
            url: '/invite/' + evtId,
            type: 'POST',
            data:  JSON.stringify(inviteeObj) ,
            contentType: 'application/json',

            success: function(data) {
                if(data.retStatus === 'Success') {
                    if (data.redirectTo) {
                        window.location = data.redirectTo;
                    };
                };
            }
        });
    });

    evtDeleteBtn.click(function(){

        $.post('/deleteevent/' + evtId, { _method : 'get' }, function(response) {
            if(response.retStatus === 'Success') {
                if (response.redirectTo ) {
                    window.location = response.redirectTo;
                }
            }
        });
    });

    profileEditBtn.click(function() {
        var id = $(this).parent().attr('id');
        editable = !editable;
        if(editable) {
            $(this).find('.ui-btn-text').text('Done');
            for (var text in textFields){
                handInputTextFields(profileTextFields[text].name, profileTextFields[text].size, true, '/updatemydetails/',id);
            };
        }
        else {
            $(this).find('.ui-btn-text').text('Edit');
            for (var text in textFields){
                handInputTextFields(textFields[text].name, textFields[text].size, false, '/updatemydetails/', id);
            };
            location.reload();
        };
    });

    profileDeleteBtn.click(function(){
        profileId = $('.optionButtons').attr('id');
        $.post('/deletemydetails/' + profileId, { _method : 'get' }, function(response) {
            console.log('Res: ' + response);
            if(response.retStatus === 'Success') {
                if (response.redirectTo && response.msg == 'Just go there please') {
                    window.location = response.redirectTo;
                }
            }
        });
    });

    function handInputTextFields(name, size, binding, path, id) {
        var target = $('.' + name);
        if(binding) {
            target.on('click', { key:name.replace(/\buser-\b/g,''), size:size, path:path, id:id }, convertInputToText);
        }
        else {
            target.off('click', convertInputToText);
        };
    };

    function convertInputToText(e){
        var target = $(e.target);
        var content = target.text();
        var input;
        var jsonObj = {};
        var key = e.data.key;
        var size = e.data.size;
        var path = e.data.path;
        var _id = e.data.id;

        if ( target.is( "li" ) ) {

            if(size != '-1') {
                target.empty().html('<input type="text" maxlength="'+ size + '" size="'+ size + '"/>');
                input = target.find('input');
            }
            else{
                target.empty().html('<textarea id="txtArea" rows="4" cols="40"></textarea>');
                input = target.find('textarea');
            };

            input.val(content).focus();
            input.blur(function() {

                $(this).parent().empty().append($(this).val());
                jsonObj[key] = input.val();
                console.log('url: ' + path + _id    )
                $.ajax({
                    url: path + _id,
                    type: 'PUT',
                    data: JSON.stringify( jsonObj ),
                    contentType: 'application/json',

                    success: function(data) {
                        console.log('success');
                        console.log(JSON.stringify(data));
                        location.reload();
                        self.find('.ui-btn-text').text('Edit');
                    }
                });
            });
        };
    };
});