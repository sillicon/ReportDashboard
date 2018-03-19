window.onload = function () {

    let tempStr = getTodayDate();
    if ($("#testDate")[0].type != "date") {
        $("#testDate").datepicker();
        $("#chooseDay").datepicker("option", "maxDate", new Date());
    } else {
        document.querySelector("#testDate").max = tempStr;
    }
    document.querySelector("#testDate").value = tempStr;
    var envir1Sel = document.getElementById("envir1");
    var browSel = document.getElementById("browser");
    // var testName = document.getElementById("testName");
    var tempEnvir = ["Envir1", "Envir2", "Envir3"];
    for (var i = 0; i < tempEnvir.length; i++) {
        envir1Sel.options[i] = new Option(tempEnvir[i], tempEnvir[i]);
    }
    var tempBrowser = ["Firefox", "Chrome", "IE 11", "Safari-Desktop", "Safari-iOS", "IE 10", "IE 9", "IE 8", "Other"];
    for (var i = 0; i < tempBrowser.length; i++) {
        browSel.options[i] = new Option(tempBrowser[i], tempBrowser[i]);
    }

    //bind event linsteners
    document.querySelector("#envir1").addEventListener("change", function () {
        onSelectChange();
    });
    document.querySelectorAll("#sourceUpload,#testDate").forEach(function (ele) {
        ele.addEventListener("change", function () {
            validateButton();
        });
    });
    document.querySelector("#submitBut").addEventListener("click", function () {
        submitForm();
    });
    document.querySelector("#back").addEventListener("click", function () {
        location.href = "home.html";
    });

    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var testList = JSON.parse(this.responseText);
            var testCate = document.createElement("select");
            testCate.id = "testName";
            var td = document.querySelector("#holderbox > table > tbody > tr:nth-child(4) > td:nth-child(2)");
            td.appendChild(testCate);
            var collectTest = [];
            for (var i = 0; i < testList.length; i++) {
                if (testList[i].child != null) {
                    var optGroup = document.createElement("optgroup");
                    optGroup.label = testList[i].testName;
                    testCate.appendChild(optGroup);
                    var tempObj = [testList[i]];
                    var arr = [0];
                    while (tempObj.length > 0) {
                        if (arr[arr.length - 1] <= tempObj[tempObj.length - 1].child.length - 1) {
                            var tempStr = "\xa0\xa0";
                            for (var j = 0; j < arr.length; j++) {
                                tempStr += tempStr;
                            }
                            var option = document.createElement("option");
                            option.text = tempStr + tempObj[tempObj.length - 1].child[arr[arr.length - 1]].testName;
                            option.value = tempObj[tempObj.length - 1].child[arr[arr.length - 1]].id;
                            if (tempObj[tempObj.length - 1].child[arr[arr.length - 1]].child != null) {
                                option.disabled = true;
                                optGroup.appendChild(option);
                                tempObj.push(tempObj[tempObj.length - 1].child[arr[arr.length - 1]]);
                                arr.push(0);
                            } else {
                                optGroup.appendChild(option);
                                arr[arr.length - 1]++;
                            }
                        } else {
                            arr.pop();
                            tempObj.pop();
                            arr[arr.length - 1]++;
                        }
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = testList[i].testName;
                    option.value = testList[i]._id;
                    testCate.appendChild(option);
                }
            }
        } else if (this.readyState == 4) {
            document.querySelector("#holderbox").innerHTML = this.responseText;
        }
    };
    xmlHTTP.open("GET", "./getTestName");
    xmlHTTP.send();

    onSelectChange();

    function onSelectChange() {
        var envir1Sel = document.getElementById("envir1"),
            envir2Sel = document.getElementById("envir2");
        var tempHive = 2;
        envir2Sel.length = 0;
        if (envir1Sel.selectedIndex == 2) {
            tempHive = 8;
        };
        for (var i = 0; i < tempHive; i++) {
            envir2Sel.options[i] = new Option("hive " + i, "hive" + i);
        }
    }

    function validateButton() {
        var fileInput = document.getElementById('sourceUpload');
        var dateValue = document.getElementById('testDate');
        var subButton = document.getElementById('submitBut');
        if (fileInput.files.length > 0 && feasibleDateRange(dateValue.value)) {
            subButton.className = subButton.className.replace(/(?:^|\s)buttonDisabled(?!\S)/g, '');
        } else if (subButton.className.indexOf("buttonDisabled") < 0) {
            subButton.className += " buttonDisabled";
        }
    }

    function submitForm() {
        var reportHTML = "";
        var fileInput = document.getElementById('sourceUpload');
        var file = fileInput.files[0];
        var reader = new FileReader();
        var resultDiv = document.getElementById("resultInfo");
        resultDiv.innerHTML = "<div id =\"loader\" class=\"loader\"></div>";
        resultDiv.style.display = 'block';
        reader.onload = function (e) {
            reportHTML = reader.result;
            var requestJSON = {
                reportDate: document.getElementById("testDate").value,
                reportEnvi: document.getElementById("envir1").value,
                reportHive: document.getElementById("envir2").value,
                reportBrowser: document.getElementById("browser").value,
                testID: document.getElementById("testName").value,
                reportName: document.getElementById("testName").options[document.getElementById("testName").selectedIndex].text.replace(/\s+/g, ""),
                reportHTML: reportHTML
            }
            if (document.getElementById("switchCheckbox").checked) {
                requestJSON.reportResult = "Pass";
            } else {
                requestJSON.reportResult = "Fail";
            }
            var xmlHTTP = new XMLHttpRequest();
            xmlHTTP.open("POST", "./uploadReport");
            xmlHTTP.setRequestHeader("Content-Type", "application/json");
            xmlHTTP.send(JSON.stringify(requestJSON));
            xmlHTTP.onreadystatechange = function () {
                if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                    resultDiv.innerHTML = this.responseText;
                }
            }
        }
        reader.readAsText(file);
    }

    function feasibleDateRange(inputDate) {
        if (inputDate == "") {
            return false;
        }
        var temp1 = new Date(inputDate);
        if (temp1 > new Date("01/01/2015") && temp1 <= new Date()) {
            return true;
        }
        return false
    }
}