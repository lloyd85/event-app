/**
 * Created by Lloyd on 18/11/13.
 */

$(document).ready(function()
{
    var editBtn = $('.evtEditButton');
    var evtId;
    var editable = false;
    var textFields = [
        {name:'name', size:'35'},
        {name:'info', size:'-1'},
        {name:'startDay', size:'2'},
        {name:'startMonth', size:'3'},
        {name:'startYear', size:'4'},
        {name:'startHours', size:'2'},
        {name:'startMinutes', size:'2'},
        {name:'endDay', size:'2'},
        {name:'endMonth', size:'3'},
        {name:'endYear', size:'4'},
        {name:'endHours', size:'2'},
        {name:'endMinutes', size:'2'},
        {name:'street', size:'30'},
        {name:'city', size:'20'},
        {name:'postcode', size:'10'},
        {name:'country', size:'20'},
        {name:'site' ,size:'40'},
        {name:'phone', size:'20'}
    ];
    var inviteeList = $('.inviteeList');
    var addInviteeBtn = $('.addInviteeButton');
    var sendInviteBtn = $('.sendInviteButton');
    var evtSubscribeBtn = $('.evtSubscribe');
    var evtUnsubscribeBtn = $('.evtUnsubscribe');
    var inviteeCount = 0;

    editBtn.click(function() {

        //evtId = $(this).attr('id');
        editable = !editable;
        if(editable) {
            $(this).find('.ui-btn-text').text('Done');
            for (var text in textFields){
                handInputTextFields(textFields[text].name, textFields[text].size, true);
            };
        }
        else {
            $(this).find('.ui-btn-text').text('Edit');
            for (var text in textFields){
                handInputTextFields(textFields[text].name, textFields[text].size, false);
            };
        };
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

    sendInviteBtn.click(function(){
        var parent = $(this).parent().parent().parent();
        var evt = parent.parent().parent();
        var inviteeField = parent.find('.inviteeField');
        var evtName = evt.find('.name').html();
        var evtStartDay = evt.find('.startDay').html();
        var evtStartMonth = evt.find('.startMonth').html();
        var evtStartYear = evt.find('.startYear').html();
        var orgName = evt.find('.orgName').html();
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
                        name:evtName
                    },
                    organiser: {
                        name:orgName,
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
                console.log('success');
                console.log(JSON.stringify(data));
                window.location.reload();
                //self.find('.ui-btn-text').text('Edit');
            }
        });

        /*$.post('/invite/' + evtId, {test:'super'}, function(response) {
            console.log('Res: ' + response);
            if(response.retStatus === 'Success') {
                console.log('Was successful')
                if (response.redirectTo && response.msg == 'Just go there please') {
                    window.location = response.redirectTo;
                }
            }
        });*/

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

    function handInputTextFields(name, size, binding) {
        var target = $('.' + name);
        if(binding) {
            target.on('click', { key:name, size:size }, convertInputToText);
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

        console.log('Object Text: ' + e.data.obj);
        console.log('TextField Name: ' + e.data.name);
        console.log('TextField Size: ' + e.data.size);

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
                if(input.find('.name')){
                    console.log('found')
                    console.log($(this).parent().parent().parent().find('.title').html('lloyd'));
                }
                //input.parent().pare; nt().parent().find('.name').html(input.find('.name').val());
                console.log('Event ID; ' + evtId )
                console.log(JSON.stringify(jsonObj));
                $.ajax({
                    url: '/updateevent/' + evtId,
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