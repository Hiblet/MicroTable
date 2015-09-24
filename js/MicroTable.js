///////////////////////////////////////////////////////////////////////////////
// STYLE DECLARATION
// Use double quotes in JavaScript


// To include files for VS to understand and query them, use this syntax..
///<reference path="FCUtils.js" />

// Define the console if not already defined
if (!window.console) console = { log: function () { } };



///////////////////////////////////////////////////////////////////////////////
// Global Namespace for this application
//
var kawasu = kawasu || {};

if (fc.utils.isInvalidVar(kawasu.microtable)) { kawasu.microtable = new Object(); }
kawasu.microtable.config = new Object();



///////////////////////////////////////////////////////////////////////////////
// Log Wrapper
//

kawasu.microtable.config.bLog = true;

kawasu.microtable.log = function (msg) { if (kawasu.microtable.config.bLog) { console.log(msg); } }
kawasu.microtable.warn = function (msg) { if (kawasu.microtable.config.bLog) { console.warn(msg); } }
kawasu.microtable.error = function (msg) { if (kawasu.microtable.config.bLog) { console.error(msg); } }


///////////////////////////////////////////////////////////////////////////////
// Set some class variables up
//





// Table view states
kawasu.microtable.config.STACK = 1;
kawasu.microtable.config.VERTICAL = 0;

// Each table id is padded with zeros
kawasu.microtable.config.nZeroPadding = 6;

// Constant 
kawasu.microtable.config.sEmptyStringHtml = "&nbsp";

// Div Wrapper for return
kawasu.microtable.config.sDivOuterPrefix = "div_";
kawasu.microtable.config.sDivOuterSuffix = "_Outer";


///////////////////////////////////////////////////////////////////////////////
// ENTRY POINT
//

kawasu.microtable.build = function (arrData, styleDefn, sTableId, sItemName, nRowsMinimum, bMultiSelect, nViewState) {
    var prefix = "kawasu.microtable.build() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Cache the styleDefn for use later.  All data pertaining to this table
    // will then be stored in this area.
    kawasu.microtable[sTableId] = new Object();
    kawasu.microtable[sTableId]["arrData"] = arrData;
    kawasu.microtable[sTableId]["styleDefn"] = styleDefn;
    kawasu.microtable[sTableId]["nViewState"] = nViewState;
    kawasu.microtable[sTableId]["sItemName"] = sItemName;
    kawasu.microtable[sTableId]["nRowsMinimum"] = nRowsMinimum;
    kawasu.microtable[sTableId]["bMultiSelect"] = bMultiSelect;
    kawasu.microtable[sTableId]["bExpandable"] = false;
    kawasu.microtable[sTableId]["bMultiExpand"] = false;


    // Header object is created by walking the inbound data and 
    // creating a property on a new object for every unique 
    // property on the objects in the arrData array.
    kawasu.microtable[sTableId]["header"] = kawasu.microtable.buildHeaderData(arrData);

    var rawTables = kawasu.microtable.buildRawTables(sTableId); // returns nodelist of tables

    // Apply view state
    kawasu.microtable.applyViewState(sTableId, rawTables);

    // Get the table dimensions
    //var sizeTable = kawasu.microtable.getTableSize(rawTables, 0);

    // Create a wrapping div to hold the tables
    var divOuter = document.createElement("div");
    divOuter.id = kawasu.microtable.config.sDivOuterPrefix + sTableId + kawasu.microtable.config.sDivOuterSuffix;
    //divOuter.style.overflowY = "scroll"; // Allow control via container div
    divOuter.style.width = "100%"; // Container controls width also

    divOuter.appendChild(rawTables);

    kawasu.microtable.log(prefix + "Exiting");
    return divOuter;
}





///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTION / BUILD 
//

kawasu.microtable.buildHeaderData = function (arrayJsonObjects) {
    var prefix = "kawasu.microtable.buildHeaderData() - ";
    kawasu.microtable.log(prefix + "Entering");

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

    kawasu.microtable.log(prefix + "Exiting");
    return header;
}

kawasu.microtable.buildRawTables = function (sTableId) {
    var prefix = "kawasu.microtable.buildRawTables() - ";
    kawasu.microtable.log(prefix + "Entering");


    // This fn takes an array of JSON objects and creates a set of HTML table from them, 
    // one table per object, applying the styles listed in the styleDefn object.

    var arrData = kawasu.microtable[sTableId]["arrData"];
    var header = kawasu.microtable[sTableId]["header"];
    var sItemName = kawasu.microtable[sTableId]["sItemName"];
    var styleDefn = kawasu.microtable[sTableId]["styleDefn"];
    var nRowsMinimum = kawasu.microtable[sTableId]["nRowsMinimum"];             // Pad to this number of rows

    var nRowsRequired = nRowsMinimum - kawasu.microtable.countHeaders(header);

    kawasu.microtable[sTableId]["indexCurrentRow"] = 1;

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
    tableControl.id = kawasu.microtable.getTableId(sTableId, 0);

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
    textboxRowNavigate.setAttribute("type", "textbox");
    textboxRowNavigate.id = sTableId + "_" + "textboxRowNavigate";
    textboxRowNavigate.value = (kawasu.microtable[sTableId]["indexCurrentRow"]);
    textboxRowNavigate.className = classTextboxRowNavigate;

    fc.utils.addEvent(textboxRowNavigate, "change", kawasu.microtable.textboxRowNavigate_onChange);
    textboxRowNavigate.setAttribute("onkeyup", "return kawasu.microtable.textboxRowNavigate_onKeyUp(event)");
    textboxRowNavigate.setAttribute("onkeypress", "return kawasu.microtable.textboxRowNavigate_onKeyPress(event)");

    th1Control.appendChild(textboxRowNavigate);

    th1Control.className = classHeaderCell + " " + classCol1;
    trHeaderControl.appendChild(th1Control);

    var th2Control = document.createElement("th");

    // First Row Button
    var btnRowFirst = document.createElement("input");
    btnRowFirst.setAttribute("type", "button");
    btnRowFirst.id = sTableId + "_" + "btnRowFirst";
    btnRowFirst.value = "<<";
    btnRowFirst.title = "First";
    btnRowFirst.className = classBtnRowNavigate;
    fc.utils.addEvent(btnRowFirst, "click", kawasu.microtable.btnRowNavigate_onClick);
    th2Control.appendChild(btnRowFirst);

    // Previous Row Button
    var btnRowPrev = document.createElement("input");
    btnRowPrev.setAttribute("type", "button");
    btnRowPrev.id = sTableId + "_" + "btnRowPrev";
    btnRowPrev.value = "<";
    btnRowPrev.title = "Previous";
    btnRowPrev.className = classBtnRowNavigate;
    fc.utils.addEvent(btnRowPrev, "click", kawasu.microtable.btnRowNavigate_onClick);
    th2Control.appendChild(btnRowPrev);

    // Next Row Button
    var btnRowNext = document.createElement("input");
    btnRowNext.setAttribute("type", "button");
    btnRowNext.id = sTableId + "_" + "btnRowNext";
    btnRowNext.value = ">";
    btnRowNext.title = "Next";
    btnRowNext.className = classBtnRowNavigate;
    fc.utils.addEvent(btnRowNext, "click", kawasu.microtable.btnRowNavigate_onClick);
    th2Control.appendChild(btnRowNext);

    // Last Row Button
    var btnRowLast = document.createElement("input");
    btnRowLast.setAttribute("type", "button");
    btnRowLast.id = sTableId + "_" + "btnRowLast";
    btnRowLast.value = ">>";
    btnRowLast.title = "Last";
    btnRowLast.className = classBtnRowNavigate;
    fc.utils.addEvent(btnRowLast, "click", kawasu.microtable.btnRowNavigate_onClick);
    th2Control.appendChild(btnRowLast);

    // Select Checkbox
    var checkboxControlSelect = document.createElement("input");
    checkboxControlSelect.setAttribute("type", "checkbox");
    checkboxControlSelect.id = sTableId + "_" + "checkboxSelect";
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

    var tableControlNativeHeader = kawasu.microtable.addRow(sTableId, tableControl, true, -1, kawasu.microtable.getItemText(sItemName, 0)); // Native header row "Row:0"
    var tableControlNativeHeaderCellCol1 = tableControlNativeHeader.cells[0];
    fc.utils.addEvent(tableControlNativeHeaderCellCol1, "click", kawasu.microtable.thNativeHeader_onClick);


    // Add the minimum number of blank rows
    for (var j = 0; j < nRowsMinimum; ++j) {
        kawasu.microtable.addRow(sTableId, tableControl, false, -1); // bHeader=false ie "td", not "th"
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
        table.id = kawasu.microtable.getTableId(sTableId, i + 1);

        // Add native header
        var trNativeHeader = kawasu.microtable.addRow(sTableId, table, true, i, kawasu.microtable.getItemText(sItemName, i + 1));
        var trNativeHeaderCellCol1 = trNativeHeader.cells[0];
        fc.utils.addEvent(trNativeHeaderCellCol1, "click", kawasu.microtable.thNativeHeader_onClick);

        // Add a checkbox to the native header 2nd cell
        var checkboxSelect = document.createElement("input");
        checkboxSelect.setAttribute("type", "checkbox");
        checkboxSelect.id = table.id + "_" + "checkboxSelect";
        checkboxSelect.className = classCheckboxSelect;
        fc.utils.addEvent(checkboxSelect, "click", kawasu.microtable.checkboxSelect_onClick);
        trNativeHeader.cells[1].appendChild(checkboxSelect);


        // Iterate the header object, and add one row per header element.
        // Each header element is a key, and there should be a value in the data element.
        for (var prop in header) {
            if (header.hasOwnProperty(prop)) {
                kawasu.microtable.addRow(sTableId, table, false, i, prop, obj[prop]);
            }

        } // end of iteration of data object's properties (rows for each object as a table)

        // Pad with blank rows if required
        for (var k = 0; k < nRowsRequired; ++k) {
            kawasu.microtable.addRow(sTableId, table, false, i);
        }

        rawTables.appendChild(table);

    } // end of iteration of data object array (table completed for this object)

    // Make sortable
    kawasu.microtable.makeKeysSortable(sTableId, rawTables);

    kawasu.microtable.log(prefix + "Exiting");
    return rawTables;
}

kawasu.microtable.rebuild = function (sTableId,arrDataNew) {
    var prefix = "kawasu.microtable.rebuild() - ";
    kawasu.microtable.log(prefix + "Entering");

    // This fn assumes that the underlying data has been changed, and that we
    // need to resynchronise the tables with the data.  Rather than try to 
    // figure out what has changed, we drop the tables and rebuild.

    // Assumes: sItemName remains the same.

    if (typeof arrDataNew !== 'undefined') {
        kawasu.microtable[sTableId]["arrData"] = arrDataNew;
    }

    // Build first, and then swap new built data into place
    kawasu.microtable[sTableId]["header"] = kawasu.microtable.buildHeaderData(kawasu.microtable[sTableId]["arrData"]);
    var rawTables_rebuild = kawasu.microtable.buildRawTables(sTableId);

    // Apply view state
    kawasu.microtable.applyViewState(sTableId, rawTables_rebuild);

    // Drop the current contents of divOuter and attach new rawtables
    var divOuterId = kawasu.microtable.config.sDivOuterPrefix + sTableId + kawasu.microtable.config.sDivOuterSuffix;
    var divOuter = document.getElementById(divOuterId);
    while (divOuter.lastChild) divOuter.removeChild(divOuter.lastChild);
    divOuter.appendChild(rawTables_rebuild);

    kawasu.microtable.log(prefix + "Exiting");
    return rawTables_rebuild;
}

//
///////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////
// VIEW STATE
//

kawasu.microtable.viewState = function (sTableId, nViewState) {
    var prefix = "kawasu.microtable.viewState() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Get or Set the View State

    if (typeof nViewState !== 'undefined') {
        // Setting
        kawasu.microtable[sTableId]["nViewState"] = nViewState;
        kawasu.microtable.applyViewState(sTableId);
    }

    // Either way, return the viewstate...
    kawasu.microtable.log(prefix + "Exiting");
    return kawasu.microtable[sTableId]["nViewState"];
}

kawasu.microtable.applyViewState = function (sTableId, rawTables) {
    var prefix = "kawasu.microtable.applyViewState() - ";
    kawasu.microtable.log(prefix + "Entering");

    if (typeof rawTables === 'undefined') { rawTables = kawasu.microtable.getRawTables(sTableId); }

    if (typeof rawTables === 'undefined') {
        kawasu.microtable.error(prefix + "ERROR: Could not locate raw tables from sTableId: >" + sTableId + "<; Exiting");
        return;
    }

    var nViewState = kawasu.microtable[sTableId]["nViewState"];
    var indexCurrentRow = kawasu.microtable[sTableId]["indexCurrentRow"];

    switch (nViewState) {
        case kawasu.microtable.config.VERTICAL:
            kawasu.microtable.setViewStateVertical(sTableId, rawTables, indexCurrentRow);
            break;
        default:
            kawasu.microtable.warn(prefix + "WARNING: Unknown view state value detected (" + nViewState + "); defaulting to STACK");
        case kawasu.microtable.config.STACK:
            kawasu.microtable.setViewStateStack(sTableId, rawTables, indexCurrentRow);
            break;
    }

    kawasu.microtable.log(prefix + "Exiting");
}


kawasu.microtable.setViewStateStack = function (sTableId, rawTables, indexCurrentRow) {
    var prefix = "kawasu.microtable.setViewStateStack() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Show the control table as the header.
    // Show the currently selected row only.
    // Hide the row's native header
    // Set the control select checkbox to match the underlying rowTable checkbox

    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;
    var tableControl = rawTablesChildren[0];
    var controlCheckbox = kawasu.microtable.getCheckboxFromTable(tableControl);
    kawasu.microtable.elementVis(tableControl, true);


    // Ensure that the current row is legal and up to date
    if (kawasu.microtable[sTableId]["indexCurrentRow"] > (nodeListLength - 1)) {
        kawasu.microtable[sTableId]["indexCurrentRow"] = nodeListLength - 1;
    }

    // Get a ref to the textbox
    var textbox = kawasu.microtable.getTextboxFromTable(tableControl);
    textbox.value = kawasu.microtable[sTableId]["indexCurrentRow"];


    // Special Case: No data to show
    if (nodeListLength == 1) {

        // If there is only a control table, show the blank padding rows, but don't show
        // the native header row

        kawasu.microtable.elementVis(tableControl.rows[0], true); // Show the control header
        kawasu.microtable.elementVis(tableControl.rows[1], false); // Hide the native header

        for (var j = 2; j < tableControl.rows.length; ++j) {
            kawasu.microtable.elementVis(tableControl.rows[j], true); // Show the padding rows         
        }

        controlCheckbox.checked = false;

        return;
    }
    // implicit else...

    ///////////////////////////////////
    // Regular Case: Data to display

    // Show the control table
    kawasu.microtable.elementVis(tableControl.rows[0], true); // Show the control header
    kawasu.microtable.elementVis(tableControl.rows[1], false); // Hide the native header

    for (var j = 2; j < tableControl.rows.length; ++j) {
        kawasu.microtable.elementVis(tableControl.rows[j], false); // Hide the padding rows         
    }

    // Show the data 
    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        if (i == indexCurrentRow) {
            kawasu.microtable.elementVis(table.rows[0], false); // Hide native header
            for (var j = 1; j < table.rows.length; ++j) {
                kawasu.microtable.elementVis(table.rows[j], true); // Show the data rows
            }
            kawasu.microtable.elementVis(table, true); // Show table

            // Set the control checkbox equal to the current row checkbox
            var checkbox = kawasu.microtable.getCheckboxFromTable(table);
            controlCheckbox.checked = checkbox.checked;
        }
        else {
            kawasu.microtable.elementVis(table, false); // Hide table
        }
    }

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.setViewStateVertical = function (sTableId, rawTables, indexCurrentRow) {
    var prefix = "kawasu.microtable.setViewStateVertical() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Hide the control table.
    // Show all the row tables sequentially.  
    // Show the row's native header.

    var bExpandable = kawasu.microtable[sTableId]["bExpandable"];
    var bMultiExpand = kawasu.microtable[sTableId]["bMultiExpand"];

    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;
    var tableControl = rawTablesChildren[0];


    // Special Case: No data to show
    if (nodeListLength == 1) {

        kawasu.microtable.elementVis(tableControl.rows[0], false); // Hide the control header
        kawasu.microtable.elementVis(tableControl.rows[1], true); // Show the native header

        for (var j = 2; j < tableControl.rows.length; ++j) {
            kawasu.microtable.elementVis(tableControl.rows[j], true); // Show the padding rows         
        }

        kawasu.microtable.elementVis(tableControl, true); // Having set up the elements of the control table, show it
        return;
    }
    // implicit else

    ///////////////////////////////////
    // Regular Case: Data to show...

    // Hide the control table
    kawasu.microtable.elementVis(tableControl, false);

    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        if (bExpandable) {
            kawasu.microtable.tableExpansionState(table, (i == indexCurrentRow)); // Show rows only for current rowTable
        }
        else {
            kawasu.microtable.tableExpansionState(table, true); // Show all rows for all tables
        }
        kawasu.microtable.elementVis(table, true); // Show table
    }

    kawasu.microtable.log(prefix + "Exiting");
}

//
///////////////////////////////////////////////////////////////////////////////







///////////////////////////////////////////////////////////////////////////////
// EVENT HANDLING
//

kawasu.microtable.textboxRowNavigate_onKeyPress = function (event) {
    var prefix = "kawasu.microtable.textboxRowNavigate_onKeyPress() - ";
    kawasu.microtable.log(prefix + "Entering, no exit, calling fc.utils.isNumericKey(event)...");
    return fc.utils.isNumericKey(event);
}


kawasu.microtable.textboxRowNavigate_onKeyUp = function (event) {
    var prefix = "kawasu.microtable.textboxRowNavigate_onKeyUp() - ";
    kawasu.microtable.log(prefix + "Entering");

    kawasu.microtable.textboxRowNavigate_onChange(event);

    kawasu.microtable.log(prefix + "Exiting");
    return true;
}

kawasu.microtable.textboxRowNavigate_onChange = function (event) {
    var prefix = "kawasu.microtable.textboxRowNavigate_onChange() - ";
    kawasu.microtable.log(prefix + "Entering");

    // User has entered or changed the number in the row navigation textbox. 

    var textboxId = event.target.id;
    var tableId = kawasu.microtable.getTableIdFromControlId(textboxId);
    kawasu.microtable.log(prefix + "INFO: id >" + tableId + "<");

    var arraySplit = tableId.split("_");
    var sTableId = arraySplit[0];
    kawasu.microtable.log(prefix + "INFO: Table >" + sTableId + "<");

    // Get the value from the textbox
    var textbox = document.getElementById(textboxId);
    var textboxValue = textbox.value;
    var nValue = 0;
    if (!fc.utils.isEmptyStringOrWhiteSpace(textboxValue)) {
        nValue = parseInt(textboxValue, 10);
    }
    else {
        kawasu.microtable.log(prefix + "INFO: No value entered, no change to make.");
        return;
    }

    kawasu.microtable.log(prefix + "INFO: Value >" + nValue + "<");

    // Get refs
    var tableControlId = kawasu.microtable.getTableId(sTableId, 0);
    var tableControl = document.getElementById(tableControlId);
    var rawTables = tableControl.parentNode;
    var rawTablesChildren = $(rawTables).children();
    var rawTablesLength = rawTablesChildren.length;

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
    var indexCurrentRow = kawasu.microtable[sTableId]["indexCurrentRow"];
    if (indexCurrentRow != nCleanValue) {
        kawasu.microtable[sTableId]["indexCurrentRow"] = nCleanValue;
        kawasu.microtable.setViewStateStack(sTableId, rawTables, kawasu.microtable[sTableId]["indexCurrentRow"]);
    }

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.btnRowNavigate_onClick = function () {
    var prefix = "kawasu.microtable.btnRowNavigate_onClick() - ";
    kawasu.microtable.log(prefix + "Entering");

    // User has clicked on a row navigation button. 

    var buttonId = this.id;
    var tableId = kawasu.microtable.getTableIdFromControlId(buttonId);
    kawasu.microtable.log(prefix + "INFO: buttonId >" + buttonId + "<");
    kawasu.microtable.log(prefix + "INFO: tableId >" + tableId + "<");

    var arraySplit = buttonId.split("_");
    var sTableId = arraySplit[0];
    var sBtnName = arraySplit[1];

    // Get ref to the array of raw tables...
    var tableControlId = kawasu.microtable.getTableId(sTableId, 0);
    var tableControl = document.getElementById(tableControlId);
    var rawTables = tableControl.parentNode;
    var rawTablesChildren = $(rawTables).children();
    var rawTablesLength = rawTablesChildren.length;

    var indexCurrentRow = kawasu.microtable[sTableId]["indexCurrentRow"];

    // Get a ref to the textbox
    var textboxId = sTableId + "_" + "textboxRowNavigate";
    var textbox = document.getElementById(textboxId);

    switch (sBtnName) {
        case "btnRowFirst":
            if (indexCurrentRow != 1) {
                textbox.value = 1;
                kawasu.microtable[sTableId]["indexCurrentRow"] = 1;
                kawasu.microtable.setViewStateStack(sTableId, rawTables, kawasu.microtable[sTableId]["indexCurrentRow"]);
            }
            break;
        case "btnRowLast":
            if (indexCurrentRow != (rawTablesLength - 1)) {
                textbox.value = (rawTablesLength - 1);
                kawasu.microtable[sTableId]["indexCurrentRow"] = (rawTablesLength - 1);
                kawasu.microtable.setViewStateStack(sTableId, rawTables, kawasu.microtable[sTableId]["indexCurrentRow"]);
            }
            break;
        case "btnRowPrev":
            if (indexCurrentRow > 1) {
                var nextValue = indexCurrentRow - 1;
                textbox.value = nextValue;
                kawasu.microtable[sTableId]["indexCurrentRow"] = nextValue;
                kawasu.microtable.setViewStateStack(sTableId, rawTables, kawasu.microtable[sTableId]["indexCurrentRow"]);
            }
            break;
        case "btnRowNext":
            if (indexCurrentRow < (rawTablesLength - 1)) {
                var nextValue = indexCurrentRow + 1;
                textbox.value = nextValue;
                kawasu.microtable[sTableId]["indexCurrentRow"] = nextValue;
                kawasu.microtable.setViewStateStack(sTableId, rawTables, kawasu.microtable[sTableId]["indexCurrentRow"]);
            }
            break;
        default:
            kawasu.microtable.error(prefix + "ERROR: Could not determine which navigation button was pressed, name=" + sBtnName);
            break;
    }

    // Regardless, populate the textbox in case it was blank before
    textbox.value = kawasu.microtable[sTableId]["indexCurrentRow"];

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.checkboxSelect_onClick = function (event) {
    var prefix = "kawasu.microtable.checkboxSelect_onClick() - ";
    kawasu.microtable.log(prefix + "Entering");

    // User has clicked on a checkbox for either the Control table or a Row table

    var checkbox = event.target;
    var checkboxId = checkbox.id;
    var tableId = kawasu.microtable.getTableIdFromControlId(checkboxId);
    kawasu.microtable.log(prefix + "INFO: checkboxId >" + checkboxId + "<");
    kawasu.microtable.log(prefix + "INFO: tableId >" + tableId + "<");

    var tableArraySplit = tableId.split("_");
    var nSelectedTableIndex = parseInt(tableArraySplit[1], 10);

    var arraySplit = checkboxId.split("_");
    var sTableId = arraySplit[0];
    var bMultiSelect = kawasu.microtable[sTableId]["bMultiSelect"];
    kawasu.microtable.log(prefix + "INFO: Table >" + sTableId + "<");

    // Control Checkbox Name:                   
    //      sTableId + "_" + "checkboxSelect"
    // eg   "MyMicroTable_checkboxSelect"
    //
    // RowTable NativeHeader Checkbox Name:     
    //      sTableId + "_" + fc.utils.prePad(nIndex.toString(), "0", kawasu.microtable.config.nZeroPadding); + "_" + "checkboxSelect"
    // eg   "MyMicroTable_000001_checkboxSelect"
    // Note: getTableId() provides the first two parts of the name


    // If the control checkbox has been clicked we find the selected row, and 
    // set it's checkbox to be the same

    if (arraySplit.length == 2) {

        // Get the Control Checkbox; Control Checkbox name only has two parts
        var controlCheckboxId = sTableId + "_" + "checkboxSelect";
        var controlCheckbox = document.getElementById(controlCheckboxId);

        // This row is being either selected or deselected...
        var indexCurrentRow = kawasu.microtable[sTableId]["indexCurrentRow"];

        // Push the state of the checkbox to the rowTable checkbox
        kawasu.microtable.pushSelectStateControlToRow(sTableId, indexCurrentRow, controlCheckbox.checked);

        // Enforce Single Select if applicable
        if (!bMultiSelect) {
            kawasu.microtable.setSingleSelect(sTableId, indexCurrentRow);
        }

    }
    else if (arraySplit.length == 3) {

        // If we are in multi-select mode, do nothing, no-op
        // If we are in single select mode, turn off any other selections

        if (!bMultiSelect) {
            // Single Select Case 
            // If the checkbox is being turned off, do nothing, but if it's being 
            // turned on, you need to turn off the currently selected checkbox.           
            if (checkbox.checked) {
                kawasu.microtable.setSingleSelect(sTableId, nSelectedTableIndex);
            }
        }
    }

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.thNativeHeader_onClick = function (event) {
    var prefix = "kawasu.microtable.thNativeHeader_onClick() - ";
    kawasu.microtable.log(prefix + "Entering");

    // User has clicked on a native header to compress or expand a row
    var th = event.target;
    var tableTarget = kawasu.microtable.getTableFromHeaderCell(th);
    var tableTargetId = tableTarget.id;
    var arraySplit = tableTargetId.split("_");
    var sTableId = arraySplit[0];
    kawasu.microtable[sTableId]["indexCurrentRow"] = parseInt(arraySplit[1], 10);

    var bExpandable = kawasu.microtable[sTableId]["bExpandable"];
    var bMultiExpand = kawasu.microtable[sTableId]["bMultiExpand"];


    if (!bExpandable) {
        kawasu.microtable.warn(prefix + "WARNING: Table is not in EXPANDABLE mode, no action taken.");
        kawasu.microtable.log(prefix + "Exiting");
        return;
    }
    // implicit else: table is expandable

    if (bMultiExpand) {
        // Table allows rows to be expanded/compressed independently.  
        // Toggle the expansion state of this table.
        kawasu.microtable.tableExpansionState(tableTarget) ?
            kawasu.microtable.tableExpansionState(tableTarget, false) :
            kawasu.microtable.tableExpansionState(tableTarget, true);
    }
    else {
        // Table only allows one expanded row.
        // Expand this row, compress all others.
        kawasu.microtable.applySingleExpand(sTableId);
    }

    kawasu.microtable.log(prefix + "Exiting");
}

//
///////////////////////////////////////////////////////////////////////////////










///////////////////////////////////////////////////////////////////////////////
// ACTIONS
//

kawasu.microtable.deleteSelected = function (sTableId, bDeleteSourceData) {
    var prefix = "kawasu.microtable.deleteSelected() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Iterate the tables and build an array of selected items, and send this to delete routine
    var array = kawasu.microtable.getSelectedIndices(sTableId);

    kawasu.microtable.itemsDelete(sTableId, array, bDeleteSourceData);

    kawasu.microtable.applyViewState(sTableId);

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.itemsDelete = function (sTableId, arrRowsToDelete, bDeleteSourceData) {
    var prefix = "kawasu.microtable.itemsDelete() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Note: The indices passed into this function are the 1-based row numbers.
    // Remember that the control table is always the first (0) row and contains the 
    // blank padding that appears if there are no rows to display in Stack mode.


    // Default syntax - defaults to false, do not delete source data.
    bDeleteSourceData = typeof bDeleteSourceData !== 'undefined' ? bDeleteSourceData : false;

    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;
    var indexCurrentRow = kawasu.microtable[sTableId]["indexCurrentRow"];
    var arrData = kawasu.microtable[sTableId]["arrData"];

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

    kawasu.microtable[sTableId]["indexCurrentRow"] = indexCurrentRow;

    // Do the delete, backwards, so that indices in the data array are always valid

    var arrDataIndicesToDelete = [];
    for (var i = arrRowsToDelete.length - 1; i >= 0; --i) {

        var tableToDelete = rawTablesChildren[(arrRowsToDelete[i])]; // Delete by position

        if (bDeleteSourceData) {
            var row1 = tableToDelete.rows[1]; // rows[0] is the native header, get first row after this
            var iDataIndex = kawasu.microtable.getDataIndexFromRowName(row1);
            arrDataIndicesToDelete.push(iDataIndex);
        }

        rawTables.removeChild(tableToDelete);
    }

    // Delete data and rebuild
    if (arrDataIndicesToDelete.length > 0) {
        arrDataIndicesToDelete.sort(function (a, b) { return b - a }); // Reverse numeric sort
        for (var i = 0; i < arrDataIndicesToDelete.length; ++i) {
            var iDataIndexToDelete = arrDataIndicesToDelete[i];
            arrData.splice(iDataIndexToDelete, 1);
        }
        kawasu.microtable.rebuild(sTableId);
    }
    else {

        // Rename the remaining tables so that navigation still works

        nodeListLength = rawTablesChildren.length;
        for (var i = 1; i < nodeListLength; ++i) {
            var table = rawTablesChildren[i];
            table.id = kawasu.microtable.getTableId(sTableId, i);
            var th1 = table.rows[0].cells[0];
            var sItemName = kawasu.microtable[sTableId]["sItemName"];
            fc.utils.textContent(th1, kawasu.microtable.getItemText(sItemName, i));
        }

        // Update the tooltip
        kawasu.microtable.setLabelTooltipRowCount(sTableId);
    }

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.deleteRequest = function (sTableId, bResetSelected) {
    var prefix = "kawasu.microtable.deleteRequest() - ";
    kawasu.microtable.log(prefix + "Entering");

    // This fn returns the data indices currently selected, so that the
    // parent can manage it's data.

    // Default Syntax; Default to true
    bResetSelected = (typeof bResetSelected === 'undefined') ? true : bResetSelected;

    var selectedDataIndices = kawasu.microtable.getSelectedIndices(sTableId, true); // get zero-based index

    if (bResetSelected) kawasu.microtable.setSelectAll(sTableId, false);

    kawasu.microtable.log(prefix + "Exiting");
    return selectedDataIndices;
}

kawasu.microtable.setSelectAll = function (sTableId, bSelect) {
    var prefix = "kawasu.microtable.setSelectAll() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Default syntax - defaults to true, select all.
    bSelect = (typeof bSelect !== 'undefined') ? bSelect : true;

    var bMultiSelect = kawasu.microtable[sTableId]["bMultiSelect"];
    if (bMultiSelect == false && bSelect == true) {
        // In single select, you cannot select all.  
        // You can, of course, deselect all.
        kawasu.microtable.warn(prefix + "WARNING: Cannot select all in Single Select Mode, no action will be taken.");
        kawasu.microtable.log(prefix + "Exiting");
        return;
    }

    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;

    // Iterate tables, set select state.  
    // Note: Control table case is handled by intelligence in getCheckboxFromTable()
    //       because this fn is able to retrieve the checkbox from the control table too.
    for (var i = 0; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        var checkbox = kawasu.microtable.getCheckboxFromTable(table);
        checkbox.checked = bSelect;
    }

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.refreshView = function (sTableId) {
    var prefix = "kawasu.microtable.refreshView() - ";
    kawasu.microtable.log(prefix + "Entering");

    // This fn is intended for use in testing: When a state variable is 
    // changed, the system does not necessarily refresh the view.  This
    // function gives an outside harness the ability to enforce a view update.

    kawasu.microtable.applyViewState(sTableId);

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.greyRows = function (sTableId, sColumnName, sColumnData, bGreyOut) {
    var prefix = "kawasu.microtable.greyRows() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Default Syntax; This defaults to true, grey out the row
    bGreyOut = (typeof bGreyOut === 'undefined') ? true : bGreyOut;

    if (!kawasu.microtable[sTableId]["styleDefn"].hasOwnProperty("tdClassValueGreyOut")) {
        kawasu.microtable.warn(prefix + "WARNING: No tdClassValueGreyOut style is set in the style definition for this table; No action taken.");
        return;
    }


    ///////////////////////////////////////////////////////////////////////////
    // Grey out the rows where the passed column matches the passed data string

    var tdClassValueGreyOut = kawasu.microtable[sTableId]["styleDefn"]["tdClassValueGreyOut"];
    var tdClassValue = kawasu.microtable[sTableId]["styleDefn"]["tdClassValue"];

    var rowTables = kawasu.microtable.getRowTables(sTableId, sColumnName, sColumnData);

    if (typeof rowTables === 'undefined' || rowTables.length == 0) {
        kawasu.microtable.warn(prefix + "WARNING: No data found matching the criteria");
        return;
    }

    // Iterate tables, greying them out, or not, as appropriate
    for (var i = 0; i < rowTables.length; ++i) {
        rowTable = rowTables[i];
        // Iterate the rows in the table
        for (var j = 1; j < rowTable.rows.length; ++j) {
            var row = rowTable.rows[j];
            var cellValue = row.cells[1];
            cellValue.className = (bGreyOut ? tdClassValueGreyOut : tdClassValue);
        }
    }

    kawasu.microtable.log(prefix + "Exiting");
    return rowTables;
}

//
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
//
// SORTING

kawasu.microtable.sortrowsFlipOrder = function (sTableId, n, comparator) {
    var prefix = "kawasu.microtable.sortrowsFlipOrder() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Wrapper function that checks the column being ordered, and if it is the
    // same as the last column used for ordering, reverses the sort order

    var sortKeyCName = sTableId + "_SortKey"; // Numeric row number
    var sortOrderCName = sTableId + "_SortOrder"; // [ASC,DESC]

    var savedKey = fc.utils.getCookie(sortKeyCName);
    if (savedKey != null && savedKey != "") {
        // We have a saved key - is it this key?
        if (savedKey == n.toString()) {
            // We have ordered on this key before, flip the order
            var savedOrder = fc.utils.getCookie(sortOrderCName);
            if (savedOrder != null && savedOrder != "") {
                // We have a saved ordering criteria, reverse it and save it
                if (savedOrder == "ASC") {
                    fc.utils.setCookie(sortOrderCName, "DESC", 3);
                }
                else {
                    fc.utils.setCookie(sortOrderCName, "ASC", 3);
                }
            }            
        }
    }

    kawasu.microtable.sortrows(sTableId, n, comparator);

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.sortrows = function (sTableId, n, comparator) {
    var prefix = "kawasu.microtable.sortrows() - ";
    kawasu.microtable.log(prefix + "Entering");

    var bKeyIsNumeric = kawasu.microtable.isKeyNumeric(sTableId, n);

    // Get the cookie settings, if they exist
    var sortOrder = "DESC";
    var sortOrderCName = sTableId + "_SortOrder";
    var lastSortOrder = fc.utils.getCookie(sortOrderCName);
    if (lastSortOrder != null && lastSortOrder != "") {
        // Re-apply the saved sort order
        sortOrder = lastSortOrder;
    }
    // else, remains "DESC"

    // Save the name of the current rowTable
    var indexCurrentRow = kawasu.microtable[sTableId]["indexCurrentRow"];
    var tableTargetId = kawasu.microtable.getTableIdFromIndexCurrentRow(sTableId, indexCurrentRow);

    // Create an array of tables to sort
    var arrayRowTables = [];
    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;
    for (var i = 1; i < nodeListLength; ++i) {
        arrayRowTables.push(rawTablesChildren[i]);
    }

    arrayRowTables.sort(function (rowTable1, rowTable2) {

        // Get the value cells from each table
        var cell1 = rowTable1.rows[n].cells[1];
        var cell2 = rowTable2.rows[n].cells[1];

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

        var val1 = fc.utils.textContent(cell1);
        var val2 = fc.utils.textContent(cell2);

        if (comparator) return comparator(val1, val2); // If you've been passed a fn to use as a comparator, use it
        if (bKeyIsNumeric) return fc.utils.numericComparator(val1, val2);

        // else, do a default comparison
        return fc.utils.defaultComparator(val1, val2);
    }); // end of .sort()

    // If descending, reverse the data array
    if (sortOrder == "DESC") arrayRowTables.reverse();

    // Append the rows under rawTables in the order of the array
    for (var i = 0; i < arrayRowTables.length; ++i) {
        var tableCurrent = arrayRowTables[i];

        if (tableCurrent.id == tableTargetId) {
            // This table is the current one showing, but it's position has changed,
            // so the current index has also changed.
            kawasu.microtable[sTableId]["indexCurrentRow"] = i + 1;
        }

        // Reset the item number identifier to reflect current order
        var th1 = tableCurrent.rows[0].cells[0];
        var sItemName = kawasu.microtable[sTableId]["sItemName"];
        fc.utils.textContent(th1, kawasu.microtable.getItemText(sItemName, i + 1));

        rawTables.appendChild(tableCurrent);
    }

    // Update the current row textbox to be correct
    var textboxId = sTableId + "_" + "textboxRowNavigate";
    var textbox = document.getElementById(textboxId);
    textbox.value = kawasu.microtable[sTableId]["indexCurrentRow"];

    // Save the sort column and order
    var sortKeyCName = sTableId + "_SortKey";
    fc.utils.setCookie(sortKeyCName, n.toString(10), 3);
    fc.utils.setCookie(sortOrderCName, sortOrder, 3);

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.makeKeysSortable = function (sTableId, rawTables) {
    var prefix = "kawasu.microtable.makeKeysSortable() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Attach a function to the Key cell's onclick event to trigger sorting.

    // Iterate the rowTables
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;

    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];

        // Iterate the rows of each rowTable
        for (var j = 1; j < table.rows.length; ++j) {
            // rows[0] is the native header
            row = table.rows[j];

            // Attach a closure
            (function (n) {                                                         // Call this anonymous function with argument i
                row.cells[0].onclick = function () {                                // Attach a function with a closed n value to each header's onclick event
                    kawasu.microtable.sortrowsFlipOrder(sTableId, n);               // Close off an instance of sortrows with value n and make it a fn
                };
            } (j));
        }
    }

    kawasu.microtable.log(prefix + "Exiting");
}


kawasu.microtable.applySort = function (sTableId, n, sOrder) {
    var prefix = "kawasu.microtable.applySort() - ";
    kawasu.microtable.log(prefix + "Entering");

    if (!(sOrder == "ASC" || sOrder == "DESC")) {
        kawasu.microtable.warn(prefix + "WARNING: 3rd parameter [sOrder] must be either ASC or DESC; passed >" + sOrder + "<");
        return;
    }

    // Set the cookie to the required sort order
    var sortKeyCName = sTableId + "_SortKey";
    var sortOrderCName = sTableId + "_SortOrder";
    fc.utils.setCookie(sortKeyCName, n.toString(10), 3);
    fc.utils.setCookie(sortOrderCName, sOrder, 3);

    kawasu.microtable.sortrows(sTableId, n);

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.applySortByKeyIndex = function (sTableId, n, sOrder) {
    var prefix = "kawasu.microtable.applySortByKeyIndex() - ";
    kawasu.microtable.log(prefix + "Entering");

    if (n < 0) {
        kawasu.microtable.error(prefix + "ERROR: Key index is negative.");
        return;
    }

    kawasu.microtable.applySort(sTableId, n, sOrder);

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.applySortByKeyName = function (sTableId, sKeyName, sOrder) {
    var prefix = "kawasu.microtable.applySortByKeyName() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Function to programmatically apply sort order to a table, rather than
    // the user clicking on a column header.

    var n = kawasu.microtable.getIndexByKeyName(sTableId, sKeyName);

    if (n == -1) {
        kawasu.microtable.warn(prefix + "WARNING: Could not find Key in table >" + sTableId + "< with key name >" + sKeyName + "<.  Cannot sort table as requested.");
        return;
    }

    kawasu.microtable.applySort(sTableId, n, sOrder);

    kawasu.microtable.log(prefix + "Exiting");
}


//
///////////////////////////////////////////////////////////////////////////////













///////////////////////////////////////////////////////////////////////////////
// PRIVATE HELPERS
//

kawasu.microtable.getRowTables = function (sTableId, sKey, sValue) {
    var prefix = "kawasu.microtable.getRowTables() - ";
    kawasu.microtable.log(prefix + "Entering");

    var iRow = kawasu.microtable.getRowIndexFromKey(sTableId, sKey);
    if (iRow == -1) {
        kawasu.microtable.error(prefix + "ERROR: Could not get a row index value for a key called >" + sKey + "<");
        return;
    }

    // Return an array of ref-to-rowTables where the passed sKey equals sValue
    var arrayRowTables = [];

    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;
    for (var i = 0; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        var row = table.rows[iRow]; // Key row
        var cell = row.cells[1]; // Value cell
        if (sValue == fc.utils.textContent(cell)) {
            arrayRowTables.push(table);
        }
    }

    kawasu.microtable.log(prefix + "Exiting");
    return arrayRowTables;
}

kawasu.microtable.getRowIndexFromKey = function (sTableId, sKey) {
    var prefix = "kawasu.microtable.getRowIndexFromKey() - ";
    kawasu.microtable.log(prefix + "Entering");

    var header = kawasu.microtable[sTableId]["header"];

    // Walk the header.  The header was walked to build each row, which has a key and value.
    // We want to find the row number where the key matches

    var count = 0;
    for (var prop in header) {
        if (header.hasOwnProperty(prop)) {
            ++count;
            if (prop == sKey) return count;
        }
    }

    kawasu.microtable.log(prefix + "Exiting");
    return -1;
}


kawasu.microtable.applySingleExpand = function (sTableId) {
    var prefix = "kawasu.microtable.applySingleExpand() - ";
    kawasu.microtable.log(prefix + "Entering");

    var indexCurrentRow = kawasu.microtable[sTableId]["indexCurrentRow"];
    var tableTargetId = kawasu.microtable.getTableId(sTableId, indexCurrentRow);
    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;
    for (var i = 0; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        kawasu.microtable.tableExpansionState(table, (table.id == tableTargetId));
    }
    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.isControlTable = function (table) {
    var arraySplit = (table.id).split("_");
    return (parseInt(arraySplit[1], 10) == 0);
}


kawasu.microtable.elementVis = function (element, bShow) {
    if (typeof bShow === 'undefined') {
        // Get: If element is not display:none, it is visible
        return (element.style.display != "none");
    }
    else {
        // Set
        element.style.display = (bShow) ? "" : "none";
        return bShow;
    }
}

kawasu.microtable.tableExpansionState = function (table, bExpansionState) {
    var prefix = "kawasu.microtable.tableExpansionState() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Get/Set for expansion state - true means expand this table, false means compress, no arg means return state

    if (typeof bExpansionState !== 'undefined') {
        // Set
        kawasu.microtable.log(prefix + "INFO: Setting expansion state to " + (bExpansionState ? "true" : "false") + " for table " + table.id);

        // Iterate the rows of the table.
        // If the row contains td elements, set the row to the given show state
        var bIsControlTable = kawasu.microtable.isControlTable(table);
        var tableChildren = $(table).children();
        var nodeListLength = tableChildren.length;
        for (var i = 0; i < nodeListLength; ++i) {
            var row = tableChildren[i];
            var cell = row.cells[0];
            if (cell.nodeName == 'TD') {
                // Data rows
                kawasu.microtable.elementVis(row, bExpansionState);
            }
            else {
                // Header rows
                kawasu.microtable.elementVis(row, !(bIsControlTable && i == 0)); // Don't show the control table's zero row, show it's row[1] though
            }
        }

        kawasu.microtable.log(prefix + "Exiting");
        return bExpansionState;
    }
    else {
        // Get

        // If the last row is hidden, the whole table will be hidden
        var lastRow = table.lastChild;
        kawasu.microtable.log(prefix + "Exiting");
        return kawasu.microtable.elementVis(lastRow);
    }
}


kawasu.microtable.expandable = function (sTableId, bExpandable) {
    var prefix = "kawasu.microtable.expandable() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Get/Set for expandable state - true means yes, this table allows row compression/expansion

    if (typeof bExpandable !== 'undefined') {
        // Set
        kawasu.microtable.log(prefix + "INFO: Setting bExpandable to " + (bExpandable ? "true" : "false"));
        kawasu.microtable[sTableId]["bExpandable"] = bExpandable;
        kawasu.microtable.applyViewState(sTableId);
    }

    kawasu.microtable.log(prefix + "Exiting");
    return kawasu.microtable[sTableId]["bExpandable"];
}

kawasu.microtable.multiExpand = function (sTableId, bMultiExpand) {
    var prefix = "kawasu.microtable.multiExpand() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Get/Set for multiexpand state - true means yes, this table allows multiple rows expanded at the same time

    if (typeof bMultiExpand !== 'undefined') {
        // Set
        kawasu.microtable.log(prefix + "INFO: Setting bMultiExpand to " + (bMultiExpand ? "true" : "false"));
        kawasu.microtable[sTableId]["bMultiExpand"] = bMultiExpand;
        kawasu.microtable.applyViewState(sTableId);
    }

    kawasu.microtable.log(prefix + "Exiting");
    return kawasu.microtable[sTableId]["bMultiExpand"];
}

kawasu.microtable.multiSelect = function (sTableId, bMultiSelect) {
    var prefix = "kawasu.microtable.multiSelect() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Get/Set for multiselect state - true means yes, this table allows multiselection

    if (typeof bMultiSelect !== 'undefined') {
        // Set
        kawasu.microtable.log(prefix + "INFO: Setting bMultiSelect to " + (bMultiSelect ? "true" : "false"));
        kawasu.microtable[sTableId]["bMultiSelect"] = bMultiSelect;
    }

    kawasu.microtable.log(prefix + "Exiting");
    return kawasu.microtable[sTableId]["bMultiSelect"];
}

kawasu.microtable.getTableId = function (sTableId, nIndex) {
    return sTableId + "_" + fc.utils.prePad(nIndex.toString(), "0", kawasu.microtable.config.nZeroPadding);
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

kawasu.microtable.getRawTables = function (sTableId) {
    // Once the raw tables have been created, they get attached to the main doc,
    // and we lose track of them.  To find the owner, get the control and get
    // it's parent.  Always use 'children' not 'childnodes' to access siblings.
    var controlTableId = kawasu.microtable.getTableId(sTableId, 0);
    var controlTable = document.getElementById(controlTableId);
    return controlTable.parentNode;
}

kawasu.microtable.setLabelTooltipRowCount = function (sTableId) {
    // Work out how many data rows there are, and set the tooltip accordingly
    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var tableControl = rawTablesChildren[0];
    var tr = tableControl.rows[0];
    var th1 = tr.cells[0];
    var th1Children = $(th1).children();
    var label = th1Children[0];

    var sItemName = kawasu.microtable[sTableId]["sItemName"];
    var nDataRows = rawTablesChildren.length - 1;

    label.title = kawasu.microtable.getLabelTooltip(sItemName, nDataRows);
}

kawasu.microtable.getTableIdFromControlId = function (controlId) {
    var prefix = "kawasu.microtable.getTableIdFromControlId() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Textbox naming may dissociate from table naming.
    // Textbox is in cell (th), in row (tr), in table
    var control = document.getElementById(controlId);
    var cell = control.parentNode;
    var tr = cell.parentNode;
    var table = tr.parentNode;

    kawasu.microtable.log(prefix + "Exiting");
    return table.id;
}

kawasu.microtable.getTableFromHeaderCell = function (th) {
    var prefix = "kawasu.microtable.getTableFromHeaderCell() - ";
    kawasu.microtable.log(prefix + "Entering");

    var tr = th.parentNode;
    var table = tr.parentNode;

    kawasu.microtable.log(prefix + "Exiting");
    return table;
}

kawasu.microtable.getTextboxFromTable = function (table) {
    // Textbox is only on the control table, which is passed
    var tr = table.rows[0]; // First row of control table
    var cell = tr.cells[0]; // First cell of first row
    var cellChildren = $(cell).children();
    var textbox = cellChildren[1]; // 2nd element of this cell
    return textbox;
}

kawasu.microtable.getLabelTooltip = function (sItemName, nCount) {
    return (sItemName + " count=" + nCount);
}

kawasu.microtable.getCheckboxFromTable = function (table) {

    // ControlTable or RowTable?

    var tableId = table.id;
    var arraySplit = tableId.split("_");
    var sTableId = arraySplit[0];
    var zeroIndex = parseInt(arraySplit[1]);
    var checkboxId = "";

    var cell1Children = $(table.rows[0].cells[1]).children();
    if (zeroIndex == 0) {
        // Control
        var checkbox = cell1Children[4]; // 5th control
        return checkbox;
    }
    else {
        // Row
        var checkbox = cell1Children[0]; // 1st control
        return checkbox;
    }
}

kawasu.microtable.pushSelectStateControlToRow = function (sTableId, nSelectedIndex, bState) {
    var prefix = "kawasu.microtable.pushSelectStateControlToRow() - ";
    kawasu.microtable.log(prefix + "Entering");

    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var table = rawTablesChildren[nSelectedIndex];
    var checkbox = kawasu.microtable.getCheckboxFromTable(table);
    checkbox.checked = bState;

    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.setSingleSelect = function (sTableId, nSelectedIndex) {
    var prefix = "kawasu.microtable.setSingleSelect() - ";
    kawasu.microtable.log(prefix + "Entering");

    // RowTable 'nSelectedIndex' has been selected, and we are in Single Select
    // mode, so set the other rowTables to not selected.

    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;

    // Single Select
    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        var checkbox = kawasu.microtable.getCheckboxFromTable(table);
        if (i == nSelectedIndex) {
            checkbox.checked = true;
        }
        else {
            checkbox.checked = false;
        }

    }
    kawasu.microtable.log(prefix + "Exiting");
}

kawasu.microtable.getSelectedIndices = function (sTableId, bZeroIndexed) {
    var prefix = "kawasu.microtable.getSelectedIndices() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Default syntax;  Default to returning 1-indexed tableRow, but provide the 
    // facility of returning zero-indexed data row also.
    bZeroIndexed = (typeof bZeroIndexed === 'undefined') ? false : bZeroIndexed;

    var arraySelected = [];
    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;

    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        var checkbox = kawasu.microtable.getCheckboxFromTable(table);
        if (checkbox.checked) {
            if (bZeroIndexed) {
                // Get the arrData index number and put that in the array
                var dataIndex = kawasu.microtable.getDataIndexFromTable(table);
                arraySelected.push(dataIndex);
            }
            else {
                // Get the table position index number and put that in the array
                arraySelected.push(i);
            }
        }
    }

    kawasu.microtable.log(prefix + "INFO: Returning array of size: >" + arraySelected.length + "<");

    kawasu.microtable.log(prefix + "Exiting");
    return arraySelected;
}

kawasu.microtable.addRow = function (sTableId, table, bHeader, iDataIndex, cell1, cell2) {
    //var prefix = "kawasu.microtable.addRow() - ";
    //kawasu.microtable.log(prefix + "Entering");

    // Creates a row and adds it to a table, and returns a ref to the row

    var styleDefn = kawasu.microtable[sTableId]["styleDefn"];

    var classRowHeader = styleDefn["trClassHeader"] || "";
    var classHeaderCell = styleDefn["thClass"] || "";
    var classCol1 = styleDefn["classCol1"] || "";
    var classRowData = styleDefn["trClassData"] || "";
    var classCellKey = styleDefn["tdClassKey"] || "";
    var classCellValue = styleDefn["tdClassValue"] || "";

    var cellType = (bHeader ? "th" : "td");

    // Build some id's
    var tableId = table.id;
    var arraySplit = tableId.split("_");
    var sTableIndex = arraySplit[1]; // [0]=sTableId,[1]="000000" etc
    var tableChildren = $(table).children();
    var nCurrentRowCount = tableChildren.length; // Next index is this value
    var sCurrentRowCount = fc.utils.prePad(nCurrentRowCount.toString(), "0", 4);

    var sDataIndex = "";
    if (iDataIndex >= 0) {
        var sDataIndex = fc.utils.prePad(iDataIndex.toString(), "0", 6)
    }

    var sRowId = kawasu.microtable.getRowName(sTableId, sTableIndex, sCurrentRowCount, sDataIndex);
    var sCell1Id = sRowId + "_" + cellType + "1";
    var sCell2Id = sRowId + "_" + cellType + "2";

    var tr = document.createElement("tr");
    tr.className = bHeader ? classRowHeader : classRowData;
    tr.id = sRowId;

    // First column cell
    var cellCol1 = document.createElement(cellType);
    var cellCol1Class = (bHeader ? classHeaderCell : classCellKey) + " " + classCol1;
    cellCol1.className = cellCol1Class;
    cellCol1.id = sCell1Id;
    var sCell1 = kawasu.microtable.getTdElementContent(cell1);
    cellCol1.innerHTML = sCell1;

    // Second column cell
    var cellCol2 = document.createElement(cellType);
    var cellCol2Class = (bHeader ? classHeaderCell : classCellValue)
    cellCol2.className = cellCol2Class;
    cellCol2.id = sCell2Id;
    var sCell2 = kawasu.microtable.getTdElementContent(cell2);
    cellCol2.innerHTML = sCell2;
    if (bHeader == false && !fc.utils.isEmptyStringOrWhiteSpace(sCell2)) {
        cellCol2.title = sCell2;  // If this is a data row, value cell, make the tooltip the data too
    }

    tr.appendChild(cellCol1);
    tr.appendChild(cellCol2);
    table.appendChild(tr);

    //kawasu.microtable.log(prefix + "Exiting");

    return tr;
}

kawasu.microtable.getTdElementContent = function (arg) {
    // Take a variable and return a sensible string to show in the table

    if (typeof arg === 'undefined' || arg == null) {
        return kawasu.microtable.config.sEmptyStringHtml;
    }

    if (typeof arg == 'string' || arg instanceof String) {
        if (fc.utils.isEmptyStringOrWhiteSpace(arg)) {
            return kawasu.microtable.config.sEmptyStringHtml; // Empty string, replace with nbsp
        }
        else {
            return arg; // Not empty, not a string, send it back unchanged
        }
    }

    // Not a string, not undefined and not null, try to convert to string and return...
    return arg.toString();
}

kawasu.microtable.getRowName = function (sTableId, sTableIndex, sCurrentRowCount, sDataIndex) {
    return  sTableId + "_" +
            sTableIndex + "_" +
            "tr" + "_" +
            sCurrentRowCount + "_" +
            sDataIndex;
}

kawasu.microtable.getDataIndexFromRowName = function (row) {
    var prefix = "kawasu.microtable.getDataIndexFromRowName() - ";
    var rowId = row.id;
    var sArraySplit = rowId.split("_");

    if (sArraySplit.length < 5) {
        kawasu.microtable.error(prefix + "ERROR: Row name >" + rowId + "< does not split to at least 5 elements, cannot find data index value.");
        return -1;
    }

    try {
        return parseInt(sArraySplit[4], 10);
    }
    catch (error) {
        kawasu.microtable.error(prefix + "ERROR: Failed to convert string >" + sArraySplit[4] + "< to integer: " + error);
    }
    
    return -1;
}

kawasu.microtable.getTableSize = function (rawTables) {
    var prefix = "kawasu.microtable.getTableSize() - ";
    kawasu.microtable.log(prefix + "Entering");

    var rawTablesChildren = $(rawTables).children();
    var cloneControlTable = rawTablesChildren[0].cloneNode(true);
    cloneControlTable.style.width = "auto";

    var size = new Object();
    size.height = 0;
    size.width = 0;

    // Make an invisible div for sizing the table
    var divSizing = document.createElement('div');
    divSizing.style.position = "absolute";
    divSizing.style.top = "0px";
    divSizing.style.left = "0px";
    divSizing.style.width = "1px";
    //divSizing.style.visibility = "hidden";

    document.body.appendChild(divSizing);
    divSizing.appendChild(cloneControlTable);

    size.height = cloneControlTable.offsetHeight;
    size.width = cloneControlTable.offsetWidth;

    divSizing.removeChild(cloneControlTable);
    document.body.removeChild(divSizing);

    kawasu.microtable.log(prefix + "Exiting");
    return size;
}

kawasu.microtable.isKeyNumeric = function (sTableId, n) {
    var prefix = "kawasu.microtable.isKeyNumeric() - ";
    kawasu.microtable.log(prefix + "Entering");

    var bKeyIsNumeric = false;
    var bAllValuesAreNull = true;

    // Iterate the tables
    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;


    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        var row = table.rows[n];
        var textval = fc.utils.textContent(row.cells[1]);
        if (textval != null && textval != "") {
            var nValue = new Number(textval);
            if (isNaN(nValue)) {
                kawasu.microtable.log(prefix + "Exiting [NON NUMERIC VALUE]: returning FALSE");
                return false;
            }
            else {
                bAllValuesAreNull = false;
            }
        }
    }

    if (bAllValuesAreNull) {
        kawasu.microtable.log(prefix + "Exiting [ALL NULL]: returning FALSE");
        return false;
    }

    kawasu.microtable.log(prefix + "Exiting [SUCCESS]: returning TRUE");
    return true;
}

kawasu.microtable.getTableIdFromIndexCurrentRow = function (sTableId, indexCurrentRow) {
    var prefix = "kawasu.microtable.getTableIdFromIndexCurrentRow() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Return the id of the rowTable at the current index

    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();

    kawasu.microtable.log(prefix + "Exiting");
    return rawTablesChildren[indexCurrentRow].id;
}


kawasu.microtable.getDataIndexFromTable = function (table) {
    var prefix = "kawasu.microtable.getDataIndexFromTable() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Rows have id's that encode the index in the data array used to create them
    // Example ID: "myMicroTable_000005_tr_0000_000004"
    // Format:      sTableId_TableIndex_tr_RowIndex_DataIndex

    var row = table.rows[0];
    var arraySplit = (row.id).split("_");

    var dataIndex = parseInt(arraySplit[4], 10);

    kawasu.microtable.log(prefix + "Exiting");
    return dataIndex;
}

kawasu.microtable.getIndexByKeyName = function (sTableId, sKeyName) {
    var prefix = "kawasu.microtable.getIndexByKeyName() - ";
    kawasu.microtable.log(prefix + "Entering");

    // Return the Key-Value pair's row index number for a given key

    var rawTables = kawasu.microtable.getRawTables(sTableId);
    var rawTablesChildren = $(rawTables).children();
    var nodeListLength = rawTablesChildren.length;
    for (var i = 1; i < nodeListLength; ++i) {
        var table = rawTablesChildren[i];
        for (var j = 0; j < table.rows.length; ++j) {
            var cellKey = table.rows[j].cells[0];
            var textval = fc.utils.textContent(cellKey);
            if (textval == sKeyName) {
                return j;
            }
        }
    }

    kawasu.microtable.log(prefix + "Exiting");
    return -1;
}

//
////////////////////////////////////////////////////////////////////////////////