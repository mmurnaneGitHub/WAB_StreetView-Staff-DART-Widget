///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidget',
  'esri/symbols/PictureMarkerSymbol',  //MJM
  'esri/graphic' //MJM
], function(declare, array, lang, html, on, 
  _WidgetsInTemplateMixin, BaseWidget,
  PictureMarkerSymbol, Graphic
) {

  var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
    baseClass: 'widget-street-view',

    startup: function() {
      streetviewWindow = null;   //for Street View Popup window - to be closed by name
      isIE_Edge = false;  //browser check
		//Detect IE:  MSIE = IE 10 or older | Trident/ = IE 11 
		if (window.navigator.userAgent.indexOf('MSIE ') > -1 ||  window.navigator.userAgent.indexOf('Trident/') > -1 || window.navigator.userAgent.indexOf("Edge") > -1)
		{
		  isIE_Edge = true;
		}
    },

    onClose: function() {
      this.map.graphics.clear();  //remove any map click graphic
      this._closePopup(); //close open popup window
      this.clickEvt.remove();  //stop listening for map click event
      this.map.onClick = defaultClick;  //restore default map click settings (enable any layer enabled popups)
    },

    _closePopup: function() {
      if (streetviewWindow != null){
        streetviewWindow.close(); //close open popup window
        streetviewWindow = null;  //need to destroy for IE, otherwise multiple popups onOpen
      }
    },

    onOpen: function() {
      defaultClick = this.map.onClick;  //current map click settings
      streetviewWindow = null;   //for Street View Popup window - to be closed by name
      this.clickEvt = this.map.on('click', lang.hitch(this, function(evt) {
        this.map.graphics.clear(); //clear previous click graphic

        var pictureMarkerSymbol = new PictureMarkerSymbol(this.folderUrl + '/images/sdk_gps_location.png', 28, 28);

        this.map.graphics.add(
          new esri.Graphic(
            evt.mapPoint,
            pictureMarkerSymbol
          )
        )

        //Map click location
        var currentLatitude = evt.mapPoint.getLatitude();
        var currentLongitude = evt.mapPoint.getLongitude();
        
        //Window Options - give windowName so the same tab is used everytime - https://developer.mozilla.org/en-US/docs/Web/API/Window/open

        //Options - need .focus() for IE
        if (document.getElementById('StreetViewMarker').checked){
          streetviewWindow = window.open('https://wspdsmap.cityoftacoma.org/website/Google/StreetView/?lat=' + currentLatitude + '&lon=' + currentLongitude, 'WindowNameStreetView', 'width=600,height=400');  //Go to Google Street View with marker
          if (isIE_Edge) {streetviewWindow.focus()}; //For IE - leaves popup in back if already open
          //streetviewWindow.focus(); //Needed for IE/Edge - leaves in back if already open
        } else if (document.getElementById('StreetViewTimeline').checked){
           if (isIE_Edge) {
           	alert('Sorry, link doesn\'t work in IE or Edge browsers. Please switch options (Step 1) or use Chrome instead.');  //Redirect in IE cause a new window to open every click (ca't reuse the same window)
           } else {
          	//Encode commas in url - https://www.w3schools.com/tags/ref_urlencode.asp
          	//Google Parameters - http://web.archive.org/web/20110903160743/http://mapki.com/wiki/Google_Map_Parameters#Street_View
          	streetviewWindow = window.open('https://maps.google.com/?q=' + currentLatitude + '%2C' + currentLongitude + '&layer=c&cbll=' + currentLatitude + '%2C' + currentLongitude + '&cbp=11%2C0%2C0%2C0%2C0', 'WindowNameStreetView', 'width=600,height=400');  //Go directly to Google
            streetviewWindow.focus(); //Needed for IE/Edge - leaves in back if already open
           }
        } else if (document.getElementById('StreetViewGE').checked){  
           if (isIE_Edge) {
           	alert('Sorry, Google Earth link only works in Chrome browsers. Please switch options (Step 1) or use Chrome instead.');
           } else {
           	streetviewWindow = window.open('https://earth.google.com/web/@' + currentLatitude + ',' + currentLongitude + ',100a,200d,35y,0h,45t,0r', 'WindowNameStreetView', 'width=600,height=400');  //https://www.gearthblog.com/blog/archives/2017/04/fun-stuff-new-google-earth-url.html
           }
        }
      }));
    }

  });

  return clazz;
});
