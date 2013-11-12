﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">

    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script> 
    <script type="text/javascript" src="<%= ResolveClientUrl("~/js/FCUtils.js") %>"></script>
    <script type="text/javascript" src="<%= ResolveClientUrl("~/js/MicroTable.js") %>"></script>
    <script type="text/javascript" src="<%= ResolveClientUrl("~/js/Default.js") %>"></script>

    <link rel="Stylesheet" type="text/css" href="<%= ResolveClientUrl("~/Default.css") %>" />    

    <title>MicroTable Experiment</title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    
        <input type="button" id="btnDeleteItem" value="Delete Item" />
        <input type="button" id="btnToggleView" value="Toggle View" />

        <br />
        <br />

        <div id="divContainer">
        </div>


    </div>
    </form>
</body>
</html>
