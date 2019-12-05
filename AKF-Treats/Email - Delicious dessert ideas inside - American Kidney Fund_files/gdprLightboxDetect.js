//Create Cookie Function
function createCookie(name, value, days) {
    var date, expires;
    if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

//After Maxmind Lookup
var onSuccess = function(location) {

    console.log('MaxMind Running');
    var euLocation = location.country.is_in_european_union;


    //Is the country a EU country
    if(euLocation){
      console.log('EU visitor detected');
      lightboxGDPR();
    }else{
      console.log('Non EU visitor');
    }

};

//MaxMind error Function
var onError = function(error) {
    console.log(
        "Error:\n\n" +
        JSON.stringify(error, undefined, 4)
    );
};

//Start Lookup
var maxmindLookup = function(){
  console.log('Lookup is starting');

  //MaxMind Main Function
  setTimeout(function(){

    geoip2.city(onSuccess, onError);

  },300);


};

//Add Maxmind to Page
var addMaxmind = function(maxmindLookup){

  var script = document.createElement( 'script' );
  var scriptSrc = '//js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js';
  script.type = 'text/javascript';
  script.src = scriptSrc;
  document.getElementsByTagName('body')[0].appendChild(script);
  script.onload = function(){
    console.log('MaxMind Added');
    //Run lookup after adding script
    maxmindLookup();
  }
};

//Append lightbox css
var lightboxGDPRcss = function(){

  var cssLightbox = "<style type='text/css'> body{position: relative;}.gdpr-lightbox-overlay{position: fixed; top: 0; left: 0; z-index: 10198; width: 100%; height: 100%; background-color: rgba(0, 0, 0, .9);}.gdpr-popup{margin: 0 auto; position: fixed; top: 10%; left: .1%; right: .1%; z-index: 10199; width: 100%; max-width: 600px;}.gdpr-desktop{display: block;}.gdpr-mobile{display: none;}@media(max-width: 599px){.gdpr-popup{max-width: 320px;}.gdpr-desktop{display: none;}.gdpr-mobile{display: block;}}</style>";

  //Css div holder
  var css = document.createElement('DIV');
  css.id = 'cssAppend';

  //append to the body
  document.getElementsByTagName('body')[0].appendChild(css);
  css.innerHTML = cssLightbox;

};

//Append Lightbox
var lightboxGDPR = function(){

  //add css for gdpr lightbox
  lightboxGDPRcss();

  var gdprImagesObject = imagesGDPRsources;
  var gdprImagesDesktop = 'https://public.charitable.one/assets/scripts/gdpr/gdpr-desktop.png';
  var gdprImagesMobile = 'https://public.charitable.one/assets/scripts/gdpr/gdpr-mobile.png';

  //check if custom images are being used
  if(gdprImagesObject.desktop != 'default'){
    console.log(gdprImagesObject.desktop);
    gdprImagesDesktop = gdprImagesObject.desktop;
  }

  if(gdprImagesObject.mobile != 'default'){
    console.log(gdprImagesObject.mobile);
    gdprImagesMobile = gdprImagesObject.mobile;
  }


  var htmlLightbox = '<div class="gdpr-popup"><div class="gdpr-content"><a href="#" class="gdprAccept"><img src="';
  htmlLightbox += gdprImagesDesktop;
  htmlLightbox += '"  class="gdpr-desktop"/><img src="';
  htmlLightbox += gdprImagesMobile;
  htmlLightbox += '"  class="gdpr-mobile"/></a></div></div><div class="gdpr-lightbox-overlay"></div>';

  //Create a new holder div for the lightbox
  var i = document.createElement('DIV');
  i.id = 'gdprAppend';

  //Append to the body
  document.getElementsByTagName('body')[0].appendChild(i);

  //Set the html of the new div to be our lightbox
  i.innerHTML = htmlLightbox;

  //Grab the dark overlay and lightbox from the dom
  var overlay = document.querySelector('.gdpr-lightbox-overlay');
  var popupLightbox = document.querySelector('.gdpr-popup');

  //Show the lightbox
  overlay.style.display = 'block';
  popupLightbox.style.display = 'block';

  //Remove the lightbox when the lightbox button is clicked
  document.querySelector('.gdpr-popup .gdprAccept').addEventListener('click', function(e) {
      e.preventDefault();
      overlay.style.display = 'none';
      popupLightbox.style.display = 'none';

      //Push Data Event to Google Analytics on Render
      window.dataLayer.push({
          event: "dynamicEvent",
          dynamicCategory: 'lightbox',
          dynamicAction: 'click',
          dynamicLabel: 'DataCookieAccepted'
      });

  });

  //Remove the lightbox when the overlay is clicked
  overlay.addEventListener('click', function() {
      overlay.style.display = 'none';
      popupLightbox.style.display = 'none';

      //Push Data Event to Google Analytics on Render
      window.dataLayer.push({
          event: "dynamicEvent",
          dynamicCategory: 'lightbox',
          dynamicAction: 'click',
          dynamicLabel: 'DataCookieAccepted'
      });

  });

  //Push Data Event to Google Analytics on Render
  window.dataLayer.push({
      event: "dynamicEvent",
      dynamicCategory: 'lightbox',
      dynamicAction: 'render',
      dynamicLabel: 'DataCookieAccepted'
  });

}

//Function to run detection logic
var gdprDetect = function(client, previewMode){

  //Variable to add the cookie name to the test url
  var cookieName = 'lb_gdpr_detect';
  var testingUrl = new RegExp(cookieName);

  //Run the detection logic
  if (previewMode === true && window.location.href.match(testingUrl)) {

    //Add MaxMind Script
    addMaxmind(maxmindLookup);

  }

  if(previewMode === false){
    console.log('Live mode on');

    //review if the LB was displayed before
    if (document.cookie.indexOf(cookieName) !== -1) {
        return;
    }

    //create the cookie and show the lightbox
    createCookie(cookieName, 'true', 365);

    //Add MaxMind Script
    addMaxmind(maxmindLookup);


  }


};
