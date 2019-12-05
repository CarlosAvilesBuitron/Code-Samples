// ************************** Javascript code API DONATION FORM ***********************************-->


    // endpoint to post donation
    var     uriDonation = "https://secure2.convio.net/akf/site/CRDonationAPI",
            postdataDonation = "method=donate&v=1.0&api_key=VFIUmJuNUFHTS1hM0NR&response_format=json&validate=false&summary=both";

    var     uriDonationInfo = "https://secure2.convio.net/akf/site/CRDonationAPI",
            postdataInfo = "method=getDonationFormInfo&v=1.0&api_key=VFIUmJuNUFHTS1hM0NR&response_format=json";

    var sustainer = "";


    var notificationSection, honorSection, ecardSection;

    /** Source and sub source code ***/
    var api_source ="";
    var api_sub_source="";
    //get Param function

        var urlParams = function(name) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (results == null) {
                return null;
            } else {
                return results[1] || 0;
            }
        };

    jQuery(document).ready(function($){

        //Preselect current date Send eCard
            var date = new Date();
            var month = ("0" + (date.getMonth() + 1)).slice(-2);
            var day = date.getUTCDate();
            var year = date.getFullYear();

            $("#ecard-month").val(month);
            $("#ecard-day").val(day);
            $("#ecard-year").val(year);

        // Get the value param and determine if that exists
        jQuery.urlParam = function(name){
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (results==null){
                return null;
            }
            else{
                return results[1] || 0;
             }
        };


        /***
         * Fill values for monthly or one-time donation
         *
         **/
        var frequencyLogic = function(element){
            //assign the form id to the hidden input
            $('#form_id').val(element.attr('form-id'));
            console.log(element.attr('frequency'));
            switch(element.attr('frequency')){
                case 'one-time':
                      sustainer = "";
                        detachHonor();
                        detachNotification();
                        detachEcard();
                      break;
                case 'monthly':
                    $('input[name="sustaining.frequency"]').val('monthly');
                    $('input[name="sustaining.duration"]').val('0');
                    sustainer = "sustaining.frequency=monthly&sustaining.duration=0";
                    detachHonor();
                    detachNotification();
                    detachEcard();
                      break;
                case 'honor':
                    sustainer="";
                    attachHonor();
                    attachNotification();
                        $('.donation-notification.active').click();
                    $('#honor-mail').hide();

                    break;
            }

            //set the levels ID based on the form id
            getLevelsDonation(element.attr('form-id'));
        };


        /**
         * This function fill the Level ID for each amount donation gift
         * @param formId
         */
        var getLevelsDonation = function(formId){
            $('#form_id').val(formId);
            $('.donation-giftArray').each(function(){
                $(this).attr('level-id','');
            });
            $('#pstep_finish').hide();
            $('#loading-button').show();
            $.post(uriDonationInfo,postdataInfo+'&form_id='+formId, function(data){
               var dfInfo = JSON.parse(data);
                donationLevel = dfInfo.getDonationFormInfoResponse.donationLevels.donationLevel;
                for(var i=0; i<donationLevel.length;i++){
                    if(donationLevel[i].userSpecified=='true'){
                        $('.donation-giftArray[data-amount=other]').attr('level-id',donationLevel[i].level_id);
                    }else{
                        $('.donation-giftArray[data-amount="'+donationLevel[i].amount.decimal+'"]').attr('level-id',donationLevel[i].level_id);
                    }
                }
                $('.donation-giftArray.active').click();
                $('#loading-button').hide();
                $('#pstep_finish').show();
            }).fail(function(){
                $('#loading-button').hide();
                $('#pstep_finish').show();
            });
        }

        /**
         * Amount logic selection
         * @param element
         */
        var amountLogic = function(element){
            //verify is the selected amount is not the "other amount"
            if(!element.children('input').length){
                $('.donation-giftArray .other-amount').val('');
            }
            $('input[name="level_id"]').val(element.attr('level-id'));
            updateHidden();
        }

        /**
         * Notification Type
         * @param element
         */
        var notificationLogic = function(element){
            switch(element.attr('data-notification')){
                case 'mail':
                    $('#honor-mail').show();
                     //set the levels ID based on the form id
                        getLevelsDonation(element.attr('form-id'));
                        detachEcard();
                break;
                case 'ecard':
                     getLevelsDonation($('.donation-frequency[frequency="honor"]').attr('form-id'));
                    $('#honor-mail').hide();
                    attachEcard();
                    break;
                default :
                    getLevelsDonation($('.donation-frequency[frequency="honor"]').attr('form-id'));
                    detachEcard();
                    $('#honor-mail').hide();
            }

        }

        /**
         * Card Type logic
         */
        var cardtypeLogic = function(element){
            $('input[name="card_type"]').val(element.attr('card-type'));
        }

        /**
         * Update the hidden input before submit
         */
        var updateHidden = function (){
            //update amount & level id
            var oAmount = $('.donation-giftArray .other-amount').val();
            oAmount = oAmount.replace(/[^0-9\.]+/g, '');

            if(oAmount){
                $('input[name="other_amount"]').val(oAmount);
            }
            else{
                $('input[name="other_amount"]').val('');
            }
            // set the level id
            $('input[name="level_id"]').val($('.donation-giftArray.active').attr('level-id'));

            // set the tribute type
            if($('.donation-frequency.active').attr('frequency')=='honor'){
                $('input[name="tribute.type"]').val($('#tribute-type').val());
            }else{
                $('input[name="tribute.type"]').val('');
            }

            // set the tribute address state
            if($('.donation-frequency.active').attr('frequency')=='honor' &&
                $('.donation-notification.active').attr('data-notification')=='mail'){
                $('input[name="tribute.notify.address.state"]').val($('#tribute-state').val());
                $('input[name="tribute.notify.address.country"]').val($('#tribute_notify_recip_country').val());
            }else{
                $('input[name="tribute.notify.address.state"]').val('');
                $('input[name="tribute.notify.address.country"]').val('');
            }

            //Billing state
            $('input[name="billing.address.state"]').val($('#billing-state').val());
            $('input[name="billing.address.country"]').val($('select[name="billing.address.country"]').val());

            //Set remember me value
            if($('#donor_remember_me').is(':checked')){
                $('input[name="remember_me"]').val(true);
            }else{
                $('input[name="remember_me"]').val(false);
            }

            //Set Opt in value
            if($('#donor_optin').is(':checked')){
                $('input[name="donor.email_opt_in"]').val(true);
            }else{
                $('input[name="donor.email_opt_in"]').val(false);
            }

            //check if eCard is active
            if($('.donation-notification.active').attr('data-notification')=='ecard'){
                $('input[name="ecard.send_date"]').val($('#ecard-year').val()+'-'+$('#ecard-month').val()+'-'+$('#ecard-day').val());
                $('input[name="ecard.id"]').val($('input[name="ecardID"]:checked').val());
            }else{
                $('input[name="ecard.send_date"]').val();
                $('input[name="ecard.id"]').val();
            }

        }

        var minAmount = function(){
            if($('.donation-giftArray.active[data-amount=other]').length){
                   var oAmount =  $('.donation-giftArray.active[data-amount=other] input').val();
                    oAmount = oAmount.replace(/[^0-9\.]+/g, '');
                    if(oAmount && parseInt(oAmount) >= 5){
                        return true;
                    }
                    else{
                        return false;
                    }

            }
           return true;
        }

        var detachHonor = function(){
            if(!honorSection)
            honorSection = $('#honor-option').detach();
        }
        var detachNotification = function(){
            if(!notificationSection)
                notificationSection = $('#notification-option').detach();
        }
        var detachEcard = function(){
            if(!ecardSection)
                ecardSection = $('#ecard-option').detach();
        }
        var attachEcard = function(){
            if(ecardSection)
            ecardSection.appendTo('#ecard-container');
            ecardSection="";
        }
        var attachHonor = function(){
            if(honorSection)
            honorSection.appendTo('#honor-container')
            honorSection="";
        }
        var attachNotification = function(){
            if(notificationSection)
            notificationSection.appendTo('#notification-container')
            notificationSection="";
        }
        var defaultValues = function(){
            $('.donation-frequency.active').click();
            detachHonor();
            detachNotification();
            detachEcard();
        }

        //Identify the frequency one-time or monthly donation
        $('.donation-frequency').click(function(){
            $('.donation-frequency').removeClass('active');
            $(this).addClass('active');
            frequencyLogic($(this));
        });

        //Identify the notification type
        $('.donation-notification').click(function(){
            $('.donation-notification').removeClass('active');
            $(this).addClass('active');
            notificationLogic($(this));
        });

        //Identify the gift array selected
        $('.donation-giftArray').click(function(){
            $('.donation-giftArray').removeClass('active');
            $(this).addClass('active');
            amountLogic($(this));
        });

        //Identify the card type
        $('.donation-payment-info  ').click(function(){
            $('.donation-payment-info  ').removeClass('active');
            $(this).addClass('active');
            cardtypeLogic($(this));
        });

        //submit form
        $('#df-form').submit(function(e){
           e.preventDefault();

             if(!minAmount()){
                toastr.error('The minimum donation amount is $5.');
                return false;
            }

            /** Code to read the src and sub src parameter from url **/
            if(urlParams("s_src")){
                api_source = urlParams("s_src");
            }
            if(urlParams("s_subsrc")){
                api_sub_source =urlParams("s_subsrc");
            }
            //Add the source code params
            var source_code_params = "source="+api_source+"&sub_source="+api_sub_source;

           updateHidden();

            $('#pstep_finish').hide();
            $('#loading-button').show();

            var sendEcard = "ecard.send=false";
            if($('.donation-notification.active').attr('data-notification')=='ecard'){
               sendEcard="ecard.send=true";
            }



            $.post(uriDonation, postdataDonation+'&'+sendEcard+'&send_receipt=true&'+sustainer+'&'+source_code_params+'&'+$("#df-form").serialize(), function(data, textStatus, jqxhr){
                $('#pstep_finish').show();
                $('#loading-button').hide();

                toastr.success('Thank you for your generous gift');

                var responseText =  JSON.parse(data);
                var html = "";
                html+=responseText.donationResponse.donation.summary_page[0].join();
                if(typeof(ty_endpoint)!=='undefined' && ty_endpoint){
                    window.location.replace("/akf/site/SPageNavigator/"+ty_endpoint+".html?donation=complete");
                }else{
                    window.location.replace("/akf/site/SPageNavigator/thank_you_page_api.html?donation=complete");
                }

            }).fail(function(data,textstatus,jqxhr){
                $('#pstep_finish').show();
                $('#loading-button').hide();
                var responseText =  JSON.parse(data.responseText);
                var errorMessage ="";
                if(responseText.donationResponse.errors.pageError){
                    errorMessage +="<p style='font-weight:bold'>"+responseText.donationResponse.errors.pageError+"</p>";
                }

                if(responseText.donationResponse.errors.fieldError){
                    var array =responseText.donationResponse.errors.fieldError;
                    if( array instanceof  Array)
                        errorMessage+=array.join('<br>');
                    else
                        errorMessage+=array+'<br>';
                }
                if(responseText.donationResponse.errors.declineUserMessage){
                    errorMessage+=responseText.donationResponse.errors.declineUserMessage+'<br>';
                }
                toastr.error(errorMessage);
            });

        });
        //init all process
        defaultValues();
    });



    jQuery(document).ready(function($){



        if(urlParams('chosen')){

            if(urlParams('chosen') == 'other'){
                $('div[data-amount="other"]').click();
                return;
            }

            var passedAmount = parseFloat(urlParams('chosen')).toFixed(2);
            var foundAmount = $('div[data-amount="' + passedAmount + '"');

            var foundElement = false;

                foundAmount.on('click', function(){
                    foundElement = true;
                });

                foundAmount.click().trigger('click');

                if(foundElement){
                    console.log('We Clicked It');
                } else {
                    $('div[data-amount="other"]').click();
                    $('.other-amount').val(passedAmount);
                }

        }

        //Show opt-in field
        $("#donor-optin-checkbox").css('float', 'none');
        $("#donor-optin-checkbox").css('clear', 'both');
        $("#donor-optin-checkbox").css('display', 'block');
        $("#donor-optin-checkbox").css('width', '100%');
        $("#donor-optin-checkbox label").text('Yes, I would like to receive communications from the American Kidney Fund (AKF)');
        
        
        
    });

// ************************** /END  Javascript code API DONATION FORM ********************************
