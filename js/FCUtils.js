///////////////////////////////////////////////////////////////////////////////
// STYLE DECLARATION
// Use double quotes in JavaScript


// To include files for VS to understand and query them, use this syntax..
// ///<reference path="../FCUtils.js" />

// Define the console if not already defined
if (!window.console) console = { log: function () { } };




///////////////////////////////////////////////////////////////////////////////
// Global Namespace for this application
//
var fc = fc || {};

// Level 1
fc.utils = new Object;

// Level 2
fc.utils.web = new Object;


///////////////////////////////////////////////////////////////////////////////
// VAR - Variables
//

fc.utils.isInvalidVar = function(obj) {
    if (typeof obj === 'undefined' || obj === null)
        return true;
    else
        return false;
}

fc.utils.isValidVar = function(obj) {
    return !fc.utils.isInvalidVar(obj);
}

//
///////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////
// TEXT
//

fc.utils.isEmptyString = function(obj) {

    // If the passed object is not defined, or the object is an empty string
    //  return true - the function is really used in the !IsEmptyString() way.

    if (fc.utils.isInvalidVar(obj))
        return true;
    if (obj === null)
        return true;
    if (obj === "")
        return true;

    return false;
}

fc.utils.isEmptyStringOrWhiteSpace = function (obj) {

    if (fc.utils.isInvalidVar(obj))
        return true;
    if (obj === null)
        return true;
    if (obj === "")
        return true;
    if (obj === " ")
        return true;
    // HTML space
    if (obj === "&nbsp;")
        return true;
    // A non breaking space char is code 160 
    // \xA0 Char Code 160
    if (obj == "\xA0")
        return true;

    // Maybe the object isnt even a string?  Try to convert and use string.replace to drop all spaces...
    var str = new String(obj);
    if (str.replace("/\s/g", "") == "") // expensive test done last, probably never actioned unless string starts with two spaces
        return true;

    return false;
}


fc.utils.prePad = function(sArg, sPad, nMinLength) {

    var nArgLength = sArg.length;
    var nPadLength = sPad.length;

    // Sanity checks
    if (nArgLength >= nMinLength)
        return sArg;

    if (nPadLength == 0)
        return sArg;

    var nPaddingLength = nMinLength - nArgLength; // Number of required characters

    var nDiv = (nPaddingLength / nPadLength) | 0; // Get the int number of times the pad string length divides into the padding required length
    var nMod = nPaddingLength % nPadLength; // This is the number of chars from the pad string that will need additionally to finish padding to required length

    var sReturn = "";
    var i = 0;
    for (; i < nDiv; ++i) {
        sReturn = sReturn + sPad;
    }

    var sPartialPad = "";
    if (nMod != 0) {
        sPartialPad = sPad.substring(0, nMod);
    }
    sReturn = sReturn + sPartialPad;

    return sReturn + sArg;
}

///////////////////////////////////////////////////////////////////////////////
//
// TEXTBOX DATA ENTRY
//
// Allow only certain characters to be entered.
// Usage: Attach this to the onkeypress event for an HTML textbox
//        eg onkeypress="return isNumberKey(event)" 
//           onkeypress="return isValidKey(event,'0123456789.-')"

fc.utils.isValidKey = function (event, sValidChars) {
    event = event || window.event;

    var charCode = (event.which) ? event.which : event.keyCode;                     // Get the character code of the key pressed

    if (charCode == 8 || charCode == 127) {                                        // Allow Backspace and Delete
        return true;
    }

    var index = sValidChars.indexOf(String.fromCharCode(charCode));
    if (index === -1)
        return false;
    else
        return true;
}

fc.utils.isNumericKey = function (event) {
    return fc.utils.isValidKey(event, "0123456789");
}

fc.utils.isDecimalKey = function (event) {
    return fc.utils.isValidKey(event, "0123456789.-");
}

fc.utils.isStrictDecimalKey = function (event) {
    var bIsDecimalKey = fc.utils.isValidKey(event, "0123456789.-");

    if (bIsDecimalKey == false)
        return false;
    else {
        // bIsDecimalKey is true, this is at least a numeric or dot or minus sign key
        event = event || window.event;
        var ctrlTextbox = document.getElementById(event.target.id);
        if (ctrlTextbox == null) return bIsDecimalKey;
        var sText = ctrlTextbox.value;

        var charCode = (event.which) ? event.which : event.keyCode;             // Get the character code of the key pressed

        if (charCode == 46) {                                                   // if '.' then only allow one dot
            // Only allow decimal point if there are no decimal points in the current box text
            var index = sText.indexOf(String.fromCharCode(charCode));
            if (index === -1) {
                // Not found, allow this key press
                return true;
            }
            else {
                // Found, the string already contains a decimal point, block this keypress
                return false;
            }
        }
        else if (charCode == 45) {                                                   // If '-', check the string, if first char is negative, remove, if not, add
            // Add a negative sign if there is not one at the start of the string
            var index = sText.indexOf(String.fromCharCode(charCode));
            if (index === -1) {
                // Not found, add a negative sign to the start of the string
                ctrlTextbox.value = "-" + ctrlTextbox.value;
            }
            else {
                // Found, remove character at found index
                ctrlTextbox.value = sText.substr(0, index) + sText.substr(index + 1);
            }
            // either way, block the keypress
            return false;
        }
    }

    // If not returned by now, this is a number, bIsDecimalKey should be true, return it...
    return bIsDecimalKey;
}

// Function to use for closure to force textboxes to certain keys and a maximum length
/* Version 1 - Did not allow standard editing techniques */
/*
fc.utils.isValidKeyAndMaxLength = function (event, sValidChars, nMaxChars) {

    if (!fc.utils.isValidKey(event, sValidChars))                               // If not a valid key
        return false;                                                           // suppress the keystroke

    var sCurrentText = event.target.value;                                      // Get the current content of the textbox (which raised the event)

    var nSelectedRange = event.target.selectionEnd - event.target.selectionStart;

    if (sCurrentText.length == nMaxChars && nSelectedRange == 0)                // If the textbox is 'full' and there is no selected range of characters being overtyped
        return false;                                                           // suppress the keystroke (does not suppress delete)

    return true;
}
*/

/* Version 2 - Passes cursor, shift and backspace keys through to allow editing */
fc.utils.isValidKeyAndMaxLength = function (event, sValidChars, nMaxChars) {

    event = event || window.event;

    var charCode = (event.which) ? event.which : event.keyCode;                     // Get the character code of the key pressed

    // Allow Backspace and Delete, left+right cursor, shift
    if (charCode == 8 || charCode == 127 ||
        charCode == 37 || charCode == 39 ||
        charCode == 16) {
        return true;
    }

    var index = sValidChars.indexOf(String.fromCharCode(charCode));
    if (index === -1)
        return false;

    var sCurrentText = event.target.value;                                      // Get the current content of the textbox (which raised the event)

    var nSelectedRange = event.target.selectionEnd - event.target.selectionStart;

    if (sCurrentText.length == nMaxChars && nSelectedRange == 0)                // If the textbox is 'full' and there is no selected range of characters being overtyped
        return false;                                                           // suppress the keystroke (does not suppress delete)

    return true;
}

fc.utils.isTextKeyAndMaxLength = function (event, nMaxChars) {
    // A Restricted set of text chars that should are not routinely used as
    // delimiters and should safely be used for data transfer.
    //
    // Not...
    // & - because it is a delimiter of fields
    // " - because it will stuff up string processing
    // ' - similarly, stuffs string manipulation
    // / - Unix and Windows delimiter
    // \ - DOS and Windows delimiter and escape character marker
    // ? - URL delimiter
    // 
    var sValidChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz !#()*+,-.:;<=>@[]^_`{}|~"
    return fc.utils.isValidKeyAndMaxLength(event, sValidChars, nMaxChars);
}

fc.utils.addKeyPressToTextbox = function (event) {
    // Note: This only ever adds text to the textbox string, regardless of current
    // cursor position.  This works but is not great.  Ideally, we want to insert
    // typed keystrokes at the cursor position.  If all things go according to plan
    // I should have written a better function called insertKeyPressToTextbox()
    // that does this.
    event = event || window.event;
    var charCode = (event.which) ? event.which : event.keyCode;                     // Get the character code of the key pressed
    var ctrlTextbox = document.getElementById(event.target.id);
    if (ctrlTextbox != null) {
        ctrlTextbox.value += String.fromCharCode(charCode);
    }
}




/*
function processBspDel(event) {
event = event || window.event;
var charCode = (event.which) ? event.which : event.keyCode;                     // Get the character code of the key pressed
var ctrlTextbox = document.getElementById(event.target.id);
if (ctrlTextbox != null) {
if (charCode == 8 || charCode == 127) {
// Backspace or Delete
var sCurrentText = ctrlTextbox.value;
var iSelectionStart = ctrlTextbox.selectionStart;
var iSelectionEnd = ctrlTextbox.selectionEnd;
var iSelectionRange = iSelectionEnd - iSelectionStart;
if (iSelectionRange == 0) {
// No range, just a caret.
// We need to make a range of 1 character that shifts by 1 dependent
// on whether the BSP or DEL key is pressed
if (charCode == 8) {
// BSP, move the selection start one char left
if (iSelectionStart != 0)
--iSelectionStart;
}
if (charCode == 127) {
// DEL, move the selection end one char right
if (iSelectionEnd != (sCurrentText.length - 1)) {
++iSelectionEnd;
}
}
// We should now have manufactured the range to remove
if ((iSelectionEnd - iSelectionStart) != 0) {
ctrlTextbox.value = removeRange(sCurrentText, iSelectionStart, iSelectionEnd);
}
}
else {
// There is a range, so remove chars in that range
ctrlTextbox.value = removeRange(sCurrentText, iSelectionStart, iSelectionEnd);
}
}
else {
if (isValidKey(event, "0123456789")) {
addKeyPressToTextbox(event);
}
                
}
}
}

*/

/*
function removeRange(sCurrentText, iStart, iEnd) {
var sBefore = sCurrentText.slice(0, iStart);
var sAfter = sCurrentText.slice(iEnd);
return sBefore + sAfter;
}
*/

//
///////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////
// JAVASCRIPT OBJECTS
//


fc.utils.isOnlyNullProperties = function(obj) {
    // Iterate the properties of an object.
    // As soon as you hit a property that is not null, return false.
    // If you traverse all properties and have not yet returned, return true, all properties are null.

    for (var property in obj) {
        if (obj[property] != null)
            return false;
    }

    return true;
}



// Dump an object to string representation for diagnostic output
fc.utils.objToString = function (obj, sDelim) {
        
    // Default argument value shorthand...
    sDelim = typeof sDelim !== 'undefined' ? sDelim : '\n';

    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + sDelim;
        }
    }
    return str;
}


// Dump an array of objects to string for diagnostics
fc.utils.arrayObjToString = function (arrayObj, sDelim) {
    var sReturn = "";
    for (var i = 0; i < arrayObj.length; ++i) {
        sReturn += "[";
        sReturn += fc.utils.objToString(arrayObj[i], sDelim);
        sReturn += "]";
    }
    return sReturn;
}



//
///////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////
// HTML ELEMENTS
//

///////////////////////////////////////////////////////////////////////////////
// Browser agnostic way to get/set text of an element.
// Note that although innerHTML is supported on all browsers as a way to g/set
// text on an element, if you just want to change the text, and not the full
// HTML, you have discrepancies between IE (innerText) and Firefox 
// (textContent).  This fn provides one masking function.
// Note: This function is overloaded, such that a single argument gets the 
// text, and two arguments set the text.
//
fc.utils.textContent = function(element, value) {

    var content = element.textContent;                                          // Check if textContent is defined

    if (value === undefined) {                                                  // Single argument, return element's text
        if (content !== undefined) {
            return content;
        }
        else {
            return element.innerText;
        }
    }
    else {                                                                      // Two arguments, set the held text
        if (content !== undefined) {
            element.textContent = value;
        }
        else {
            element.innerText = value;
        }
    }
}



///////////////////////////////////////////////////////////////////////////////
// WEB 
//

// ASP.NET apps have a site folder that is hard to know when you're running
fc.utils.web.getWebsiteRoot = function () {
    //var prefix = "fc.utils.web.getWebsiteRoot() - ";
    //console.log(prefix + "Entering");

    var root = window.location.protocol + "//" + window.location.host + "/"; // ie "http://localhost:56342/"

    var pathname = window.location.pathname;

    var arrayFolders = pathname.split("/"); // Each slash in the string splits into an empty string, so "/Mkt/" becomes ["","Mkt",""]

    if (fc.utils.isValidVar(arrayFolders)) {
        if (arrayFolders.length > 1) {
            root = root + arrayFolders[1] + "/";
        }
    }
    else {
        console.log(prefix + "ERROR: Variable arrayFolders is null or undefined.")
    }

    //console.log(prefix + "Exiting");
    return root;
}


///////////////////////////////////////////////////////////////////////////////
//
// COOKIES
//
// From W3Schools: http://www.w3schools.com/js/js_cookies.asp
//

fc.utils.setCookie = function(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

fc.utils.getCookie = function(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

// Example
/*
function checkCookie()
{
    var username=fc.utils.getCookie("username");
    if (username!=null && username!="")
    {
        alert("Welcome again " + username);
    }
    else
    {
        username=prompt("Please enter your name:","");
        if (username!=null && username!="")
        {
            fc.utils.setCookie("username",username,365);
        }
    }
}
*/

//
///////////////////////////////////////////////////////////////////////////////






///////////////////////////////////////////////////////////////////////////////
// DOM EVENTS
//


///////////////////////////////////////////////////////////////////////////////
// Invoke functions once the document is loaded
// 
// Usage: 
// Start by setting a flag to indicate that the document is not yet loaded...
//     onLoad.loaded = false;
// Then register a function to set the flag when the document loads...
//     onLoad(function(){ onLoad.loaded=true; });
//
fc.utils.onLoad = function (f) {
    if (onLoad.loaded)
        window.setTimeout(f, 0);
    else if (window.addEventListener)
        window.addEventListener("load", f, false);
    else if (window.attachEvent)
        window.attachEvent("onload", f);
}


// Browser agnostic way to wrap addEventListener and attachEvent so that
// event handler fns are invoked as methods of the target.  This is a work
// around for IE8- not supporting addEventListener().
// Note: handlers added this way cannot be removed.  See Flanagan p461
fc.utils.addEvent = function(target, type, handler) {
    if (target.addEventListener) {                                              // If this function is present, use it
        target.addEventListener(type, handler, false);                          // type="click",handler="myClickHandler", false refers to the subtleties of pre-post event handling, always false
    }
    else {
        target.attachEvent(
            "on" + type,                                                        // "onclick"
            function (event) {                                                  // event is effectively window.event, globally available event object
                return handler.call(target, event);
            });
    }
}



// Browser agnostic way to cancel events, regardless of how the event handler
// was registered.  You would want to cancel events if you want to prevent
// default behaviour, in such situations as form validation (where default 
// is to send, and you don't want to send on failed validation) and keyboard
// interception (where you want to stop certain keypresses from appearing in 
// an input text box) for example.
fc.utils.cancelHandler = function(event) {
    var event = event || window.event;                                          // For IE
    /* Do something to handle event if necessary */

    // Now cancel the default action
    if (event.preventDefault) {                                                 // Most browsers
        event.preventDefault();
    }

    if (event.returnValue) {                                                    // IE Specific
        event.returnValue = false;
    }

    return false;                                                               // For handlers registered as properties of controls directly
}

///////////////////////////////////////////////////////////////////////////////
// whenReady() is a function used to queue functions up that need to run once
// when a document has been parsed.  It will attempt to run the functions 
// before external elements are loaded (ie images).
// Usage: Pass a fn to whenReady() and it will be invoked as a document method
// when the document is parsed and ready for manipulation.  The registered fn's
// are triggered by the first DOMContentLoaded, readystatechange or load event
// that occurs.

var whenReady = (function () {
    var funcs = [];                                                             // array of functions to run when ready
    var ready = false;

    function handler(e) {                                                       // The event handler invoked when the document is ready

        if (ready) {                                                            // Run only once
            return;
        }

        if (e.type === "readystatechange" && document.readyState !== "complete") { // Only run if the readystate is complete, and not for any other ready state
            return;
        }

        for (var i = 0; i < funcs.length; i++) {
            funcs[i].call(document);                                            // Call each registered function as a method on the document object
        }

        ready = true;                                                           // Done once
        funcs = null;                                                           // Forget functions that have been run
    }

    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", handler, false);
        document.addEventListener("readystatechange", handler, false);
        window.addEventListener("load", handler, false);
    }
    else if (document.attachEvent) {
        document.attachEvent("onreadystatechange", handler);
        document.attachEvent("onload", handler);
    }

    return function whenReady(f) {
        if (ready) {                                                            // If immediately ready, run now
            f.call(document);
        }
        else {                                                                  // If document still loading, queue to run later
            funcs.push(f);
        }
    }

} ());



//
///////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////
//
// XHR XML HTTP Requests, AJAX etc. 
//

// Create an XMLHTTPRequest object on demand, of the correct type for the
// browser
//

fc.utils.getXHR = function () {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xmlhttp;
}

fc.utils.getXHR_CORS = function (method, url) {
    // Usage: var request = getXHR_CORS("POST", "http://www.stackoverflow.com/"); // Thanks, StackOverflow
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}


fc.utils.getXHRReadyStateDecoded = function (nReadyState) {
    // Decode the ready state for diagnostics
    switch (nReadyState) {
        case 1:
            return "OPEN(1)";
        case 2:
            return "SENT(2)";
        case 3:
            return "RECEIVING(3)";
        case 4:
            return "LOADED(4)";
        case 5:
            return "ABORTED(5)";
        default:
            return "UNKNOWN(" + nReadyState.toString() + ")";
    }
    return "";
}

//function lookupServerResponse(nCode) {
//    switch (nCode) {
//        case 12029: return "
//    }
//    return nCode.toString();
//}

//
///////////////////////////////////////////////////////////////////////////////






///////////////////////////////////////////////////////////////////////////////
//
// TABLE LAYOUT

// Make all the cells in a row the same size
fc.utils.equalWidthCells = function (row) {
    // Count the rows, 
    // Set the widths in the styles to a percentage based on number of cells

    if (row.cells.length == 0) return;

    var width = 100 / row.cells.length;
    var sWidth = Math.round(width, 2) + "%";

    // Iterate the cell array and set width for each cell
    for (var i = 0; i < row.cells.length;++i ) {
        row.cells[i].style.width = sWidth;
    }
}

//
///////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////
//
// MATHS

// Over-ride the Math.round function to take a decimal place argument
fc.utils._round = Math.round;
Math.round = function(number, decimals /* optional, default 0 */)
{
  if (arguments.length == 1)
    return fc.utils._round(number);

  var multiplier = Math.pow(10, decimals);
  return fc.utils._round(number * multiplier) / multiplier;
}



//
///////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////
//
// BROWSER DETECTION [http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser/9851769#9851769]
//

// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
fc.utils.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
fc.utils.isFirefox = typeof InstallTrigger !== 'undefined';

// At least Safari 3+: "[object HTMLElementConstructor]"
fc.utils.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

// Chrome 1+
fc.utils.isChrome = !!window.chrome && !fc.utils.isOpera;

// At least IE6
fc.utils.isIE = /*@cc_on!@*/false || document.documentMode;

//
///////////////////////////////////////////////////////////////////////////////





///////////////////////////////////////////////////////////////////////////////
//
// GRAPHICS AND PRESENTATION

// Sometimes you have to account for scrollbar widths etc.  
fc.utils.getScrollBarWidth = function () {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;

    document.body.removeChild(outer);

    return (w1 - w2);
};


// Sometimes you have to account for scrollbar widths etc.  
fc.utils.getScrollBarHeight = function () {
    var inner = document.createElement('p');
    inner.style.height = "100%";
    inner.style.width = "200px";

    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "150px";
    outer.style.height = "200px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    var h1 = inner.offsetHeight;
    outer.style.overflow = 'scroll';
    var h2 = inner.offsetHeight;
    if (h1 == h2) h2 = outer.clientHeight;

    document.body.removeChild(outer);

    return (h1 - h2);
};

fc.utils.getStyle = function (oElm, strCssRule) {
    var strValue = "";
    if (oElm.currentStyle) {
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1) {
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    else if (document.defaultView && document.defaultView.getComputedStyle) {
        var style = document.defaultView.getComputedStyle(oElm, "");
        strValue = style.getPropertyValue(strCssRule);
    }

    return strValue;
}

//
///////////////////////////////////////////////////////////////////////////////









///////////////////////////////////////////////////////////////////////////////
//
// TABLE FUNCTIONS

fc.utils.sortrows = function (table, n, comparator) {
    var tbody = table.tBodies[0];                                               // First <tbody>; may be implicitly created
    var rows = tbody.getElementsByTagName("tr");                                // Get all rows

    rows = Array.prototype.slice.call(rows, 0);                                 // Convert to array as a snapshot

    rows.sort(function (row1, row2) {
        var cell1 = row1.getElementsByTagName("td")[n];                         // Get nth cell
        var cell2 = row2.getElementsByTagName("td")[n];                         // of both rows

        var val1 = cell1.textContent || cell1.innerText;
        var val2 = cell2.textContent || cell2.innerText;

        if (comparator) {
            // If you've been passed a fn to use as a comparator, use it
            return comparator(val1, val2);
        }

        // else, do a default comparison
        if (val1 < val2) {
            return -1;
        }
        else if (val1 > val2) {
            return 1;
        }
        else {
            return 0;
        }
    }); // end of rows.sort(fn)

    // Append rows into tbody in sorted order.
    // Note that the rows are implicitly removed, and that any nodes that are 
    // not rows <tr> will be above the sorted rows

    var i = 0;
    for (; i < rows.length; i++) {
        tbody.appendChild(rows[i]);
    }

} // end of sortrows()



// Flanagan generic sortable routine
fc.utils.makeSortable = function (table) {
    var headers = table.getElementsByTagName("th");
    var i = 0;

    for (; i < headers.length; ++i) {                                           // Step through each of the headers
        (function (n) {                                                         // Call this anonymous function with argument i
            headers[i].onclick = function () {                                  // Attach a function with a closed n value to each header's onclick event
                fc.utils.sortrows(table, n);                                             // Close off an instance of sortrows with value n and make it a fn
            };
        } (i));
    }
} // end of makeSortable()


// Hibbert custom sortable routine
fc.utils.makeHeaderSortable = function (table) {
    // For tables that have been made scrollable, the header is now in a distinct 
    // table that is named after the body table.  The header table should take a
    // name that is the same as the body table, except there is a prefix and or
    // suffix, that exist as global variables.

    if (sHeaderSuffix == null || sHeaderPrefix == null)
        return; // exit if not using distinct header tables

    var sHeaderTableID = sHeaderPrefix + table.id + sHeaderSuffix;
    var tableHeader = document.getElementById(sHeaderTableID);
    if (tableHeader == null)
        return;

    var headers = tableHeader.getElementsByTagName("th"); // Get the header cells
    var i = 0;

    // Attach a function to header cell onclick event to trigger sorting
    for (; i < headers.length; ++i) {
        (function (n) {                                                         // Call this anonymous function with argument i
            headers[i].onclick = function () {                                  // Attach a function with a closed n value to each header's onclick event
                fc.utils.sortrowsWithDistinctHeadersFlipOrder(table, n);                 // Close off an instance of sortrows with value n and make it a fn
            };
        } (i));
    }

} // end of makeHeaderSortable()


// Function to sort a GridView table based on the currently saved Cookie info.
// This is called once when the page is reloaded, to re-instate the last used sort order.
fc.utils.sortTable = function (sTable, sDefaultColumnName) {
    var table = document.getElementById(sTable);
    if (table != null) {

        // If there's a saved column to sort on, sort on it
        var tableId = table.id;

        if (typeof (tableId) == 'undefined' || tableId == "")
            return;

        var sortColCName = tableId + "_SortCol";
        var sortCol = fc.utils.getCookie(sortColCName);

        if (sortCol != null && sortCol != "") {
            // We have a column that we used for sorting
            var col = new Number(sortCol);
            if (col != null && col != NaN)
                fc.utils.sortrowsWithDistinctHeaders(table, col);
        }
        else {
            // No previous column was used, try to use default
            if (!fc.utils.isEmptyString(sDefaultColumnName)) {
                var iCol = fc.utils.getColIndexByName(table, sDefaultColumnName);
                if (iCol != -1) {
                    fc.utils.sortrowsWithDistinctHeaders(table, iCol);
                }
            }
        }
    }

} // end of sortTable()

fc.utils.getColIndexByName = function (table, sDefaultColumnName) {

    if (sHeaderSuffix == null || sHeaderPrefix == null)
        return -1; // exit if not using distinct header tables

    var sHeaderTableID = sHeaderPrefix + table.id + sHeaderSuffix;
    var tableHeader = document.getElementById(sHeaderTableID);
    if (tableHeader == null)
        return -1;

    var headers = tableHeader.getElementsByTagName("th"); // Get the header cells
    var i = 0;

    // Attach a function to header cell onclick event to trigger sorting
    for (; i < headers.length; ++i) {
        if (headers[i].innerHTML == sDefaultColumnName) {
            return i;
        }
    }

    // Not yet returned, failed
    return -1;
}


fc.utils.getColIndicesByNames = function (table, arrayColumnNames) {

    var arrayIndices = [];
    arrayIndices.length = 0;

    if (sHeaderSuffix == null || sHeaderPrefix == null)
        return arrayIndices; // exit if not using distinct header tables

    var sHeaderTableID = sHeaderPrefix + table.id + sHeaderSuffix;
    var tableHeader = document.getElementById(sHeaderTableID);
    if (tableHeader == null)
        return arrayIndices;

    var headers = tableHeader.getElementsByTagName("th"); // Get the header cells
    var i = 0;

    for (var j = 0; j < arrayColumnNames.length; ++j) {
        var bFound = false;
        for (var i = 0; i < headers.length && bFound == false; ++i) {
            var sColNameInHeader = headers[i].innerHTML;
            var sColNameToFind = arrayColumnNames[j]
            if (sColNameInHeader == sColNameToFind) {
                arrayIndices.push(i);
                bFound = true;
            }
        }
    }

    return arrayIndices;
}


// Hibbert custom sort routine where the header used for formatting is an
// invisible row at the end of the table, and the real header is actually
// a distinct table.
fc.utils.sortrowsWithDistinctHeaders = function (table, n, comparator) {

    var bColIsNumeric = fc.utils.isColumnNumeric(table, n);

    if (sHeaderSuffix == null || sHeaderPrefix == null)
        return;

    var sHeaderTableID = sHeaderPrefix + table.id + sHeaderSuffix;
    var tableHeader = document.getElementById(sHeaderTableID);
    if (tableHeader == null)
        return;

    // Iterate the cells and remember the widths
    var cellWidths = new Array();
    var rowTop = tableHeader.rows[0];
    var countCells = rowTop.cells.length;
    for (var i = 0; i < countCells; ++i) {
        var cell = rowTop.cells[i]

        // Try to get width from style
        var sCellWidth = getStyle(cell, "width");
        var nCellWidth = parseInt(sCellWidth, 10);

        cellWidths[i] = nCellWidth;
    }


    // Get the cookie settings, if they exist
    var sortOrder = "DESC";
    var sortOrderCName = table.id + "_SortOrder";
    var lastSortOrder = getCookie(sortOrderCName);
    if (lastSortOrder != null && lastSortOrder != "") {
        // Re-apply the saved sort order
        sortOrder = lastSortOrder;
    }
    // else, remains "DESC"

    var rows = table.getElementsByTagName("tr");                                // Get all rows

    rows = Array.prototype.slice.call(rows, 0);                                 // Convert to array as a snapshot

    var rowsBlank = getBlankRows(rows);                                         // Extract all blank rows to another storage object

    rows.sort(function (row1, row2) {
        var cell1 = row1.getElementsByTagName("td")[n];                         // Get nth cell
        var cell2 = row2.getElementsByTagName("td")[n];                         // of both rows

        // Handle undefined cell case
        if (typeof (cell1) == 'undefined' && typeof (cell2) == 'undefined') {
            return 0;
        }
        else if (typeof (cell1) == 'undefined') {                                 // cell2 wins, return 1
            return 1;
        }
        else if (typeof (cell2) == 'undefined') {                                 // cell1 wins, return -1
            return -1;
        }

        // Cells are defined, extract values for comparison
        var val1 = cell1.textContent || cell1.innerText;
        var val2 = cell2.textContent || cell2.innerText;

        if (comparator) {
            // If you've been passed a fn to use as a comparator, use it
            return comparator(val1, val2);
        }

        if (bColIsNumeric)
            return fc.utils.numericComparator(val1, val2);

        // else, do a default comparison
        return fc.utils.defaultComparator(val1, val2);

    });         // end of rows.sort(fn)

    // Append rows into tbody in sorted order.
    // Note that the rows are implicitly removed, and that any nodes that are 
    // not rows <tr> will be above the sorted rows

    var i = 0;
    if (sortOrder == "ASC") {
        // Ascending order
        for (; i < rows.length; i++) {
            var row = rows[i];
            for (var j = 0; j < countCells; ++j) {
                row.cells[j].style.width = parseInt(cellWidths[j], 10) + "px";
            }

            table.appendChild(row);
        }
    }
    else {
        // Descending order
        i = rows.length - 1; // Start at last row
        for (; i >= 0; --i) {
            var row = rows[i];
            for (var j = 0; j < countCells; ++j) {
                row.cells[j].style.width = parseInt(cellWidths[j], 10) + "px";
            }
            table.appendChild(row);
        }
    }

    // Add the blank rows back on
    var countBlankRows = rowsBlank.length;
    for (var i = 0; i < countBlankRows; ++i) {
        var row = rowsBlank[i][0];
        for (var j = 0; j < countCells; ++j) {
            row.cells[j].style.width = parseInt(cellWidths[j], 10) + "px";
        }
        table.appendChild(row);
    }

    // Save the sort column and order
    var sortColCName = table.id + "_SortCol";
    setCookie(sortColCName, n.toString(10), 3);
    setCookie(sortOrderCName, sortOrder, 3);

} // end of sortrowsWithDistinctHeaders()


fc.utils.getBlankRows = function (arrayRows) {
    // Take an array of rows, return the blank rows, leaving full rows
    //var rowsBlank = new HTMLTableRowElement[];
    var rowsBlank = [];
    rowsBlank.length = 0;

    var i = arrayRows.length;
    while (i--) {
        // i should now point at (length-1) ie item at the current end of the array
        if (fc.utils.isBlankRow(arrayRows[i])) {
            // Remove row from source array and add to blank array
            rowsBlank.push(arrayRows.splice(i, 1)); // Remove 1 from position i, return that row, add that row to blank array
        }
    }
    return rowsBlank;
}


fc.utils.getThisManyBlankRows = function (table, n) {
    // Given a table, return an array of n blank rows, or less if there are fewer than the required amount.
    // This loop starts at the base of the table, assuming that blank padding rows are appended to the 
    // base of a table in most circumstances.
    var rowsBlank = [];
    rowsBlank.length = 0;

    var i = table.rows.length - 1;
    for (; i >= 0 && rowsBlank.length < n; i--) {
        if (fc.utils.isBlankRow(table.rows[i]))
            rowsBlank.push(table.rows[i]);
    }
    return rowsBlank;
}


fc.utils.isBlankRow = function (row) {
    // Take a row as argument.
    // Iterate the cells in the row, if all white space or null, row is blank, else, not
    var countCells = row.cells.length;
    var bRowIsBlank = true;
    for (var i = 0; (i < countCells && bRowIsBlank == true); ++i) {
        var sCell = row.cells[i].innerHTML;
        if (!fc.utils.isEmptyStringOrWhiteSpace(sCell))
            bRowIsBlank = false;
    }
    return bRowIsBlank;
}


fc.utils.isDataRow = function (row) {
    // Take a row, return true if this is a 'td' type row (as opposed to 'th')

    // Sanity
    if (row.cells.length == 0)
        return false;

    var cell = row.cells[0];
    if (cell.tagName.toLowerCase() == "td")
        return true;
    else
        return false;
}



fc.utils.sortrowsWithDistinctHeadersFlipOrder = function (table, n, comparator) {
    // Wrapper function that checks the column being ordered, and if it is the
    // same as the last column used for ordering, reverses the sort order
    var sortColCName = table.id + "_SortCol";
    var sortOrderCName = table.id + "_SortOrder";

    var savedCol = fc.utils.getCookie(sortColCName);
    if (savedCol != null && savedCol != "") {
        // We have a saved column - is it this column
        if (savedCol == n.toString()) {
            // We have ordered this column before, flip the order
            var savedOrder = fc.utils.getCookie(sortOrderCName);
            if (savedOrder != null && savedOrder != "") {
                // We have a saved ordering criteria, reverse it and save it
                if (savedOrder == "ASC") {
                    setCookie(sortOrderCName, "DESC", 3);
                }
                else {
                    setCookie(sortOrderCName, "ASC", 3);
                }
            }
        }
    }

    fc.utils.sortrowsWithDistinctHeaders(table, n, comparator);

} // end of sortrowsWithDistinctHeadersFlipOrder


fc.utils.isColumnNumeric = function (table, n) {   // where n is the column number

    // Iterate the row, access the cell of column n, if the text of column is not 
    // null, or the empty string, check it for being a number by converting to a Number
    // If it returns NaN, it's not a real number, and this is not a column of numbers

    var countRows = table.rows.length;
    var i = 0;

    var bAllCellsAreNull = new Boolean(true);
    var bAllCellsAreUndefined = new Boolean(true);

    for (; i < countRows; ++i) {
        var row = table.rows[i];
        var cell = row.getElementsByTagName("td")[n];                         // Get nth cell

        if (typeof (cell) != 'undefined') {

            bAllCellsAreUndefined = false;

            var textval = cell.textContent || cell.innerText;

            if (textval != null && textval != "") {

                var nvalue = new Number(textval);

                if (isNaN(nvalue))
                { return false; }                                               // We have text that is not a number, this is not a column of real numberselse
                else
                { bAllCellsAreNull = false; }                                   // Real number            

            }
        }

    } // end of "for (; i < countRows; ++i)", for each row    

    if (bAllCellsAreNull || bAllCellsAreUndefined) // Column of empty cells
        return false;

    return true; // have not exited yet, must have passed all tests
}


fc.utils.numericComparator = function (val1, val2) {
    // val1 and val2 should be the innerText of table cells

    // Null handling
    if (val1 == null && val2 == null)
        return 0;
    if (val1 == null) // and implicitly, val2 is not null, val2 is greater, return -1
        return -1;
    if (val2 == null) // and implicitly, val1 is not null, val1 is greater, return 1
        return 1;
    // else, we have two valid strings

    /*
    // Empty String handling
    if (val1 == "" && val2 == "")
    return 0;
    if (val1 == "") // and val2 is not null or empty string, val2 is greater, return -1
    return -1;
    if (val2 == "") // va1 is a valid string
    return 1;
    // else, we have two valid strings that are not empty
    */

    // Null or Empty String Handling
    if (fc.utils.isEmptyStringOrWhiteSpace(val1) && fc.utils.isEmptyStringOrWhiteSpace(val2))
        return 0;
    if (fc.utils.isEmptyStringOrWhiteSpace(val1))
        return -1;
    if (fc.utils.isEmptyStringOrWhiteSpace(val2))
        return 1;
    // else we have two non-white space strings


    var n1 = new Number(val1);
    var n2 = new Number(val2);

    // NaN handling
    if (isNaN(n1) && isNaN(n2))
        return 0;
    if (isNaN(n1)) // and n2 is a legit number, n2 wins, return -1
        return -1;
    if (isNaN(n2)) // and n1 is a legit number, n1 wins, return 1
        return 1;
    // else, we have two legit values

    // Real Number handling
    if (n1 > n2)
        return 1;
    else if (n2 > n1)
        return -1;
    else
        return 0;
}


fc.utils.defaultComparator = function (val1, val2) {

    /*
    // Null handling
    if (val1 == null && val2 == null)
    return 0;
    if (val1 == null) // and implicitly, val2 is not null, val2 is greater, return -1
    return -1;
    if (val2 == null) // and implicitly, val1 is not null, val1 is greater, return 1
    return 1;
    // else, we have two valid strings
    */

    // Null or Empty String Handling
    if (fc.utils.isEmptyStringOrWhiteSpace(val1) && fc.utils.isEmptyStringOrWhiteSpace(val2))
        return 0;
    if (fc.utils.isEmptyStringOrWhiteSpace(val1))
        return -1;
    if (fc.utils.isEmptyStringOrWhiteSpace(val2))
        return 1;
    // else we have two non-white space strings

    if (val1 < val2) {
        return -1;
    }
    else if (val1 > val2) {
        return 1;
    }
    else {
        return 0;
    }
}


//
///////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////
//
// CSS 

function SwapCSSClass(sCurrentClass, sClassToRemove, sClassToAdd) {
    // With CSS, you might want to flip between two classes.  These classes
    // might be part of a cascade string "ClassA ClassB ClassToRemove ClassD"
    // so you would have to removed the target class and preserve the 
    // class cascade structure.
    // The object of this function is to swap in ClassToAdd in place of 
    // ClassToRemove, preserving the ordering. 
    // If the ClassToRemove is not found, the ClassToAdd is appended.
    // Returns a string representation of the rejigged class cascade.

    var arrayClasses = sCurrentClass.split(" ");

    var indexClassToRemove = -1;
    var arrayClassesSize = arrayClasses.length;

    if (!fc.utils.isEmptyString(sClassToRemove)) {
        // We have a class to remove

        var i = 0;
        for (; i < arrayClassesSize; ++i) {
            if (arrayClasses[i] == sClassToRemove) {
                // Found
                indexClassToRemove = i;
                arrayClasses[i] = "";
            }
        }
    }

    if (!fc.utils.isEmptyString(sClassToAdd)) {
        // We have a class to add

        if (indexClassToRemove == -1) {
            // Did not find the ClassToRemove, so just append the ClassToAdd
            arrayClasses.push(sClassToAdd);
        }
        else {
            // Found the ClassToRemove, so put the ClassToAdd in it's place
            arrayClasses[indexClassToRemove] = sClassToAdd;
        }
    }


    // Spin out the array into a string, ignoring empty strings
    var j = 0;
    var once = 0;
    var sClassReturn = new String();
    arrayClassesSize = arrayClasses.length;
    for (; j < arrayClassesSize; ++j) {
        if (arrayClasses[j] != "") {

            if (once != 0) {
                sClassReturn += " ";
            }

            sClassReturn += arrayClasses[j];
            once = 1;
        }
    }

    return sClassReturn;
}

//
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
//
// Dates and Times

fc.utils.getUTCTimestampString = function () {
    // Return a UTC timestamp string
    // "YYYYMMDD-HH:MM:SS.fff"

    var sReturnDateString = "";

    var dateNow = new Date();

    var sYear = (dateNow.getUTCFullYear()).toString(); // Four digit year as a number

    // Month is zero based index, Jan=0, Feb=1 etc - Bravo, ECMA
    var nMonth = dateNow.getUTCMonth();
    ++nMonth; // Fix UTC format expects a 1-based month code
    var sMonth = nMonth < 10 ? ("0" + nMonth.toString()) : nMonth.toString();

    var nDay = dateNow.getUTCDate(); // Date returns a day code 1-31
    var sDay = nDay < 10 ? ("0" + nDay.toString()) : nDay.toString(); ;

    var nHours = dateNow.getUTCHours();
    var nMinutes = dateNow.getUTCMinutes();
    var nSeconds = dateNow.getUTCSeconds();
    var nMillis = dateNow.getUTCMilliseconds();

    var sHours = nHours < 10 ? ("0" + nHours.toString()) : nHours.toString();
    var sMinutes = nMinutes < 10 ? ("0" + nMinutes.toString()) : nMinutes.toString();
    var sSeconds = nSeconds < 10 ? ("0" + nSeconds.toString()) : nSeconds.toString();

    var sMillis = nMillis.toString(10);
    sMillis = fc.utils.prePad(sMillis, "0", 3);

    // "YYYYMMDD-HH:MM:SS.fff"
    sReturnDateString = sYear + sMonth + sDay + "-" + sHours + ":" + sMinutes + ":" + sSeconds + "." + sMillis;

    return sReturnDateString;
}

//
///////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////
//
// Ajax Synchronisation 
// See: http://www.developer.com/lang/jscript/article.php/3592016/AJAX-from-Scratch-Implementing-Mutual-Exclusion-in-JavaScript.htm

// The command function will attach functions to an object, and an ID number.
// The synchronised api is the multithreaded one.
// Running the synchronised api forces the asynchronous commands to complete
// before the next asynchronised command is attempted.

function Command() {
    if (!Command.NextID) Command.NextID = 0; //define class variable

    this.id = ++Command.NextID;              //define instance variable

    // unsynchronized API
    this.doit = function () { alert("DOIT called"); /*override me*/ }
    this.undo = function () { alert("UNDO called"); /*override me*/ }
    this.redo = function () { this.doit();          /*override me*/ }

    // synchronized API
    this.syncDoIt = function () { new Mutex(this, "doit"); }
    this.syncUnDo = function () { new Mutex(this, "undo"); }
    this.syncReDo = function () { new Mutex(this, "redo"); }
}



// Mutex object constructor
function Mutex(cmdObject, methodName) {
    // Define static variable and method
    if (!Mutex.Wait) Mutex.Wait = new Map();                                                // If the mutex object does not have a Wait property yet, make one now, as a new Map() object.  Map is effectively a queue.

    //
    Mutex.SLICE = function (cmdID, startID) {
        Mutex.Wait.get(cmdID).attempt(Mutex.Wait.get(startID));                             // Return the object at property index cmdID, and call it's attempt function with startID as it's parameter
    }

    // Define instance method
    this.attempt = function (start) {
        for (var j = start; j; j = Mutex.Wait.next(j.c.id)) {                               // Begin at the start, iterate the queue of waiting functions
            if (j.enter || (j.number && (j.number < this.number ||
                (j.number == this.number && j.c.id < this.c.id))))
                return setTimeout("Mutex.SLICE(" + this.c.id + "," + j.c.id + ")", 10);
        }
        this.c[this.methodID](this.c.argument0);    //run with exclusive access using this parameter
        this.number = 0;              //release exclusive access
        Mutex.Wait.remove(this.c.id);
    }

    // Constructor logic
    this.c = cmdObject;
    this.methodID = methodName;
    Mutex.Wait.add(this.c.id, this);    //enter and number are "false"
    this.enter = true;
    this.number = (new Date()).getTime();
    this.enter = false;
    this.attempt(Mutex.Wait.first());
}

// Map constructor.
// 
function Map() {
    this.map = new Object();
    // Map API
    this.add = function (k, o) { this.map[k] = o; }                             // Add o at property index k
    this.remove = function (k) { delete this.map[k]; }                          // Delete object at property index k
    this.get = function (k) { return k == null ? null : this.map[k]; }          // Return object at property index k
    this.first = function () { return this.get(this.nextKey()); }               // Return object at head of queue
    this.next = function (k) { return this.get(this.nextKey(k)); }              // Return next object in queue
    this.nextKey = function (k) {
        for (i in this.map) {
            if (!k) return i;
            if (k == i) k = null;    /*tricky*/
        }
        return null;
    }
}

// Example unsynchronised HTML/JS that will have synchronisation issues...
// The code depicts an Ajax call to pull in some data.  The call is started
// by the page loading, and completed by the callback processReply().
// The user is presented with a button 'Clear', that will blank the output
// area.  Obviously the button can clear the area before the processReply()
// function has run.
/*
<html>
<script language="JavaScript">
    
function requestData() {
...set up asynchronous XML request...
XMLreq.onreadystatechange = newState;
...launch XML request...
}

function processReply() {
var transformedData  = ...process received data into HTML...
OutputArea.innerHTML = transformedData + "<br>";
}

function clearArea() { 
OutputArea.innerHTML = "cleared<br>"; 
}

function newState () {
if (XMLreq.readyState==4) processReply(); 
}

</script>
<body onload="requestData();">
<input type="button" value="clear" onclick="clearArea()">
<div id="OutputArea"/>
</body>
</html>
*/
// End of asynchronous code with possible race condition issues.


/* Example asynchronous code converted to run synchronously using Mutex
//
<html>
<script src="mutex.js"></script> // Assumes mutex.js is available

<script language="JavaScript">
    
function requestData() { 
new Mutex(new RequestDataCmd(),"go"); 
}

function processReply() { 
new Mutex(new ProcessReplyCmd(),"go"); 
}

function clearArea() { 
new Mutex(new ClearAreaCmd(),"go"); 
}

function newState() { 
if (XMLreq.readyState==4) processReply(); 
}

var NEXT_CMD_ID = 0;

function RequestDataCmd() { 
this.id = ++NEXT_CMD_ID;
this.go = function() {
...set up asynchronous XML request...
XMLreq.onreadystatechange = newState;
...launch XML request...
}
}

function ProcessReplyCmd() { 
this.id = ++NEXT_CMD_ID;
this.go = function(){
var transformedData  = ...process received data into HTML...
OutputArea.innerHTML = transformedData + "<br>";
}
}

function ClearAreaCmd() { 
this.id = ++NEXT_CMD_ID;
this.go = function() { 
OutputArea.innerHTML = "cleared<br>"; 
}
}
</script>

// Same HTML code as before...
<body onload="requestData();">
<input type="button" value="clear" onclick="clearArea()">
<div id="OutputArea"/>
</body>
</html>

*/
// End of async code converted to synchronous behaviour using Mutex

//
///////////////////////////////////////////////////////////////////////////////
