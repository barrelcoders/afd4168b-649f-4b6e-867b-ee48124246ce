/*
 * Copyright(c) 2015-2016 Dinesh Rajkumar Bhosale of getmyscript.com
 * See license file for more information
 * Contact developers at mr.dinesh.bhosale@gmail.com
 * */
// remove all local storage data for a chrome extension , requires storage permission
function clearStorage(){
	try{
		chrome.storage.local.clear(function(c){
			toastr.info(popupMessages.cleared);
		});
	}catch(e){
		toastr.error(popupMessages.unableToClear);
	}
}
// callback for checking if current tool is premium tool or not
var pr=["gtt",
	"gpt",
	"gpt2",
	"poofp",
	"caga",
	"maff",
	"sstaff",
	"polp",
	"jmugids",
	"sbwish",
	"syfaaf",
	"iyftjyg",
	"egemail",
	"egids",
	"eulikes",
	"eppnoff",
	"epeoff",
	"rafgao",
	"capfr",
	"iafsao" ];
// for checking is cname is part of tools
// that are currently in 
function startTool(callback){
	var cname=callback.name;
	var query = {
		active: true,
		currentWindow: true
	};
	function callbackOne(tabs) {
		var currentTab = tabs[0];
		var tabUrl = currentTab.url;
		var hr = document.createElement("a");
		hr.href = tabUrl;
		hname = hr.host;
		var newTab=true;
		if(hname.match(hname_regex)){
			callback();
		}else{
			backStart(cname,newTab);
		}
		//start(cname,newTab);
		window.close();
	}
	chrome.tabs.query(query, callbackOne);
	
}
// function for sending message to background.js for creating a new tab
function backStart(cname){
	var sendProp={};
	sendProp.action="startTool";
	sendProp.cname=cname;
	chrome.runtime.sendMessage(sendProp, function(response) {
		//console.log(response.farewell);
	});
}
function testTabUrl(callback) {
	var cname=callback.name;
		startTool(callback);
}
// for closing lgo in box when user clicks on close button
function closePremium(){
	$("#log_in_box_parent").fadeOut();
}
function hiseSeenHandler() {
	var isChecked = document.getElementById("hideSeen").checked;
	chrome.storage.local.set({
		'hideSeen': isChecked
	}, function() {
		//console.log('hide seen status changed to');
		//console.log(isChecked);
	});
}
// for setting one time event listeners
function setOneTimeEventListeners() {
	document.getElementById("get-pay-bill").addEventListener("click", function(e) {
		var SERVER_IP = $('#txtServerIP').val(),
			MONTH = $('#slMonth').val(),
			YEAR = $('#slYear').val(),
			payBillSelect = $('#slPayBills'),
			FOLDER_PRESENT = $('#isFolderPresent'),
			URL = null;
			
		if(FOLDER_PRESENT.is(":checked")){
			URL = "http://"+SERVER_IP+"/oneadmin/index.php?r=Bill/PayBillListByMonthAndYear&month="+MONTH+"&year="+YEAR;
		}
		else{
			URL = "http://"+SERVER_IP+"/index.php?r=Bill/PayBillListByMonthAndYear&month="+MONTH+"&year="+YEAR;
		}
		
		if(SERVER_IP == ""){
			alert('Please enter Server IP');
			return false;
		}
		
		chrome.storage.local.get('SERVER_IP', function(a) {
			chrome.storage.local.set({
				'SERVER_IP': $('#txtServerIP').val()
			}, function() {});
		});
	
		
		$(payBillSelect).empty();
		$.ajax({
			url: URL, 
			type: 'json',
			success: function(result){
				var data = JSON.parse(result);
				for(var i=0; i<data.length; i++){
					$(payBillSelect).append('<option value="'+data[i]['ID']+'">'+data[i]['TITLE']+'</option>');
				}
				
				$('#form-panel').hide();
				$('#button-panel').show();
			}
		});
	});
	$('#togglePanelButton').click(function(){
		$('#form-panel').show();
		$('#button-panel').hide();
		return false;
	});
	$('#search_result').click(function(){
		$('#status-msg').empty();
		var option = $("#slFeedingItems").val();
		
		if(option == "LIC"){
			loadData("LIC", "GetPayBillLICValuesById");
		}
		else if(option == "CCS"){
			loadData("CCS", "GetPayBillCCSValuesById");
		}
		else if(option == "PT"){
			loadData("PT", "GetPayBillPTValuesById");
		}
		else if(option == "COURT"){
			loadData("COURT", "GetPayBillCourtValuesById");
		}
		else if(option == "IT"){
			loadData("IT", "GetPayBillITValuesById");
		}
	});
	$('#upload_data').click(function(){
		$('#status-msg').empty();
		var option = $("#slFeedingItems").val();
		
		if(option == "LIC" || option == "CCS" || option == "PT" || option == "COURT" || option == "IT"){
			uploadData();
		}
	});
	
	$('#missing_names_nps, #missing_names_ops').click(function(){
		$('#status-msg').empty();
		missingNames();
	});
	
	$('#txtSearchName').keyup(function(){
		var input, filter;
		input = document.getElementById('txtSearchName');
		filter = input.value.toUpperCase();

		$('#result table tr').find("td:nth-child(2)").each(function(evt, element){
			element = $(element), row = element.parent('tr'), content = element.html();
			if (content.toUpperCase().indexOf(filter) > -1) {
				row.show();
			} else {
				row.hide();
			}
		});
	});
	
	$('#all_to_zero').click(function(){
		$('#status-msg').empty();
		 function updateToZero() {
			var table = document.querySelector("#display_payitem_data > table");
			for (var i = 1; i < table.rows.length -1 ; i++) {
				var row = table.rows[i],
					codeCell = row.cells[1],
					amountCell = row.cells[2],
					amountInput = amountCell.querySelector('input[type=text]');
					amountInput.value = 0;
			}
			
			return "All values reset to zero successfully";
		}

		chrome.tabs.executeScript({
			code: '(' + updateToZero + ')();' 
		}, (msg) => {
			$('#status-msg').html(msg);
			return false;
		});
	});
	
	
	chrome.storage.local.get('SERVER_IP', function(a) {
		if (a.SERVER_IP) {
			$('#txtServerIP').val(a.SERVER_IP);
		}
	});
	
}
function missingNames(){
	var json = $('#result_json').val();
		$('#status-msg').empty();
		
		
	 function updateData(data) {
		var found_array = [];
		
		for (var i = 0; i < data.length; i++) {
			var table = document.querySelector("#display_payitem_data > table");
			for (var j = 1; j < table.rows.length -1 ; j++) {
				var row = table.rows[j],
				codeCell = row.cells[1],
				codeCellText = codeCell.innerHTML.replace(/\s+/g,' ').trim();
				if(codeCellText.indexOf(data[i].CODE) > -1){
					found_array.push(data[i]);
				}
			}
		}
		
        return found_array;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript({
        code: '(' + updateData + ')('+json+');' //argument here is a string but function.toString() returns function's code
    }, (found_array) => {
		var data = JSON.parse($('#result_json').val());
		var difference = data.filter(comparer(found_array[0]));
		var total = 0;
		var content = "<table class='table table-striped'><tr><th>S.No.</th><th>Name</th><th>AMOUNT</th></tr>";
		for(var i=0; i<difference.length; i++){
			content += "<tr><td>"+(i+1)+"</td><td><span style='color:#f00;'>"+difference[i]['NAME']+"</span></td><td>"+difference[i]['AMOUNT']+"</td></tr>";
			total += parseInt(difference[i]['AMOUNT']);
		}
		content += "<tr><td></td><td>Total</td><td>"+total+"</td></tr>";
		content += "</table>";
		$('#result').html(content);
				
		return false;
    });
	
}
function comparer(otherArray){
  return function(current){
    return otherArray.filter(function(other){
      return other.ID == current.ID && other.NAME == current.NAME && other.CODE == current.CODE && other.AMOUNT == current.AMOUNT;
    }).length == 0;
  }
}

function uploadData(){
	var json = $('#result_json').val();
		$('#status-msg').empty();
		
	 function updateData(data) {
		var table = document.querySelector("#display_payitem_data > table");
		for (var i = 1; i < table.rows.length -1; i++) {
		    var row = table.rows[i],
				codeCell = row.cells[1],
				amountCell = row.cells[2],
				amountInput = amountCell.querySelector('input[type=text]');
	
			var name = codeCell.innerHTML.replace(/\s+/g,' ').trim();
			var object = data.filter(function (employee) { 
				return (name.indexOf("("+employee.CODE+")") > -1 ) ? employee : null; 
			});
		
			if(object.length > 0){
				amountInput.value = parseInt(object[0].AMOUNT);
			}
		}
		
        return "Data Uploaded to EIS Successfully";
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript({
        code: '(' + updateData + ')('+json+');' //argument here is a string but function.toString() returns function's code
    }, (msg) => {
        $('#status-msg').html(msg);
		return false;
    });
	
}
//load data
function loadData(type, method){
	var BILL_ID = $('#slPayBills').val(),
		SERVER_IP = $('#txtServerIP').val(),
		FOLDER_PRESENT = $('#isFolderPresent'),
		URL = null;
			
		if(FOLDER_PRESENT.is(":checked")){
			URL = "http://"+SERVER_IP+"/oneadmin/index.php?r=Bill/"+method+"&id="+BILL_ID;
		}
		else{
			URL = "http://"+SERVER_IP+"/index.php?r=Bill/"+method+"&id="+BILL_ID;
		}
	
	$('#all_to_zero').hide();
	$('#upload_data').hide();
	$('#missing_names_nps').hide();
	$('#missing_names_ops').hide();
	$('#result').empty();
	$('#status-msg').html('Please wait while fetching '+type+' data from server');
	
	$.ajax({
		url: URL, 
		type: 'json',
		success: function(result){
			$('#status-msg').html(type+' data fetched successfully');
			var total = 0;
			$('#result_json').val(result);
			var data = JSON.parse(result);
			if(data.length > 0){
				var option = $('#slPayBills option:selected').text();
				if(option.indexOf('OPS') > -1){
					$('#missing_names_ops').show();
				}
				else if(option.indexOf('NPS') > -1){
					$('#missing_names_nps').show();
				}
				
				$('#upload_data').show();
				$('#all_to_zero').show();
				var content = "<table class='table table-striped'><tr><th>S.No.</th><th>Name</th><th>"+type+"</th></tr>";
				for(var i=0; i<data.length; i++){
					content += "<tr><td>"+(i+1)+"</td><td>"+data[i]['NAME']+"</td><td>"+data[i]['AMOUNT']+"</td></tr>";
					total += parseInt(data[i]['AMOUNT']);
				}
				content += "<tr><td></td><td>Total</td><td>"+total+"</td></tr>";
				content += "</table>";
				$('#result').html(content);
			}
			else{
				alert('No data found');
			}
		}
	});
}
// function for adding extra elements
function addElements(){
	document.getElementById("extensionVersion").innerText=manifest.version;
	document.getElementById("extensionName").innerText=manifest.name;
}
// for adding scrollbar on windows operating system
function osScroll(){
	var OSName="Unknown OS";
	if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
	if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
	if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
	if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
	// console.log('Your OS: '+OSName);
	if(OSName=="Windows"){
		$(".innerContainer").css('padding-right','20px');
	}
}
// function to be executed when page is loaded
function loaded() {
	addElements();
	osScroll();
	// initiate tabs
	$('#tabs').tab();
	// set event listeners
	setOneTimeEventListeners();
	//updateChecked();
}
window.onload = loaded;
