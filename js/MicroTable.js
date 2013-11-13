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
    //tableControl.id = sTableID + "_Control";
    tableControl.id = kawasu.microtable.getTableId(sTableID, 0);

    var trHeaderControl = document.createElement("tr");
    trHeaderControl.className = classRowHeader;

    // Make Control Header cells
    var th1Control = document.createElement("th");

    // Make the textbox control for row navigation
    var labelRowNavigate = document.createElement("label");
    labelRowNavigate.innerHTML = sItemName;
    labelRowNavigate.title = kawasu.microtable.getLabelTooltip(sItemName, arrData.length);
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

    // Add the minimum number of blank rows
    for (var j = 0; j < nRowsMinimum; ++j) {
        kawasu.microtable.addRow(sTableID, tableControl, false); // bHeader=false ie "td", not "th"
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
        table.id = kawasu.microtable.getTableId(sTableID, i + 1);

        // Add native header
        var trHeader = kawasu.microtable.addRow(sTableID, table, true, kawasu.microtable.getItemText(sItemName, i + 1));

        // Add a checkbox to the native header 2nd cell
        var checkboxSelect = document.createElement("input");
        checkboxSelect.type = "checkbox";
        checkboxSelect.id = table.id + "_" + "checkboxSelect";
        checkboxSelect.className = classCheckboxSelect;
        fc.utils.addEvent(checkboxSelect, "click", kawasu.microtable.checkboxSelect_onClick);
        trHeader.cells[1].appendChild(checkboxSelect);


        // Iterate the header object, and add one row per header element.
        // Each header element is a key, and there should be a value in the data element.
        for (var prop in header) {
            if (header.hasOwnProperty(prop)) {
                kawasu.microtable.addRow(sTableID, table, false, prop, obj[prop]);
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

    // Ensure that the current row is legal and up to date
    if (kawasu.microtable[sTableID]["indexCurrentRow"] > (nodeListLength - 1)) {
        kawasu.microtable[sTableID]["indexCurrentRow"] = nodeListLength - 1;
    }

    // Get a ref to the textbox
    var textbox = kawasu.microtable.getTextboxFromTable(tableControl);
    textbox.value = kawasu.microtable[sTableID]["indexCurrentRow"];


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

        kawasu.microtable.setElementVis(tableControl, true); // Having set up the elements of the control table, show it
        return;
    }
    // implicit else

    ///////////////////////////////////
    // Regular Case: Data to show...

    // Hide the control table
    kawasu.microtable.setElementVis(tableControl, false);

    // Show the data rowTables
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
    var tableId = kawasu.microtable.getTableIdFromControlId(textboxId);
    console.log(prefix + "INFO: id >" + tableId + "<");

    var arraySplit = tableId.split("_");
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

    // Get refs
    var tableControlId = kawasu.microtable.getTableId(sTableID, 0);
    var tableControl = document.getElementById(tableControlId);
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
        kawasu.microtable.setViewStateStack(sTableID, rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
    }

    console.log(prefix + "Exiting");
}

kawasu.microtable.btnRowNavigate_onClick = function () {
    var prefix = "kawasu.microtable.btnRowNavigate_onClick() - ";
    console.log(prefix + "Entering");

    // User has clicked on a row navigation button. 

    var buttonId = this.id;
    var tableId = kawasu.microtable.getTableIdFromControlId(buttonId);
    console.log(prefix + "INFO: buttonId >" + buttonId + "<");
    console.log(prefix + "INFO: tableId >" + tableId + "<");

    var arraySplit = buttonId.split("_");
    var sTableID = arraySplit[0];
    var sBtnName = arraySplit[1];

    // Get ref to the array of raw tables...
    var tableControlId = kawasu.microtable.getTableId(sTableID, 0);
    var tableControl = document.getElementById(tableControlId);
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
            if (indexCurrentRow > 1) {
                var nextValue = indexCurrentRow - 1;
                textbox.value = nextValue;
                kawasu.microtable[sTableID]["indexCurrentRow"] = nextValue;
                kawasu.microtable.setViewStateStack(sTableID, rawTables, kawasu.microtable[sTableID]["indexCurrentRow"]);
            }
            break;
        case "btnRowNext":
            if (indexCurrentRow < (rawTablesLength - 1)) {
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
    var tableId = kawasu.microtable.getTableIdFromControlId(checkboxId);
    console.log(prefix + "INFO: checkboxId >" + checkboxId + "<");
    console.log(prefix + "INFO: tableId >" + tableId + "<");

    var tableArraySplit = tableId.split("_");
    var nSelectedTableIndex = parseInt(tableArraySplit[1], 10);

    var arraySplit = checkboxId.split("_");
    var sTableID = arraySplit[0];
    var bMultiSelect = kawasu.microtable[sTableID]["bMultiSelect"];
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
        kawasu.microtable.pushSelectStateControlToRow(sTableID, indexCurrentRow, controlCheckbox.checked);

        // Enforce Single Select if applicable
        if (!bMultiSelect) {
            kawasu.microtable.setSingleSelect(sTableID, indexCurrentRow);
        }

    }
    else if (arraySplit.length == 3) {

        // If we are in multi-select mode, do nothing, no-op
        // If we are in single select mode, turn off any other selections

        if (!bMultiSelect) {
            // Single Select Case            
            kawasu.microtable.setSingleSelect(sTableID, nSelectedTableIndex);
        }
    }

    console.log(prefix + "Exiting");
}

//
///////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////
// ACTIONS
//

kawasu.microtable.deleteSelected = function (sTableID, bDeleteSourceData) {
    var prefix = "kawasu.microtable.deleteSelected() - ";
    console.log(prefix + "Entering");

    // Iterate the tables and build an array of selected items, and send this to delete routine
    var array = kawasu.microtable.getSelectedIndices(sTableID);

    kawasu.microtable.itemsDelete(sTableID, array, bDeleteSourceData);

    kawasu.microtable.applyViewState(sTableID);

    console.log(prefix + "Exiting");
}

kawasu.microtable.itemsDelete = function (sTableID, arrRowsToDelete, bDeleteSourceData) {
    var prefix = "kawasu.microtable.itemsDelete() - ";
    console.log(prefix + "Entering");

    // Note: The indices passed into this function are the 1-based row numbers.
    // Remember that the control table is always the first (0) row and contains the 
    // blank padding that appears if there are no rows to display in Stack mode.


    // Default syntax - defaults to false, do not delete source data.
    bDeleteSourceData = typeof bDeleteSourceData !== 'undefined' ? bDeleteSourceData : false;

    var rawTables = kawasu.microtable.getRawTables(sTableID);
    var nodeListLength = rawTables.children.length;
    var indexCurrentRow = kawasu.microtable[sTableID]["indexCurrentRow"];
    var arrData = kawasu.microtable[sTableID]["arrData"];

    // Work out how many rows will be deleted before the current row.
    var nRowsBeforeCurrentToDelete = 0;
    var bCurrentDeleted = false;
    arrRowsToDelete.sort(function (a, b) { return a - b }); // Numeric sort
    for (var i = 0; i < arrRowsToDelete.length; ++i) {
        if (arrRowsToDelete[i] < indexCurrentRow) nRowsBeforeCurrentToDelete++;
        if (arrRowsToDelete[i] == indexCurrentRow) bCurrentDeleted = true;
    }

    indexCurrentRow = indexCurrentRow - nRowsBeforeCurrentToDelete;
    if (bCurrentDeleted) indexCurrentRow++;

    // If the index has dropped off the end, adjust it (should never be required I believe)...
    var nDataRowsRemaining = (nodeListLength - 1) - arrRowsToDelete.length;
    if (indexCurrentRow > nDataRowsRemaining) indexCurrentRow = nDataRowsRemaining;

    kawasu.microtable[sTableID]["indexCurrentRow"] = indexCurrentRow;

    // Do the delete, backwards, so that indices in the data array are always valid
    for (var i = arrRowsToDelete.length; i > 0; --i) {
        var index = i - 1;
        var tableToDeleteId = kawasu.microtable.getTableId(sTableID, arrRowsToDelete[index]);
        var tableToDelete = document.getElementById(tableToDeleteId);
        rawTables.removeChild(tableToDelete);
        if (bDeleteSourceData) {
            arrData.splice(arrRowsToDelete[index] - 1, 1); // Converting from a visual row index to data index, sub 1
        }
    }

    // Rename the remaining tables so that navigation still works
    nodeListLength = rawTables.children.length;
    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTables.children[i];
        table.id = kawasu.microtable.getTableId(sTableID, i);
        var th1 = table.rows[0].cells[0];
        var sItemName = kawasu.microtable[sTableID]["sItemName"];
        fc.utils.textContent(th1, kawasu.microtable.getItemText(sItemName, i));
    }

    // Update the tooltip
    kawasu.microtable.setLabelTooltipRowCount(sTableID);

    console.log(prefix + "Exiting");
}

kawasu.microtable.setSelectAll = function (sTableID, bSelect) {
    var prefix = "kawasu.microtable.setSelectAll() - ";
    console.log(prefix + "Entering");

    var bMultiSelect = kawasu.microtable[sTableID]["bMultiSelect"];
    if (bMultiSelect == false) {
        console.log(prefix + "WARNING: Cannot select all in Single Select Mode, no action will be taken.");
        console.log(prefix + "Exiting");
        return;
    }

    // Default syntax - defaults to true, select all.
    bSelect = (typeof bSelect !== 'undefined') ? bSelect : true;

    var rawTables = kawasu.microtable.getRawTables(sTableID);
    var nodeListLength = rawTables.children.length;

    // Iterate tables, set select state.  
    // Note: Control table case is handled by intelligence in getCheckboxFromTable()
    //       because this fn is able to retrieve the checkbox from the control table too.
    for (var i = 0; i < nodeListLength; ++i) {
        var table = rawTables.children[i];
        var checkbox = kawasu.microtable.getCheckboxFromTable(table);
        checkbox.checked = bSelect;
    }

    console.log(prefix + "Exiting");
}

//
///////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////
// PRIVATE HELPERS
//

kawasu.microtable.multiSelect = function (sTableID, bMultiSelect) {
    var prefix = "kawasu.microtable.multiSelect() - ";
    console.log(prefix + "Entering");

    // Get/Set for multiselect state - true means yes, this table allows multiselection

    if (typeof bMultiSelect !== 'undefined') {
        // Set
        console.log(prefix + "INFO: Setting bMultiSelect to " + (bMultiSelect ? "true" : "false"));
        kawasu.microtable[sTableID]["bMultiSelect"] = bMultiSelect;
    }

    console.log(prefix + "Exiting");
    return kawasu.microtable[sTableID]["bMultiSelect"];
}

kawasu.microtable.getTableId = function (sTableID, nIndex) {
    return sTableID + "_" + fc.utils.prePad(nIndex.toString(), "0", kawasu.microtable.config.nZeroPadding);
}

kawasu.microtable.getItemText = function (sItemName, nIndex) {
    return sItemName + nIndex.toString();
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
    var controlTableId = kawasu.microtable.getTableId(sTableID, 0);
    var controlTable = document.getElementById(controlTableId);
    return controlTable.parentNode;
}

kawasu.microtable.setLabelTooltipRowCount = function (sTableID) {
    // Work out how many data rows there are, and set the tooltip accordingly
    var rawTables = kawasu.microtable.getRawTables(sTableID);
    var tableControl = rawTables.children[0];
    var tr = tableControl.rows[0];
    var th1 = tr.cells[0];
    var label = th1.children[0];

    var sItemName = kawasu.microtable[sTableID]["sItemName"];
    var nDataRows = rawTables.children.length - 1;

    label.title = kawasu.microtable.getLabelTooltip(sItemName, nDataRows);
}

kawasu.microtable.getTableIdFromControlId = function (controlId) {
    var prefix = "kawasu.microtable.getTableIdFromTextboxId() - ";
    console.log(prefix + "Entering");

    // Textbox naming may dissociate from table naming.
    // Textbox is in cell (th), in row (tr), in table
    var control = document.getElementById(controlId);
    var cell = control.parentNode;
    var tr = cell.parentNode;
    var table = tr.parentNode;
    return table.id;

    console.log(prefix + "Exiting");
}

kawasu.microtable.getTextboxFromTable = function (table) {
    // Textbox is only on the control table, which is passed
    var tr = table.rows[0]; // First row of control table
    var cell = tr.cells[0]; // First cell of first row
    var textbox = cell.children[1]; // 2nd element of this cell
    return textbox;
}

kawasu.microtable.getLabelTooltip = function (sItemName, nCount) {
    return (sItemName + " count=" + nCount);
}

kawasu.microtable.getCheckboxFromTable = function (table) {

    // ControlTable or RowTable?

    var tableId = table.id;
    var arraySplit = tableId.split("_");
    var sTableID = arraySplit[0];
    var zeroIndex = parseInt(arraySplit[1]);
    var checkboxId = "";

    if (zeroIndex == 0) {
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
    var table = rawTables.children[nSelectedIndex];
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
        if (i == nSelectedIndex) {
            checkbox.checked = true;
        }
        else {
            checkbox.checked = false;
        }

    }
    console.log(prefix + "Exiting");
}

kawasu.microtable.getSelectedIndices = function (sTableID) {
    var prefix = "kawasu.microtable.getSelectedIndices() - ";
    console.log(prefix + "Entering");

    var arraySelected = [];
    var rawTables = kawasu.microtable.getRawTables(sTableID);
    var nodeListLength = rawTables.children.length;

    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTables.children[i];
        var checkbox = kawasu.microtable.getCheckboxFromTable(table);
        if (checkbox.checked) {
            arraySelected.push(i);
        }
    }

    console.log(prefix + "INFO: Returning array of size: >" + arraySelected.length + "<");

    console.log(prefix + "Exiting");
    return arraySelected;
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