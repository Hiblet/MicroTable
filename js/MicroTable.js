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



///////////////////////////////////////////////////////////////////////////////
// Set some class variables up
//
kawasu.microtable.config = new Object();

// Table view states
kawasu.microtable.config.STACK = 1;
kawasu.microtable.config.VERTICAL = 0;

// Each table id is padded with zeros
kawasu.microtable.config.nZeroPadding = 6;

// Constant 
kawasu.microtable.config.sEmptyStringHtml = "&nbsp;";


///////////////////////////////////////////////////////////////////////////////
// ENTRY POINT
//

kawasu.microtable.build = function (arrData, styleDefn, sTableID, sItemName, nRowsMinimum, bMultiSelect, nViewState) {
    var prefix = "kawasu.microtable.build() - ";
    console.log(prefix + "Entering");

    // Cache the styleDefn for use later.  All data pertaining to this table
    // will then be stored in this area.
    kawasu.microtable[sTableID] = new Object();
    kawasu.microtable[sTableID]["arrData"] = arrData;
    kawasu.microtable[sTableID]["styleDefn"] = styleDefn;
    kawasu.microtable[sTableID]["nViewState"] = nViewState;
    kawasu.microtable[sTableID]["sItemName"] = sItemName;
    kawasu.microtable[sTableID]["nRowsMinimum"] = nRowsMinimum;
    kawasu.microtable[sTableID]["bMultiSelect"] = bMultiSelect;



    // Header object is created by walking the inbound data and 
    // creating a property on a new object for every unique 
    // property on the objects in the arrData array.
    kawasu.microtable[sTableID]["header"] = kawasu.microtable.buildHeaderData(arrData);

    var rawTables = kawasu.microtable.buildRawTables(sTableID); // returns nodelist of tables

    if (fc.utils.isInvalidVar(rawTables)) {
        console.log(prefix + "ERROR: Failed to create raw tables.");
        return;
    }
    else {
        kawasu.microtable.applyViewState(sTableID, rawTables);
        console.log(prefix + "Exiting");
        return rawTables;
    }

    // DIAGNOSTICS
    // Iterate returned array and display tables
    //for (var i = 0; i < kawasu.microtable[sTableID]["rawTables"].length; ++i) {
    //    (document.getElementById("divContainer")).appendChild(kawasu.microtable[sTableID]["rawTables"][i]);
    //}
    // END DIAGNOSTICS

}





///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTION / BUILD 
//

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
    var sItemName = kawasu.microtable[sTableID]["sItemName"];
    var styleDefn = kawasu.microtable[sTableID]["styleDefn"];
    var nRowsMinimum = kawasu.microtable[sTableID]["nRowsMinimum"];             // Pad to this number of rows

    var nRowsRequired = nRowsMinimum - kawasu.microtable.countHeaders(header);

    kawasu.microtable[sTableID]["indexCurrentRow"] = 1;

    var rawTables = document.createDocumentFragment();

    var classTable = styleDefn["tableClass"] || "";
    var classRowHeader = styleDefn["trClassHeader"] || "";
    var classHeaderCell = styleDefn["thClass"] || "";
    var classCol1 = styleDefn["classCol1"] || "";
    var classRowData = styleDefn["trClassData"] || "";
    var classCellKey = styleDefn["tdClassKey"] || "";
    var classCellValue = styleDefn["tdClassValue"] || "";
    var classBtnRowNavigate = styleDefn["buttonRowNavigate"] || "";
    var classTextboxRowNavigate = styleDefn["textboxRowNavigate"] || "";
    var classCheckboxSelect = styleDefn["checkboxSelect"] || "";


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
    labelRowNavigate.innerHTML = sItemName;
    labelRowNavigate.title = "Items: " + arrData.length;
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

    // Select Checkbox
    var checkboxControlSelect = document.createElement("input");
    checkboxControlSelect.type = "checkbox";
    checkboxControlSelect.id = sTableID + "_" + "checkboxSelect";
    checkboxControlSelect.title = "Select";
    checkboxControlSelect.className = classCheckboxSelect;
    fc.utils.addEvent(checkboxControlSelect, "click", kawasu.microtable.checkboxSelect_onClick);
    th2Control.appendChild(checkboxControlSelect);

    th2Control.className = classHeaderCell;
    trHeaderControl.appendChild(th2Control);

    tableControl.appendChild(trHeaderControl);


    ///////////////////////////////////////////////////////////////////////////
    // Add dummy rows in case we have to show a blank table
    //

    kawasu.microtable.addRow(sTableID, tableControl, true, kawasu.microtable.getItemText(sItemName, 0)); // Native header row "Row:0"

    /*
    // Make zero header
    var trZeroHeader = document.createElement("tr");
    trZeroHeader.className = classRowHeader;

    // Make zero header cells
    var thZero1 = document.createElement("th");
    fc.utils.textContent(thZero1, kawasu.microtable.getItemText(sItemName, 0));
    thZero1.className = classHeaderCell + " " + classCol1;
    trZeroHeader.appendChild(thZero1);

    var thZero2 = document.createElement("th");
    thZero2.innerHTML = kawasu.microtable.config.sEmptyStringHtml;
    thZero2.className = classHeaderCell;
    trZeroHeader.appendChild(thZero2);
    
    // Add the zero header row to the table
    tableControl.appendChild(trHeader);
    */

    // Add the minimum number of blank rows
    for (var j = 0; j < nRowsMinimum; ++j) {

        kawasu.microtable.addRow(sTableID, tableControl, false); // bHeader=false ie "td", not "th"

        /*
        var trZeroData = document.createElement("tr");
        trZeroData.className = classRowData;

        // Create the key and value cells
        var tdZeroKey = document.createElement("td");
        var tdZeroValue = document.createElement("td");
        tdZeroKey.className = classCellKey + " " + classCol1;
        tdZeroValue.className = classCellValue;

        // Set the blank cells
        tdZeroKey.innerHTML = kawasu.microtable.config.sEmptyStringHtml;
        tdZeroValue.innerHTML = kawasu.microtable.config.sEmptyStringHtml;

        trZeroData.appendChild(tdZeroKey);
        trZeroData.appendChild(tdZeroValue);
        tableControl.appendChild(trZeroData);
        */
    }

    rawTables.appendChild(tableControl);



    ///////////////////////////////////////////////////////////////////////////
    // Iterate the inbound data, make one table per object 
    //
    for (var i = 0; i < arrData.length; ++i) {

        var obj = arrData[i];


        // Make table
        var table = document.createElement("table");
        table.className = classTable;
        table.id = kawasu.microtable.getTableId(sTableID, i);

        // Add native header
        var trHeader = kawasu.microtable.addRow(sTableID, table, true, kawasu.microtable.getItemText(sItemName, i));

        // Add a checkbox to the native header 2nd cell
        var checkboxSelect = document.createElement("input");
        checkboxSelect.type = "checkbox";
        checkboxSelect.id = table.id + "_" + "checkboxSelect";
        checkboxSelect.className = classCheckboxSelect;
        fc.utils.addEvent(checkboxSelect, "click", kawasu.microtable.checkboxSelect_onClick);
        trHeader.cells[1].appendChild(checkboxSelect);

        /*
        // Make header
        var trHeader = document.createElement("tr");
        trHeader.className = classRowHeader;


        // Make header cells
        var th1 = document.createElement("th");
        fc.utils.textContent(th1, kawasu.microtable.getItemText(sItemName, i));
        th1.className = classHeaderCell + " " + classCol1;
        trHeader.appendChild(th1);

        var th2 = document.createElement("th");
        th2.innerHTML = kawasu.microtable.config.sEmptyStringHtml;
        th2.className = classHeaderCell;
        trHeader.appendChild(th2);


        // Add the header row to the table
        table.appendChild(trHeader);
        */

        // Iterate the header object, and add one row per header element.
        // Each header element is a key, and there should be a value in the data element.
        for (var prop in header) {
            if (header.hasOwnProperty(prop)) {

                kawasu.microtable.addRow(sTableID, table, false, prop, obj[prop]);
                /*
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
                tdValue.title = obj[prop]; // Tooltip
                }
                else {
                tdValue.innerHTML = kawasu.microtable.config.sEmptyStringHtml;
                }

                trData.appendChild(tdKey);
                trData.appendChild(tdValue);
                table.appendChild(trData);
                */
            }

        } // end of iteration of data object's properties (rows for each object as a table)

        // Pad with blank rows if required
        for (var k = 0; k < nRowsRequired; ++k) {
            kawasu.microtable.addRow(sTableID, table, false);
        }

        rawTables.appendChild(table);

    } // end of iteration of data object array (table completed for this object)

    return rawTables;

    console.log(prefix + "Exiting");
}

kawasu.microtable.rebuild = function (sTableID) {
    var prefix = "kawasu.microtable.rebuild() - ";
    console.log(prefix + "Entering");

    // This fn assumes that the underlying data has been changed, and that we
    // need to resynchronise the tables with the data.  Rather than try to 
    // figure out what has changed, we drop the tables and rebuild.

    // Assumes: sItemName remains the same.
    //          The reference to arrData is still valid.

    // Build first, and then swap new built data into place
    kawasu.microtable[sTableID]["header"] = kawasu.microtable.buildHeaderData(kawasu.microtable[sTableID]["arrData"]);
    var rawTables_rebuild = kawasu.microtable.buildRawTables(sTableID);

    // Apply view state
    kawasu.microtable.applyViewState(sTableID,rawTables_rebuild);

    console.log(prefix + "Exiting");

    return rawTables_rebuild;
}

//
///////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////
// VIEW STATE
//

kawasu.microtable.viewState = function (sTableID, nViewState) {
    var prefix = "kawasu.microtable.viewState() - ";
    console.log(prefix + "Entering");

    // Get or Set the View State

    if (typeof nViewState !== 'undefined') {
        // Setting
        kawasu.microtable[sTableID]["nViewState"] = nViewState;
        kawasu.microtable.applyViewState(sTableID);
    }

    // Either way, return the viewstate...
    return kawasu.microtable[sTableID]["nViewState"];

    console.log(prefix + "Exiting");
}

kawasu.microtable.applyViewState = function (sTableID, rawTables) {
    var prefix = "kawasu.microtable.applyViewState() - ";
    console.log(prefix + "Entering");

    if (typeof rawTables === 'undefined') { rawTables = kawasu.microtable.getRawTables(sTableID); }

    if (typeof rawTables === 'undefined') {
        console.log(prefix + "ERROR:EXITING: Could not locate raw tables from sTableID: >" + sTableID + "<");
        return;
    }

    var nViewState = kawasu.microtable[sTableID]["nViewState"];
    var indexCurrentRow = kawasu.microtable[sTableID]["indexCurrentRow"];

    switch (nViewState) {
        case kawasu.microtable.config.VERTICAL:
            kawasu.microtable.setViewStateVertical(rawTables, indexCurrentRow);
            break;
        default:
            console.log(prefix + "WARNING: Unknown view state value detected (" + nViewState + "); defaulting to STACK");
        case kawasu.microtable.config.STACK:
            kawasu.microtable.setViewStateStack(sTableID, rawTables, indexCurrentRow);
            break;
    }
    console.log(prefix + "Exiting");
}

kawasu.microtable.setElementVis = function (element, bShow) {
    element.style.display = (bShow) ? "" : "none";
}

kawasu.microtable.setViewStateStack = function (sTableID, rawTables, indexCurrentRow) {
    var prefix = "kawasu.microtable.setViewStateStack() - ";
    console.log(prefix + "Entering");

    // Show the control table as the header.
    // Show the currently selected row only.
    // Hide the row's native header
    // Set the control select checkbox to match the underlying rowTable checkbox

    var tableControl = rawTables.children[0];
    var controlCheckbox = kawasu.microtable.getCheckboxFromTable(tableControl);
    kawasu.microtable.setElementVis(tableControl, true);

    var nodeListLength = rawTables.children.length;

    // Special Case: No data to show
    if (nodeListLength == 1) {

        // If there is only a control table, show the blank padding rows, but don't show
        // the native header row

        kawasu.microtable.setElementVis(tableControl.rows[0], true); // Show the control header
        kawasu.microtable.setElementVis(tableControl.rows[1], false); // Hide the native header

        for (var j = 2; j < tableControl.rows.length; ++j) {
            kawasu.microtable.setElementVis(tableControl.rows[j], true); // Show the padding rows         
        }

        controlCheckbox.checked = false;

        return;
    }
    // implicit else...

    ///////////////////////////////////
    // Regular Case: Data to display

    // Show the control table
    kawasu.microtable.setElementVis(tableControl.rows[0], true); // Show the control header
    kawasu.microtable.setElementVis(tableControl.rows[1], false); // Hide the native header

    for (var j = 2; j < tableControl.rows.length; ++j) {
        kawasu.microtable.setElementVis(tableControl.rows[j], false); // Hide the padding rows         
    }

    // Show the data 
    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTables.children[i];
        if (i == indexCurrentRow) {
            kawasu.microtable.setElementVis(table, true); // Show table
            kawasu.microtable.setElementVis(table.rows[0], false); // Hide native header

            // Set the control checkbox equal to the current row checkbox
            var checkbox = kawasu.microtable.getCheckboxFromTable(table);
            controlCheckbox.checked = checkbox.checked;
        }
        else {
            kawasu.microtable.setElementVis(table, false); // Hide table
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

    var tableControl = rawTables.children[0];
    var nodeListLength = rawTables.children.length;

    // Special Case: No data to show
    if (nodeListLength == 1) {

        kawasu.microtable.setElementVis(tableControl.rows[0], false); // Hide the control header
        kawasu.microtable.setElementVis(tableControl.rows[1], true); // Show the native header

        for (var j = 2; j < tableControl.rows.length; ++j) {
            kawasu.microtable.setElementVis(tableControl.rows[j], true); // Show the padding rows         
        }

        return;
    }
    // implicit else

    ///////////////////////////////////
    // Regular Case: Data to show...

    // Hide the control table
    kawasu.microtable.setElementVis(tableControl, false);
    /*
    kawasu.microtable.setElementVis(tableControl.rows[0], false); // Hide the control header
    kawasu.microtable.setElementVis(tableControl.rows[1], false); // Hide the native header

    for (var j = 2; j < tableControl.rows.length; ++j) {
    kawasu.microtable.setElementVis(tableControl.rows[j], false); // Hide the padding rows         
    }
    */

    // Show the data rows
    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTables.children[i];
        kawasu.microtable.setElementVis(table, true); // Show table
        kawasu.microtable.setElementVis(table.rows[0], true); // Show native header
    }

    console.log(prefix + "Exiting");
}

//
///////////////////////////////////////////////////////////////////////////////







///////////////////////////////////////////////////////////////////////////////
// EVENT HANDLING
//

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
    //var rawTables = kawasu.microtable[sTableID]["rawTables"];
    var tableControl = document.getElementById(sTableID + "_" + "Control");
    var rawTables = tableControl.parentNode;
    var rawTablesLength = rawTables.children.length;

    var nCleanValue = nValue;
    if (nValue < 1) {
        nCleanValue = 1; // Should never happen
    }
    else if (nValue > (rawTablesLength - 1)) {
        nCleanValue = (rawTablesLength - 1);
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
        kawasu.microtable.setViewStateStack(sTableID,rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
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
    var tableControl = document.getElementById(sTableID + "_" + "Control");
    var rawTables = tableControl.parentNode;
    var rawTablesLength = rawTables.children.length;

    var indexCurrentRow = kawasu.microtable[sTableID]["indexCurrentRow"];

    // Get a ref to the textbox
    var textboxId = sTableID + "_" + "textboxRowNavigate";
    var textbox = document.getElementById(textboxId);

    switch (sBtnName) {
        case "btnRowFirst":
            if (indexCurrentRow != 1) {
                textbox.value = 1;
                kawasu.microtable[sTableID]["indexCurrentRow"] = 1;
                kawasu.microtable.setViewStateStack(sTableID, rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
            }
            break;
        case "btnRowLast":
            if (indexCurrentRow != (rawTablesLength - 1)) {
                textbox.value = (rawTablesLength - 1);
                kawasu.microtable[sTableID]["indexCurrentRow"] = (rawTablesLength - 1);
                kawasu.microtable.setViewStateStack(sTableID, rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
            }
            break;
        case "btnRowPrev":
            if (indexCurrentRow != 1) {
                var nextValue = indexCurrentRow - 1;
                textbox.value = nextValue;
                kawasu.microtable[sTableID]["indexCurrentRow"] = nextValue;
                kawasu.microtable.setViewStateStack(sTableID, rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
            }
            break;
        case "btnRowNext":
            if (indexCurrentRow != (rawTablesLength - 1)) {
                var nextValue = indexCurrentRow + 1;
                textbox.value = nextValue;
                kawasu.microtable[sTableID]["indexCurrentRow"] = nextValue;
                kawasu.microtable.setViewStateStack(sTableID, rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
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

kawasu.microtable.checkboxSelect_onClick = function (event) {
    var prefix = "kawasu.microtable.checkboxSelect_onClick() - ";
    console.log(prefix + "Entering");

    // User has clicked on a checkbox for either the Control table or a Row table

    var checkboxId = event.target.id;
    console.log(prefix + "INFO: id >" + checkboxId + "<");

    var arraySplit = checkboxId.split("_");
    var sTableID = arraySplit[0];
    console.log(prefix + "INFO: Table >" + sTableID + "<");

    // Control Checkbox Name:                   
    //      sTableID + "_" + "checkboxSelect"
    // eg   "MyMicroTable_checkboxSelect"
    //
    // RowTable NativeHeader Checkbox Name:     
    //      sTableID + "_" + fc.utils.prePad(nIndex.toString(), "0", kawasu.microtable.config.nZeroPadding); + "_" + "checkboxSelect"
    // eg   "MyMicroTable_000001_checkboxSelect"
    // Note: getTableId() provides the first two parts of the name


    // If the control checkbox has been clicked we find the selected row, and 
    // set it's checkbox to be the same

    if (arraySplit.length == 2) {

        // Get the Control Checkbox; Control Checkbox name only has two parts
        var controlCheckboxId = sTableID + "_" + "checkboxSelect";
        var controlCheckbox = document.getElementById(controlCheckboxId);

        // This row is being either selected or deselected...
        var indexCurrentRow = kawasu.microtable[sTableID]["indexCurrentRow"];

        // Push the state of the checkbox to the rowTable checkbox
        kawasu.microtable.pushSelectStateControlToRow(sTableID, indexCurrentRow - 1, controlCheckbox.checked);

        // Enforce Single Select if applicable
        if (!bMultiSelect) {
            kawasu.microtable.setSingleSelect(sTableID, indexCurrentRow - 1);
        }

    }
    else if (arraySplit.length == 3) {

        // If we are in multi-select mode, do nothing, no-op
        // If we are in single select mode, turn off any other selections

        var bMultiSelect = kawasu.microtable[sTableID]["bMultiSelect"];
        if (!bMultiSelect) {

            // Single Select Case
            var nSelectedIndex = parseInt(arraySplit[1], 10);
            kawasu.microtable.setSingleSelect(sTableID, nSelectedIndex);
        }
    }

    console.log(prefix + "Exiting");
}

//
///////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////
// ACTIONS
//

kawasu.microtable.itemsDelete = function (sTableID, arrRowsToDelete, bDeleteSourceData) {
    var prefix = "kawasu.microtable.itemDelete() - ";
    console.log(prefix + "Entering");

    // Note: The indices of this function are the 1-based row numbers.
    // Remember that the control table is always the first row and contains the 
    // blank padding that appears if there are no rows to display in Stack mode.
    

    // Default syntax - defaults to false, do not delete source data.
    bDeleteSourceData = typeof bDeleteSourceData !== 'undefined' ? bDeleteSourceData : false;

    var rawTables = kawasu.microtable.getRawTables(sTableID);
    var indexCurrentRow = kawasu.microtable[sTableID]["indexCurrentRow"];

    console.log(prefix + "Exiting");
}

/*
kawasu.microtable.itemDelete = function (sTableID, nIndexRowToDelete, bDeleteSourceData) {
    var prefix = "kawasu.microtable.itemDelete() - ";
    console.log(prefix + "Entering");

    // Default syntax - defaults to false, do not delete source data.
    bDeleteSourceData = typeof bDeleteSourceData !== 'undefined' ? bDeleteSourceData : false;


    // Client app has requested that a row/item be deleted.
    // Argument is the zero based row index.

    // kawasu.microtable.itemBlank(sTableID, nIndexRowToDelete);

    // Get the count of remaining items
    var tableId = kawasu.microtable.getTableId(sTableID, nIndexRowToDelete);
    var tableToDelete = document.getElementById(tableId);
    var rawTables = tableToDelete.parentNode;
    var nodeListLength = rawTables.children.length;

    // Get a ref to the data set
    var arrData = kawasu.microtable[sTableID]["arrData"];

    // Drop the row number indicator on all rows after the row we're going to delete,
    // Rename the tables so that navigation is still possible.
    for (var i = (nIndexRowToDelete + 2); i < nodeListLength; ++i) {
        var table = rawTables.children[i];
        table.id = kawasu.microtable.getTableId(sTableID, (i - 3));
        var th1 = table.rows[0].cells[0];
        var sItemName = kawasu.microtable[sTableID]["sItemName"];
        fc.utils.textContent(th1, kawasu.microtable.getItemText(sItemName, (i - 2)));
    }

    rawTables.removeChild(tableToDelete);

    if (bDeleteSourceData) {
        arrData.splice(nIndexRowToDelete, 1);
    }

    console.log(prefix + "Exiting");
}
*/

/*
kawasu.microtable.itemBlank = function (sTableID, nIndexRowToBlank) {
    var prefix = "kawasu.microtable.itemBlank() - ";
    console.log(prefix + "Entering");

    // Client app has requested that a row/item be blanked.
    // Argument is the zero based row index.

    var tableId = kawasu.microtable.getTableId(sTableID, nIndexRowToBlank);
    var table = document.getElementById(tableId);

    // Iterate the rows, set value cells to nbsp
    for (var i = 1; i < table.rows.length; ++i) {
        var row = table.rows[i];
        // First cell is the key, second cell is the value
        var cellValue = row.cells[1];
        cellValue.innerHTML = kawasu.microtable.config.sEmptyStringHtml;
    }

    console.log(prefix + "Exiting");
}
*/

//
///////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////
// PRIVATE HELPERS
//

kawasu.microtable.getTableId = function (sTableID, nIndex) {
    return sTableID + "_" + fc.utils.prePad(nIndex.toString(), "0", kawasu.microtable.config.nZeroPadding);
}

kawasu.microtable.getItemText = function (sItemName, nIndex) {
    return sItemName + (nIndex + 1).toString();
}

kawasu.microtable.countHeaders = function (header) {
    var countHeaders = 0;
    for (var prop in header) {
        if (header.hasOwnProperty(prop)) {
            ++countHeaders;
        }
    }
    return countHeaders;
}

kawasu.microtable.getRawTables = function (sTableID) {
    // Once the raw tables have been created, they get attached to the main doc,
    // and we lose track of them.  To find the owner, get the control and get
    // it's parent.  Always use 'children' not 'childnodes' to access siblings.
    var controlTableId = sTableID + "_Control";
    var controlTable = document.getElementById(controlTableId);
    return controlTable.parentNode;
}

kawasu.microtable.getCheckboxFromTable = function (table) {

    // ControlTable or RowTable?

    var tableId = table.id;
    var arraySplit = tableId.split("_");
    var sTableID = arraySplit[0];
    var checkboxId = "";

    if (arraySplit[1] == "Control") {
        // Control
        var checkbox = table.rows[0].cells[1].children[4]; // 5th control
        return checkbox;
    }
    else {
        // Row
        var checkbox = table.rows[0].cells[1].children[0]; // 1st control
        return checkbox;
    }
}

kawasu.microtable.pushSelectStateControlToRow = function (sTableID, nSelectedIndex, bState) {
    var prefix = "kawasu.microtable.pushSelectStateControlToRow() - ";
    console.log(prefix + "Entering");

    var rawTables = kawasu.microtable.getRawTables(sTableID);
    var table = rawTables.children[nSelectedIndex + 1];
    var checkbox = kawasu.microtable.getCheckboxFromTable(table);
    checkbox.checked = bState;

    console.log(prefix + "Exiting");
}

kawasu.microtable.setSingleSelect = function (sTableID, nSelectedIndex) {
    var prefix = "kawasu.microtable.setSingleSelect() - ";
    console.log(prefix + "Entering");

    // RowTable 'nSelectedIndex' has been selected, and we are in Single Select
    // mode, so set the other rowTables to not selected.

    var rawTables = kawasu.microtable.getRawTables(sTableID);
    var nodeListLength = rawTables.children.length;

    // Single Select
    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTables.children[i];
        var checkbox = kawasu.microtable.getCheckboxFromTable(table);
        if (i == (nSelectedIndex + 1)) {
            checkbox.checked = true;
        }
        else {
            checkbox.checked = false;
        }

    }
    console.log(prefix + "Exiting");
}

kawasu.microtable.addRow = function (sTableID, table, bHeader, sCell1Text, sCell2Text) {
    var prefix = "kawasu.microtable.addRow() - ";
    console.log(prefix + "Entering");

    // Creates a row and adds it to a table, and returns a ref to the row

    var styleDefn = kawasu.microtable[sTableID]["styleDefn"];

    var classRowHeader = styleDefn["trClassHeader"] || "";
    var classHeaderCell = styleDefn["thClass"] || "";
    var classCol1 = styleDefn["classCol1"] || "";
    var classRowData = styleDefn["trClassData"] || "";
    var classCellKey = styleDefn["tdClassKey"] || "";
    var classCellValue = styleDefn["tdClassValue"] || "";

    var cellType = (bHeader ? "th" : "td");

    var tr = document.createElement("tr");
    tr.className = bHeader ? classRowHeader : classRowData;

    // First column cell
    var cellCol1 = document.createElement(cellType);
    var cellCol1Class = (bHeader ? classHeaderCell : classCellKey) + " " + classCol1;
    cellCol1.className = cellCol1Class;
    if (typeof sCell1Text === 'undefined' || fc.utils.isEmptyStringOrWhiteSpace(sCell1Text)) {
        cellCol1.innerHTML = kawasu.microtable.config.sEmptyStringHtml;
    }
    else {
        fc.utils.textContent(cellCol1, sCell1Text);
    }

    // Second column cell
    var cellCol2 = document.createElement(cellType);
    var cellCol2Class = (bHeader ? classHeaderCell : classCellValue)
    cellCol2.className = cellCol2Class;
    if (typeof sCell2Text === 'undefined' || fc.utils.isEmptyStringOrWhiteSpace(sCell2Text)) {
        cellCol2.innerHTML = kawasu.microtable.config.sEmptyStringHtml;
    }
    else {
        fc.utils.textContent(cellCol2, sCell2Text);
        if (bHeader == false) {
            cellCol2.title = sCell2Text;  // If this is a data row, value cell, make the tooltip the data too
        }
    }

    tr.appendChild(cellCol1);
    tr.appendChild(cellCol2);
    table.appendChild(tr);

    console.log(prefix + "Exiting");

    return tr;
}

//
////////////////////////////////////////////////////////////////////////////////