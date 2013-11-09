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

    // BUILD A TEST DATA SET
    var arrData = kawasu.orders.createTestData();

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


    // Microtable testing
    var myMicroTable = kawasu.microtable.build(
        arrData,
        styleDefn,
        "myMicroTable",
        kawasu.microtable.config.STACK);

    //$("#divContainer").append(myMicroTable);

    console.log(prefix + "Exiting");
}

$(window).load(kawasu.orders.init);




kawasu.orders.createTestData = function () {
    var prefix = "kawasu.orders.createTestData() - ";
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

