///////////////////////////////////////////////////////////////////////////////
// STYLE DECLARATION
// Use double quotes in JavaScript


// To include files for VS to understand and query them, use this syntax..
///<reference path="../FCUtils.js" />

// Define the console if not already defined
if (!window.console) console = { log: function () { } };



///////////////////////////////////////////////////////////////////////////////
// Global Namespace for this application
//
var kawasu = kawasu || {};

if (fc.utils.isInvalidVar(kawasu.microtable)) { kawasu.microtable = new Object(); }

kawasu.microtable.sEmptyString = "&nbsp;";



///////////////////////////////////////////////////////////////////////////////
// Set some class variables up
//
kawasu.microtable.config = new Object();

// Table view states
kawasu.microtable.config.STACK = 1;
kawasu.microtable.config.VERTICAL = 0;

/*
kawasu.microtable.config.sTableHeaderPrefix = "table_";
kawasu.microtable.config.sTableHeaderSuffix = "_Header";
*/





///////////////////////////////////////////////////////////////////////////////
// ENTRY POINT
//

kawasu.microtable.build = function (arrData, styleDefn, sTableID, nViewState) {
    var prefix = "kawasu.microtable.build() - ";
    console.log(prefix + "Entering");

    // Cache the styleDefn for use later.  All data pertaining to this table
    // will then be stored in this area.
    kawasu.microtable[sTableID] = new Object();
    kawasu.microtable[sTableID]["arrData"] = arrData;
    kawasu.microtable[sTableID]["styleDefn"] = styleDefn;
    kawasu.microtable[sTableID]["viewState"] = nViewState;


    // Header object is created by walking the inbound data and 
    // creating a property on a new object for every unique 
    // property on the objects in the arrData array.
    kawasu.microtable[sTableID]["header"] = kawasu.microtable.buildHeaderData(arrData);

    kawasu.microtable[sTableID]["rawTables"] = kawasu.microtable.buildRawTables(sTableID); // returns array of tables

    if (fc.utils.isInvalidVar(kawasu.microtable[sTableID]["rawTables"])) {
        console.log(prefix + "ERROR: Failed to create raw tables.");
        return;
    }
    
    kawasu.microtable.applyViewState(sTableID);


    // DIAGNOSTICS
    // Iterate returned array and display tables
    for (var i = 0; i < kawasu.microtable[sTableID]["rawTables"].length; ++i) {
        (document.getElementById("divContainer")).appendChild(kawasu.microtable[sTableID]["rawTables"][i]);
    }
    // END DIAGNOSTICS


    /*
    // Check that rawtable is defined before attempting next step
    if (fc.utils.isValidVar(rawTables)) {
    console.log(prefix + "CHECK: rawTables have been created...");
    //return kawasu.microtable.buildScrollingTable(rawTable, nRowsToShow, bExtendLastColOverScrollbar);
    }
    // implicit else
    console.log(prefix + "ERROR: Failed to create rawTable from arrData array of JSON Objects passed in.");
    */

    console.log(prefix + "Exiting");
}


kawasu.microtable.buildHeaderData = function (arrayJsonObjects) {
    var prefix = "kawasu.microtable.buildHeaderData() - ";
    console.log(prefix + "Entering");

    // Take an array of Json objects, and build an object that
    // has properties that are all the unique headers.

    var header = new Object();

    for (var i = 0; i < arrayJsonObjects.length; ++i) {

        // arrayJsonObjects[i] is the current object.
        // Iterate it's properties, make a property 
        // in the header object for each one

        var obj = arrayJsonObjects[i]; // Reference the object to avoid repeatedly indexing it
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                header[property] = "";
            }
        }

    }

    return header;

    console.log(prefix + "Exiting");
}

kawasu.microtable.buildRawTables = function (sTableID) {
    var prefix = "kawasu.microtable.buildRawTables() - ";
    console.log(prefix + "Entering");


    // This fn takes an array of JSON objects and creates a set of HTML table from them, 
    // one table per object, applying the styles listed in the styleDefn object.

    var arrData = kawasu.microtable[sTableID]["arrData"];
    var header = kawasu.microtable[sTableID]["header"];
    var styleDefn = kawasu.microtable[sTableID]["styleDefn"];
    kawasu.microtable[sTableID]["indexCurrentRow"] = 1;

    var rawTables = [];

    var classTable = styleDefn["tableClass"] || "";
    var classRowHeader = styleDefn["trClassHeader"] || "";
    var classHeaderCell = styleDefn["thClass"] || "";
    var classCol1 = styleDefn["classCol1"] || "";
    var classRowData = styleDefn["trClassData"] || "";
    var classCellKey = styleDefn["tdClassKey"] || "";
    var classCellValue = styleDefn["tdClassValue"] || "";
    var classBtnRowNavigate = styleDefn["buttonRowNavigate"] || "";
    var classTextboxRowNavigate = styleDefn["textboxRowNavigate"] || "";


    ///////////////////////////////////////////////////////////////////////////
    // Make the control table.  In stack mode, this controls navigation.
    //
    var tableControl = document.createElement("table");
    var classTable = styleDefn["tableClass"] || "";
    tableControl.className = classTable;
    tableControl.id = sTableID + "_Control";

    var trHeaderControl = document.createElement("tr");
    trHeaderControl.className = classRowHeader;

    // Make Control Header cells
    var th1Control = document.createElement("th");

    // Make the textbox control for row navigation
    var labelRowNavigate = document.createElement("label");
    labelRowNavigate.innerHTML = "Row: ";
    th1Control.appendChild(labelRowNavigate);
    var textboxRowNavigate = document.createElement("input");
    textboxRowNavigate.type = "textbox";
    textboxRowNavigate.id = sTableID + "_" + "textboxRowNavigate";
    textboxRowNavigate.value = (kawasu.microtable[sTableID]["indexCurrentRow"]);
    textboxRowNavigate.className = classTextboxRowNavigate;

    fc.utils.addEvent(textboxRowNavigate, "change", kawasu.microtable.textboxRowNavigate_onChange);
    //fc.utils.addEvent(textboxRowNavigate, "onkeyup", kawasu.microtable.textboxRowNavigate_onKeyUp);
    //fc.utils.addEvent(textboxRowNavigate, "onkeypress", fc.utils.isNumericKey);
    textboxRowNavigate.setAttribute("onkeyup", "return kawasu.microtable.textboxRowNavigate_onKeyUp(event)");
    textboxRowNavigate.setAttribute("onkeypress", "return kawasu.microtable.textboxRowNavigate_onKeyPress(event)");

    th1Control.appendChild(textboxRowNavigate);

    th1Control.className = classHeaderCell + " " + classCol1;
    trHeaderControl.appendChild(th1Control);

    var th2Control = document.createElement("th");

    // First Row Button
    var btnRowFirst = document.createElement("input");
    btnRowFirst.type = "button";
    btnRowFirst.id = sTableID + "_" + "btnRowFirst";
    btnRowFirst.value = "<<";
    btnRowFirst.title = "First";
    btnRowFirst.className = classBtnRowNavigate;
    fc.utils.addEvent(btnRowFirst, "click", kawasu.microtable.btnRowNavigate_onClick);
    th2Control.appendChild(btnRowFirst);

    // Previous Row Button
    var btnRowPrev = document.createElement("input");
    btnRowPrev.type = "button";
    btnRowPrev.id = sTableID + "_" + "btnRowPrev";
    btnRowPrev.value = "<";
    btnRowPrev.title = "Previous";
    btnRowPrev.className = classBtnRowNavigate;
    fc.utils.addEvent(btnRowPrev, "click", kawasu.microtable.btnRowNavigate_onClick);
    th2Control.appendChild(btnRowPrev);

    // Next Row Button
    var btnRowNext = document.createElement("input");
    btnRowNext.type = "button";
    btnRowNext.id = sTableID + "_" + "btnRowNext";
    btnRowNext.value = ">";
    btnRowNext.title = "Next";
    btnRowNext.className = classBtnRowNavigate;
    fc.utils.addEvent(btnRowNext, "click", kawasu.microtable.btnRowNavigate_onClick);
    th2Control.appendChild(btnRowNext);

    // Last Row Button
    var btnRowLast = document.createElement("input");
    btnRowLast.type = "button";
    btnRowLast.id = sTableID + "_" + "btnRowLast";
    btnRowLast.value = ">>";
    btnRowLast.title = "Last";
    btnRowLast.className = classBtnRowNavigate;
    fc.utils.addEvent(btnRowLast, "click", kawasu.microtable.btnRowNavigate_onClick);
    th2Control.appendChild(btnRowLast);


    th2Control.className = classHeaderCell;
    trHeaderControl.appendChild(th2Control);

    tableControl.appendChild(trHeaderControl);

    rawTables.push(tableControl);



    ///////////////////////////////////////////////////////////////////////////
    // Iterate the inbound data, make one table per object 
    //
    for (var i = 0; i < arrData.length; ++i) {

        var obj = arrData[i];


        // Make table
        var table = document.createElement("table");
        table.className = classTable;
        table.id = sTableID + "_" + fc.utils.prePad(i.toString(), "0", 6); // Each table is named after the rootname, and has it's row number appended.


        // Make header
        var trHeader = document.createElement("tr");
        trHeader.className = classRowHeader;


        // Make header cells
        var th1 = document.createElement("th");
        fc.utils.textContent(th1, "Row:" + (i + 1).toString());
        th1.className = classHeaderCell + " " + classCol1;
        trHeader.appendChild(th1);

        var th2 = document.createElement("th");
        th2.innerHTML = kawasu.microtable.sEmptyString;
        th2.className = classHeaderCell;
        trHeader.appendChild(th2);


        // Add the header row to the table
        table.appendChild(trHeader);


        // Iterate the header object, and add one row per header element.
        // Each header element is a key, and there should be a value in the data element.
        for (var prop in header) {
            if (header.hasOwnProperty(prop)) {

                // Create a row for this key-value pair
                var trData = document.createElement("tr");
                trData.className = classRowData;

                // Create the key and value cells
                var tdKey = document.createElement("td");
                var tdValue = document.createElement("td");
                tdKey.className = classCellKey + " " + classCol1;
                tdValue.className = classCellValue;

                // Set the key cell
                fc.utils.textContent(tdKey, prop);

                // Check the data element to see if this key has a value
                if (obj.hasOwnProperty(prop)) {
                    fc.utils.textContent(tdValue, obj[prop]);
                }
                else {
                    tdValue.innerHTML = kawasu.microtable.sEmptyString;
                }

                trData.appendChild(tdKey);
                trData.appendChild(tdValue);
                table.appendChild(trData);
            }

        } // end of iteration of data object's properties (rows for each object as a table)

        rawTables.push(table);

    } // end of iteration of data object array (table completed for this object)

    return rawTables;

    console.log(prefix + "Exiting");
}


kawasu.microtable.applyViewState = function (sTableID) {
    var prefix = "kawasu.microtable.applyViewState() - ";
    console.log(prefix + "Entering");

    var nViewState = kawasu.microtable[sTableID]["viewState"];
    var rawTables = kawasu.microtable[sTableID]["rawTables"];
    var indexCurrentRow = kawasu.microtable[sTableID]["indexCurrentRow"];

    switch (nViewState) {
        case kawasu.microtable.config.VERTICAL:
            kawasu.microtable.setViewStateVertical(rawTables, indexCurrentRow);
            break;
        default:
            console.log(prefix + "WARNING: Unknown view state value detected (" + nViewState + "); defaulting to STACK");
        case kawasu.microtable.config.STACK:
            kawasu.microtable.setViewStateStack(rawTables, indexCurrentRow);
            break;
    }
    console.log(prefix + "Exiting");
}

kawasu.microtable.setElementVis = function (element, bShow) {
    element.style.display = (bShow) ? "" : "none";
}

kawasu.microtable.setViewStateStack = function (rawTables, indexCurrentRow) {
    var prefix = "kawasu.microtable.setViewStateStack() - ";
    console.log(prefix + "Entering");

    // Show the control table as the header.
    // Show the currently selected row only.
    // Hide the row's native header

    kawasu.microtable.setElementVis(rawTables[0], true);

    for (var i = 1; i < rawTables.length; ++i) {
        if (i == indexCurrentRow) {
            kawasu.microtable.setElementVis(rawTables[i], true); // Show table
            kawasu.microtable.setElementVis(rawTables[i].rows[0], false); // Hide native header
        }
        else {
            kawasu.microtable.setElementVis(rawTables[i], false); // Hide table
        }
    }

    console.log(prefix + "Exiting");
}

kawasu.microtable.setViewStateVertical = function (rawTables, indexCurrentRow) {
    var prefix = "kawasu.microtable.setViewStateVertical() - ";
    console.log(prefix + "Entering");

    // Hide the control table.
    // Show all the row tables sequentially.  
    // Show the row's native header.
    //rawTables[0].style.visibility = "hidden";
    kawasu.microtable.setElementVis(rawTables[0], false);

    for (var i = 1; i < rawTables.length; ++i) {
        kawasu.microtable.setElementVis(rawTables[i], true); // Show table
        kawasu.microtable.setElementVis(rawTables[i].rows[0], true); // Show native header
    }

    console.log(prefix + "Exiting");
}


kawasu.microtable.textboxRowNavigate_onKeyPress = function (event) {
    var prefix = "kawasu.microtable.textboxRowNavigate_onKeyPress() - ";
    console.log(prefix + "Entering, no exit, calling fc.utils.isNumericKey(event)...");
    return fc.utils.isNumericKey(event);
}


kawasu.microtable.textboxRowNavigate_onKeyUp = function (event) {
    var prefix = "kawasu.microtable.textboxRowNavigate_onKeyUp() - ";
    console.log(prefix + "Entering");

    kawasu.microtable.textboxRowNavigate_onChange(event);

    console.log(prefix + "Exiting");
    return true;
}

kawasu.microtable.textboxRowNavigate_onChange = function (event) {
    var prefix = "kawasu.microtable.textboxRowNavigate_onChange() - ";
    console.log(prefix + "Entering");

    // User has entered or changed the number in the row navigation textbox. 

    var textboxId = event.target.id;
    console.log(prefix + "INFO: id >" + textboxId + "<");

    var arraySplit = textboxId.split("_");
    var sTableID = arraySplit[0];
    console.log(prefix + "INFO: Table >" + sTableID + "<");

    // Get the value from the textbox
    var textbox = document.getElementById(textboxId);
    var textboxValue = textbox.value;
    var nValue = 0;
    if (!fc.utils.isEmptyStringOrWhiteSpace(textboxValue)) {
        nValue = parseInt(textboxValue, 10);
    }
    else {
        console.log(prefix + "INFO: No value entered, no change to make.");
        return;
    }

    console.log(prefix + "INFO: Value >" + nValue + "<");

    // Get ref to the array of raw tables...
    var rawTables = kawasu.microtable[sTableID]["rawTables"];

    var nCleanValue = nValue;
    if (nValue < 1) {
        nCleanValue = 1; // Should never happen
    }
    else if (nValue > (rawTables.length - 1)) {
        nCleanValue = (rawTables.length - 1);
    }

    // If we have had to clean the value, set the textbox to this cleaned value
    if (nCleanValue != nValue) {
        textbox.value = nCleanValue;
    }

    // If this clean value causes a change to the currently selected row, 
    // change the current row and re-display
    var indexCurrentRow = kawasu.microtable[sTableID]["indexCurrentRow"];
    if (indexCurrentRow != nCleanValue) {
        kawasu.microtable[sTableID]["indexCurrentRow"] = nCleanValue;
        kawasu.microtable.setViewStateStack(rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
    }

    console.log(prefix + "Exiting");
}

kawasu.microtable.btnRowNavigate_onClick = function () {
    var prefix = "kawasu.microtable.btnRowNavigate_onClick() - ";
    console.log(prefix + "Entering");

    // User has clicked on a row navigation button. 

    var buttonId = this.id;
    console.log(prefix + "INFO: id >" + buttonId + "<");

    var arraySplit = buttonId.split("_");
    var sTableID = arraySplit[0];
    var sBtnName = arraySplit[1];

    // Get ref to the array of raw tables...
    var rawTables = kawasu.microtable[sTableID]["rawTables"];
    var indexCurrentRow = kawasu.microtable[sTableID]["indexCurrentRow"];

    // Get a ref to the textbox
    var textboxId = sTableID + "_" + "textboxRowNavigate";
    var textbox = document.getElementById(textboxId);

    switch (sBtnName) {
        case "btnRowFirst":
            if (indexCurrentRow != 1) {
                textbox.value = 1;
                kawasu.microtable[sTableID]["indexCurrentRow"] = 1;
                kawasu.microtable.setViewStateStack(rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
            }
            break;
        case "btnRowLast":
            if (indexCurrentRow != (rawTables.length - 1)) {
                textbox.value = (rawTables.length - 1);
                kawasu.microtable[sTableID]["indexCurrentRow"] = (rawTables.length - 1);
                kawasu.microtable.setViewStateStack(rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
            }
            break;
        case "btnRowPrev":
            if (indexCurrentRow != 1) {
                var nextValue = indexCurrentRow - 1;
                textbox.value = nextValue;
                kawasu.microtable[sTableID]["indexCurrentRow"] = nextValue;
                kawasu.microtable.setViewStateStack(rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
            }
            break;
        case "btnRowNext":
            if (indexCurrentRow != (rawTables.length - 1)) {
                var nextValue = indexCurrentRow + 1;
                textbox.value = nextValue;
                kawasu.microtable[sTableID]["indexCurrentRow"] = nextValue;
                kawasu.microtable.setViewStateStack(rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
            }
            break;
        default:
            console.log(prefix + "ERROR: Could not determine which navigation button was pressed, name=" + sBtnName);
            break;
    }

    // Regardless, populate the textbox in case it was blank before
    textbox.value = kawasu.microtable[sTableID]["indexCurrentRow"];

    console.log(prefix + "Exiting");
}