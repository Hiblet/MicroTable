///////////////////////////////////////////////////////////////////////////////
// STYLE DECLARATION
// Use double quotes in JavaScript


// To include files for VS to understand and query them, use this syntax..
///<reference path="../FCUtils.js" />
///<reference path="breakpoints.js" />

// Define the console if not already defined
if (!window.console) console = { log: function () { } };



///////////////////////////////////////////////////////////////////////////////
// Global Namespace for this application
//
var kawasu = kawasu || {};

if (fc.utils.isInvalidVar(kawasu.orders)) { kawasu.orders = new Object(); }

kawasu.orders.init = function () {
    var prefix = "kawasu.orders.init() - ";
    console.log(prefix + "Entering");

    kawasu.orders.hookupHandlers();


    // BUILD A STYLE OBJECT TO DEFINE THE TABLE STYLE
    var styleDefn = new Object();
    styleDefn["tableClass"] = "tableTestClass";
    styleDefn["tdClassKey"] = "tdTestClassKey";
    styleDefn["tdClassValue"] = "tdTestClassValue";
    styleDefn["thClass"] = "thTestClass";
    styleDefn["trClassHeader"] = "trTestClassHeader";
    styleDefn["trClassData"] = "trTestClassData";

    // To set widths...
    styleDefn["classCol1"] = "col1";

    // For controls
    styleDefn["buttonRowNavigate"] = "buttonRowNavigate";
    styleDefn["textboxRowNavigate"] = "textboxRowNavigate";
    styleDefn["checkboxSelect"] = "checkboxSelect";

    // BUILD A TEST DATA SET
    var arrData = kawasu.orders.createTestDataA();

    var divContainer = document.getElementById("divContainer");

    // Microtable testing
    var myMicroTable = kawasu.microtable.build(
        arrData,
        styleDefn,
        "myMicroTable",
        "Order: ",
        8,
        false,
        kawasu.microtable.config.STACK);
    //kawasu.microtable.config.VERTICAL);

    if (fc.utils.isValidVar(myMicroTable)) {
        divContainer.appendChild(myMicroTable);
    }



    // Update the buttons to show current state
    kawasu.orders.btnToggleExpandable_setBtnText();
    kawasu.orders.btnToggleMultiSingleExp_setBtnText();
    kawasu.orders.btnToggleSelect_setBtnText();

    
    // TEST A:
    // Add some data to arrData, and rebuild the tables
    // Give it a new field.
    var obj = new Object();
    obj["Contract"] = "Mutton";
    obj["Flock"] = "Mr. Hibbert's Flock";
    arrData.push(obj);

    var myMicroTableRebuilt = kawasu.microtable.rebuild("myMicroTable");

    // BUILD A 2ND TEST DATA SET
    var arrDataB = kawasu.orders.createTestDataB();
    var myMicroTableRebuiltAgain = kawasu.microtable.rebuild("myMicroTable", arrDataB);


    //$("#divContainer").remove(myMicroTable); // Drop tables from DOM
    //$("#divContainer").append(myMicroTableRebuilt);

    //divContainer.removeChild(myMicroTable);
    //while (divContainer.lastChild) { divContainer.removeChild(divContainer.lastChild); }
    //divContainer.appendChild(myMicroTableRebuilt);
    //
    // END TEST A:
    

    // TEST B: Test delete function
    // kawasu.microtable.itemDelete("myMicroTable", 1); // Delete 2nd row (index 1), "GADGET"
    // END TEST B

    console.log(prefix + "Exiting");
}

$(window).load(kawasu.orders.init);


kawasu.orders.createZeroTestData = function () {
    var prefix = "kawasu.orders.createZeroTestData() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    var obj1 = {
        "Contract": "",
        "Side": "",
        "Qty": "",
        "Price": "",
        "StopPrice": "",
        "Comment" : ""
    };


    array.push(obj1);

    return array;

    console.log(prefix + "Exiting");
}


kawasu.orders.createTestDataA = function () {
    var prefix = "kawasu.orders.createTestDataA() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    var obj1 = {
        "Contract": "WIDGET",
        "Side": "BUY",
        "Qty": "3",
        "Price": "98.3"
    };

    var obj2 = {
        "Contract": "GADGET",
        "Side": "SELL",
        "Comment":"This is a rare column, in that it is very long text and will probably wrap around somehow.",
        "Qty": "7",
        "Price": "101.32"
    };

    var obj3 = {
        "Contract": "BOBBIN",
        "Side": "SELL",
        "Qty": "32",
        "Price": "19.4",
        "StopPrice": "18.5"
    };

    array.push(obj1);
    array.push(obj2);
    array.push(obj3);

    return array;

    console.log(prefix + "Exiting");
}

kawasu.orders.createTestDataB = function () {
    var prefix = "kawasu.orders.createTestDataB() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    var obj1 = {
        "Contract": "BODGIT",
        "Side": "SELL",
        "Qty": "3",
        "Price": "98.3"
    };

    var obj2 = {
        "Contract": "NUBBIN",
        "Side": "SELL",
        "Comment": "No comment",
        "Qty": "7",
        "Price": "101.32"
    };

    var obj3 = {
        "Contract": "GUFFING",
        "Side": "BUY",
        "Qty": "32",
        "Price": "19.4",
        "StopPrice": "18.5"
    };

    var obj4 = {
        "Contract": "MIDDIN",
        "Side": "SELL",
        "Qty": "21",
        "Price": "19.3",
        "StopPrice": "9.34"
    };

    var obj5 = {
        "Contract": "BODDIN",
        "Side": "BUY",
        "Qty": "335",
        "Price": "87.4",
        "StopPrice": "34.1"
    };

    var obj6 = {
        "Contract": "TIFFIN",
        "Side": "SELL",
        "Qty": "236",
        "Price": "32.1",
        "StopPrice": "78.3"
    };

    array.push(obj1);
    array.push(obj2);
    array.push(obj3);
    array.push(obj4);
    array.push(obj5);
    array.push(obj6);

    return array;

    console.log(prefix + "Exiting");
}



kawasu.orders.createTestDataLargeRandom = function () {
    var prefix = "kawasu.orders.createTestDataLargeRandom() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    for (var j = 0; j < 10000; ++j) {
        var obj = new Object();
        for (var i = 0; i < 20; ++i) {
            var sProp = "Property" + (i.toString());
            obj[sProp] = i.toString();
        }
        array.push(obj);
    }

    return array;

    console.log(prefix + "Exiting");
}



///////////////////////////////////////////////////////////////////////////////
// HANDLERS
//

kawasu.orders.hookupHandlers = function () {
    
    var btnDeleteItem = document.getElementById("btnDeleteItem");
    fc.utils.addEvent(btnDeleteItem, "click", kawasu.orders.btnDeleteItem_onClick);

    var btnDeleteRequest = document.getElementById("btnDeleteRequest");
    fc.utils.addEvent(btnDeleteRequest, "click", kawasu.orders.btnDeleteRequest_onClick);

    var btnToggleView = document.getElementById("btnToggleView");
    fc.utils.addEvent(btnToggleView, "click", kawasu.orders.btnToggleView_onClick);

    var btnToggleSelect = document.getElementById("btnToggleSelect");
    fc.utils.addEvent(btnToggleSelect, "click", kawasu.orders.btnToggleSelect_onClick);

    var btnSelectAll = document.getElementById("btnSelectAll");
    fc.utils.addEvent(btnSelectAll, "click", kawasu.orders.btnSelectAll_onClick);

    var btnDeselectAll = document.getElementById("btnDeselectAll");
    fc.utils.addEvent(btnDeselectAll, "click", kawasu.orders.btnDeselectAll_onClick);

    var btnToggleExpandable = document.getElementById("btnToggleExpandable");
    fc.utils.addEvent(btnToggleExpandable, "click", kawasu.orders.btnToggleExpandable_onClick);

    var btnToggleMultiSingleExp = document.getElementById("btnToggleMultiSingleExp");
    fc.utils.addEvent(btnToggleMultiSingleExp, "click", kawasu.orders.btnToggleMultiSingleExp_onClick);
}

kawasu.orders.btnDeleteItem_onClick = function () {
    var prefix = "kawasu.orders.btnDeleteItem_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.microtable.deleteSelected("myMicroTable", true);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnDeleteRequest_onClick = function () {
    var prefix = "kawasu.orders.btnDeleteRequest_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.microtable.deleteRequest("myMicroTable", true);

    console.log(prefix + "Exiting");
}


kawasu.orders.btnToggleView_onClick = function () {
    var prefix = "kawasu.orders.btnToggleView_onClick() - ";
    console.log(prefix + "Entering");

    var nViewState = kawasu.microtable.viewState("myMicroTable");

    if (nViewState == kawasu.microtable.config.VERTICAL) {
        kawasu.microtable.viewState("myMicroTable", kawasu.microtable.config.STACK);
    }
    else {
        kawasu.microtable.viewState("myMicroTable", kawasu.microtable.config.VERTICAL);
    }

    console.log(prefix + "Exiting");
}

kawasu.orders.btnToggleSelect_onClick = function () {
    var prefix = "kawasu.orders.btnToggleSelect_onClick() - ";
    console.log(prefix + "Entering");

    var bState = kawasu.microtable.multiSelect("myMicroTable") ?
        kawasu.microtable.multiSelect("myMicroTable", false) :
        kawasu.microtable.multiSelect("myMicroTable", true);

    kawasu.orders.btnToggleSelect_setBtnText(bState);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnToggleSelect_setBtnText = function (bState) {
    // If state unknown, go get it...
    bState = (typeof bState === 'undefined') ?
        kawasu.microtable.multiSelect("myMicroTable") : bState;

    // Set the button text to reveal current state
    var btnToggleSelect = document.getElementById("btnToggleSelect");
    btnToggleSelect.value = "Toggle MultiSelect:" + (bState ? "T" : "F");
}


kawasu.orders.btnSelectAll_onClick = function () {
    var prefix = "kawasu.orders.btnSelectAll_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.microtable.setSelectAll("myMicroTable", true);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnDeselectAll_onClick = function () {
    var prefix = "kawasu.orders.btnDeselectAll_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.microtable.setSelectAll("myMicroTable", false);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnToggleExpandable_onClick = function () {
    var prefix = "kawasu.orders.btnToggleExpandable_onClick() - ";
    console.log(prefix + "Entering");

    var bState = kawasu.microtable.expandable("myMicroTable") ?
        kawasu.microtable.expandable("myMicroTable", false) :
        kawasu.microtable.expandable("myMicroTable", true);

    kawasu.orders.btnToggleExpandable_setBtnText(bState);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnToggleExpandable_setBtnText = function (bState) {
    // If state unknown, go get it...
    bState = (typeof bState === 'undefined') ?
        kawasu.microtable.expandable("myMicroTable") : bState;

    // Set the button text to reveal current state
    var btnToggleExpandable = document.getElementById("btnToggleExpandable");
    btnToggleExpandable.value = "Toggle Expandable:" + (bState ? "T" : "F");    
}

kawasu.orders.btnToggleMultiSingleExp_onClick = function () {
    var prefix = "kawasu.orders.btnToggleMultiSingleExp_onClick() - ";
    console.log(prefix + "Entering");

    var bState = kawasu.microtable.multiExpand("myMicroTable") ?
        kawasu.microtable.multiExpand("myMicroTable", false) :
        kawasu.microtable.multiExpand("myMicroTable", true);

    kawasu.orders.btnToggleMultiSingleExp_setBtnText(bState);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnToggleMultiSingleExp_setBtnText = function (bState) {
    // If state unknown, go get it...
    bState = (typeof bState === 'undefined') ?
        kawasu.microtable.multiExpand("myMicroTable") : bState;

    // Set the button text to reveal current state
    var btnToggleMultiSingleExp = document.getElementById("btnToggleMultiSingleExp");
    btnToggleMultiSingleExp.value = "Toggle Toggle Multi-Single Exp:" + (bState ? "T" : "F");
}
