function backtoMain() {
    location.href = "home.html";
}

function onFormLoad() {
    formDiv = document.getElementById("holderbox");
    onDateRadio = document.getElementById("onDate");
    testDate = document.getElementById("testDate");
    dateRangeRadio = document.getElementById("dateRange");
    dateRange1 = document.getElementById("dateRange1");
    dateRange2 = document.getElementById("dateRange2");
    withinDaysRaio = document.getElementById("onDays");
    withinDays = document.getElementById("withinDays");
    fileInput = document.getElementById("sourceUpload");
    dateValue = document.getElementById("testDate");
    subButton = document.getElementById("submitBut");
    cateCheck = document.getElementById("categoryCheck");
    cateSel = document.getElementById("caterogyList");
    envir1Chb = document.getElementById("envir1Chb");
    envir2Chb = document.getElementById("envir2Chb");
    envir3Chb = document.getElementById("envir3Chb");
    chartDiv = document.getElementById("charts");
    resultDiv = document.getElementById("reportList");

    //detect browsers
    // Opera 8.0+
    isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    isFirefox = typeof InstallTrigger !== 'undefined';
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
    })(!window['safari'] || safari.pushNotification);
    // Internet Explorer 6-11
    isIE = /*@cc_on!@*/ false || !!document.documentMode;
    // Edge 20+
    isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    isBlink = (isChrome || isOpera) && !!window.CSS;

    var tempDays = ["Last 3 days", "Last 5 days", "Last 7 days", "Last 2 weeks", "All Records"];
    var tempArray = [3, 5, 7, 14, -1];
    for (var i = 0; i < tempDays.length; i++) {
        withinDays.options[i] = new Option(tempDays[i], tempArray[i]);
    }
    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var testList = JSON.parse(this.responseText);
            for (var i = 0; i < testList.length; i++) {
                if (testList[i].child != null) {
                    var optGroup = document.createElement("optgroup");
                    optGroup.label = testList[i].testName;
                    cateSel.appendChild(optGroup);
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
                    option.value = testList[i].id;
                    cateSel.appendChild(option);
                }
            }

        }
    };
    xmlHTTP.open("GET", "./getTestName");
    xmlHTTP.send();

    if (window.location.href.indexOf("?") > -1) {
        //get UI set up for the URL parameters
        var queryObj = getParamsToArray(window.location.href);
        if (queryObj.requestType == "Date") {
            onDateRadio.checked = true;
            onDayChange();
            testDate.value = queryObj.reportDate;
        } else if (queryObj.requestType == "Range") {
            if (queryObj.startDate != "null") {
                dateRangeRadio.checked = true;
                onDayChange();
                dateRange1.valueAsDate = new Date(queryObj.startDate);
                dateRange2.valueAsDate = new Date(queryObj.endDate);
            } else {
                withinDaysRaio.checked = true;
                onDayChange();
                withinDays.selectedIndex = withinDays.childElementCount - 1;
            }
        }
        if (queryObj.reportEnvir1 == "true") {
            envir1Chb.checked = true;
        }
        if (queryObj.reportEnvir2 == "true") {
            envir2Chb.checked = true;
        }
        if (queryObj.reportEnvir3 == "true") {
            envir3Chb.checked = true;
        }
        handleXHR(queryObj);
    }

    onCateChange();
    onDayChange();
    if ($('#testDate')[0].type != 'date') {
        $('#testDate').datepicker();
        $('#dateRange1').datepicker();
        $('#dateRange2').datepicker();
    }
    document.querySelector("body").addEventListener("click", function (e) {
        if (e.target.tagName != "rect") {
            document.querySelector("#testListTip").style.display = "none";
        }
    });
}

function requestReport() {
    var requestJSON = {
            reportEnvir1: envir1Chb.checked,
            reportEnvir2: envir2Chb.checked,
            reportEnvir3: envir3Chb.checked
        },
        tempDate;
    if (onDateRadio.checked) {
        requestJSON.requestType = "Date";
        requestJSON.reportDate = testDate.value;
    } else {
        requestJSON.requestType = "Range";
        if (dateRange.checked) {
            requestJSON.startDate = dateRange1.value;
            requestJSON.endDate = dateRange2.value;
        } else {
            if (withinDays.value > 0) {
                tempDate = new Date();
                tempDate.setDate(tempDate.getDate() - withinDays.value);
                requestJSON.startDate = tempDate.getMonth() + 1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear();
            } else {
                requestJSON.startDate = null;
            }
            tempDate = new Date();
            requestJSON.endDate = tempDate.getMonth() + 1 + "/" + tempDate.getDate() + "/" + tempDate.getFullYear();
        }
    }
    if (cateCheck.checked) {
        requestJSON.reportCategory = cateSel.value;
    }
    handleXHR(requestJSON);
    history.pushState(null, null, formatParams(requestJSON));
}

function handleXHR(requestParams) {
    var backButton = document.createElement("button");
    backButton.textContent = "Back";
    backButton.id = "backToForm";
    backButton.addEventListener("click", function () {
        if (formDiv.style.display === "none") {
            var bButton = document.getElementById("backToForm");
            var charts = document.getElementById("charts");
            bButton.outerHTML = "";
            waitLoad(formDiv);
            waitHide(resultDiv);
            window.setTimeout(function () {
                charts.innerHTML = "";
                document.getElementById("tooltip").style.opacity = 0;
            }, 400);
            if (requestParams.reportCategory != undefined) {
                for (var i = 0; i < cateSel.childElementCount; i++) {
                    if (requestParams.reportCategory == cateSel.options[i].value) {
                        cateSel.selectedIndex = i;
                        cateCheck.checked = true;
                        onCateChange();
                        i = cateSel.childElementCount;
                    } else if (i == cateSel.childElementCount - 1) {
                        cateCheck.checked = false;
                        onCateChange();
                    }
                }
            }
        }
    });
    formDiv.parentNode.insertBefore(backButton, formDiv.nextSibling);
    backButton.className = "navigation";

    waitHide(formDiv);
    waitLoad(resultDiv);
    resultDiv.innerHTML = "<div id =\"loader\" class=\"loader\"></div>";
    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var responseObj = JSON.parse(this.responseText);
            var resultEnvir = 0;
            var envirName = [{
                name: "Envir1"
            }, {
                name: "Envir2"
            }, {
                name: "Envir3"
            }];
            for (var i = 0; i < responseObj.length; i++) {
                if (responseObj[i].length > 0) {
                    resultEnvir += 1;
                    createCharts(responseObj[i], envirName[i].name);
                }
            }
            if (resultEnvir === 0) {
                resultDiv.style.textAlign = "Center";
                resultDiv.innerHTML = "<font size = '10px'>No Records Found!</font>";
            } else {
                if (resultEnvir === 1) {
                    resultDiv.style.width = "40%";
                } else if (resultEnvir === 2) {
                    resultDiv.style.width = "60%";
                    resultDiv.style.minWidth = "400px";
                } else if (resultEnvir === 3) {
                    resultDiv.style.width = "90%";
                    resultDiv.style.minWidth = "550px";
                }
                var tableHTML = "<table style= \"width: 100%; margin: auto\" class = \"masterTable\"><tr>";
                for (var i = 0; i < responseObj.length; i++) {
                    if (responseObj[i].length > 0) {
                        tableHTML += "<th>" + responseObj[i][0].envirTested + "</th>";
                    }
                }
                tableHTML += "</tr><tr>";
                for (var i = 0; i < responseObj.length; i++) {
                    if (responseObj[i].length > 0) {
                        tableHTML += "<td>" + createTable(responseObj[i]) + "</td>";
                    }
                }
                tableHTML += "</tr></table>";
                resultDiv.innerHTML = tableHTML;
            }
            resultDiv.style.display = 'block';
        }
    };
    xmlHTTP.open("GET", "./queryReports" + formatParams(requestParams));
    xmlHTTP.send();
}

function validateButton() {
    if ((envir1Chb.checked || envir2Chb.checked || envir3Chb.checked) &&
        ((onDateRadio.checked && testDate.value !== "") ||
            (dateRangeRadio.checked && validateDate(dateRange1.value) && validateDate(dateRange2.value)) ||
            withinDaysRaio.checked)) {
        subButton.className = subButton.className.replace(/(?:^|\s)buttonDisabled(?!\S)/g, '');
    } else if (subButton.className.indexOf("buttonDisabled") < 0) {
        subButton.className += " buttonDisabled";
    }
}

function validateDate(inputString) {
    var tempDate = new Date(inputString);
    return !isNaN(tempDate);
}

function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + params[key]
        })
        .join("&")
}

function getParamsToArray(string) {
    var returnObj = {};
    var tempString = string.split("?")[1].split("&");
    for (var i = 0; i < tempString.length; i++) {
        var name = tempString[i].split("=")[0];
        returnObj[name] = decodeURI(tempString[i].split("=")[1]);
    }
    return returnObj;
}

function createCharts(inputArray, envir) {
    d3.select("#charts").append("span").html("<b>" + envir + "</b>");

    var category = [],
        cateArray = [],
        fullArray = [],
        passfileArray = [],
        failfileArray = [],
        passRatio = 0,
        passCount = 0,
        failCount = 0;

    for (var i = 0; i < inputArray.length; i++) {
        if (inputArray[i].testResult === "Pass") {
            passCount = passCount + 1;
            passfileArray.push(inputArray[i].fileName);
        } else {
            failCount = failCount + 1;
            failfileArray.push(inputArray[i].fileName);
        }
        if (i < inputArray.length - 1) {
            if (inputArray[i].testID !== inputArray[i + 1].testID) {
                passRatio = passCount / (passCount + failCount);
                cateArray.push({
                    date: inputArray[i].testDate,
                    ratio: passRatio,
                    counts: passCount + failCount,
                    testName: inputArray[i].testName,
                    passFiles: passfileArray,
                    failFiles: failfileArray
                });
                passfileArray = [];
                failfileArray = [];
                passCount = 0;
                failCount = 0;
                fullArray.push(cateArray);
                category.push(inputArray[i].testName);
                cateArray = [];
            } else if (inputArray[i].testDate != inputArray[i + 1].testDate) {
                passRatio = passCount / (passCount + failCount);
                cateArray.push({
                    date: inputArray[i].testDate,
                    ratio: passRatio,
                    counts: passCount + failCount,
                    testName: inputArray[i].testName,
                    passFiles: passfileArray,
                    failFiles: failfileArray
                });
                passfileArray = [];
                failfileArray = [];
                passCount = 0;
                failCount = 0;
            }
        } else {
            passRatio = passCount / (passCount + failCount);
            cateArray.push({
                date: inputArray[i].testDate,
                ratio: passRatio,
                counts: passCount + failCount,
                testName: inputArray[i].testName,
                passFiles: passfileArray,
                failFiles: failfileArray
            });
            passfileArray = [];
            failfileArray = [];
            passCount = 0;
            failCount = 0;
            fullArray.push(cateArray);
            category.push(inputArray[i].testName);
            cateArray = [];
        }
    }

    var minDate = new Date(Date.parse(d3.min(fullArray, function (d) {
            return d3.extent(d, function (p) {
                return toUTCDate(new Date(p.date))
            })[0]
        }))),
        maxDate = new Date(Date.parse(d3.max(fullArray, function (d) {
            return d3.extent(d, function (p) {
                return toUTCDate(new Date(p.date))
            })[1]
        }))),
        dateRange = Math.round((maxDate - minDate) / 1000 / 3600 / 24);

    var margin = {
            top: 20,
            right: 20,
            bottom: 40,
            left: 100
        },
        svgWidth = 960,
        svgHeight = Math.max(250, category.length * 60),
        width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom,
        barHeight = 40;
    var svg = d3.select("#charts").append("svg")
        .attr("id", envir)
        .attr("style", "width: " + svgWidth + "px\; height: " + svgHeight + "px\;");
    var x = d3.scaleUtc().range([0, width])
        .domain([minDate, calculateDays(maxDate, 1)]);
    var y = d3.scaleBand()
        .range([height, 0])
        .padding(0.1)
        .domain(category);
    var xAxis = d3.axisBottom(x);
    xAxis.tickValues(createTickValues(minDate, calculateDays(maxDate, 1), Math.round(Math.max(80 * dateRange / svgWidth, 1)))).tickFormat(d3.utcFormat("%m-%d"));

    var yAxis = d3.axisLeft(y);
    var zoom = d3.zoom()
        .scaleExtent([1, Math.round(80 * dateRange / svgWidth)])
        .translateExtent([
            [0, 0],
            [width, height]
        ])
        .extent([
            [0, 0],
            [width, height]
        ])
        .on("zoom", zoomed);

    var drawArea = svg.append("g").attr("id", "bars");
    var passBar = drawArea.selectAll(".passBar");
    var failBar = drawArea.selectAll(".failBar");
    for (var i = 0; i < fullArray.length; i++) {
        createRect(passBar, fullArray[i], "pass");
        createRect(failBar, fullArray[i], "fail");
    }
    passBar = drawArea.selectAll(".passBar");
    failBar = drawArea.selectAll(".failBar");
    drawBar(passBar, x, "pass");
    drawBar(failBar, x, "fail");
    bindMouseEvent(passBar, "pass");
    bindMouseEvent(failBar, "fail");

    d3.selectAll("rect").filter(function (d, i, n) {
        if (parseFloat(n[i].getAttribute("width")) === 0) {
            return d;
        }
    }).remove();

    //add grid lines
    var gridX = d3.axisTop(x);
    gridX.ticks(d3.utcDay.every(Math.round(Math.max(80 * dateRange / svgWidth, 1))))
        .tickSize(-height)
        .tickFormat("");
    var gridLine = svg.append("g")
        .attr("transform", "translate(" + margin.left + ", 0)")
        .attr("class", "gridLine");
    gridLine.call(gridX);

    // always draw axis at last
    var xLine = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + height + ")")
        .attr("class", "xAxis");
    xLine.call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle");
    var yLine = svg.append("g")
        .attr("transform", "translate(" + margin.left + ", 0)")
        .attr("class", "yAxis");
    yLine.call(yAxis)
        .selectAll("text")
        .attr("class", "cateName")
        .style("text-anchor", "start")
        .call(wrapText, margin.left - 12);

    svg.on("click", function () {
        if (d3.event.target.tagName != "rect") {
            var div = d3.select(".testListTip");
            var clickedRect = svg.select(".clicked");
            if (clickedRect.empty() === false) {
                clickedRect.attr("class", clickedRect.attr("class").split(" ")[0]).style("fill", "");
            }
            div.style("display", "none");
        }
    });

    svg.call(zoom);

    fixScroll($('#' + envir));

    function createRect(svgGroup, dateArray, result) {
        svgGroup.data(dateArray)
            .enter().append("rect")
            .attr("class", function () {
                if (result === "pass") {
                    return "passBar";
                } else {
                    return "failBar";
                }
            })
    }

    function drawBar(svgGroup, xScale, result) {
        svgGroup.attr("width", function (d) {
                if (result === "pass") {
                    return xScale(calculateDays(toUTCDate(d.date), d.ratio)) - xScale(toUTCDate(d.date));
                } else {
                    return xScale(calculateDays(toUTCDate(d.date), 1 - d.ratio)) - xScale(toUTCDate(d.date));
                }
            })
            .attr("transform", function (d) {
                if (result === "pass") {
                    return "translate(" + (margin.left + xScale(toUTCDate(d.date))) + ", 0)";
                } else {
                    return "translate(" + (margin.left + xScale(calculateDays(toUTCDate(d.date), d.ratio))) + ", 0)";
                }
            })
            .attr("height", barHeight)
            .attr("y", function (d) {
                return y(d.testName) + (y.bandwidth() - barHeight) / 2;
            })
    }

    function bindMouseEvent(svgGroup, result) {
        svgGroup.on("mouseover", function (d) {
                var rectBox = this;
                var div = d3.select(".tooltip");
                div.transition()
                    .duration(300)
                    .style("opacity", .9);
                div.html(function () {
                        var testCount, tempStr1, tempStr2
                        if (result === "pass") {
                            testCount = Math.round(d.ratio * d.counts);
                            tempStr1 = " passed";
                        } else {
                            testCount = Math.round((1 - d.ratio) * d.counts);
                            tempStr1 = " failed";
                        }
                        if (testCount > 1) {
                            tempStr2 = " tests";
                        } else {
                            tempStr2 = " test";
                        }
                        return "<span>" + testCount + tempStr2 + tempStr1 + "</span><br>";
                    })
                    .style("left", function () {
                        var rectLeft = rectBox.getBoundingClientRect().left,
                            rectWidth = rectBox.getBoundingClientRect().width,
                            tipWidth = this.getBoundingClientRect().width,
                            scrollWidth;
                        if (isSafari || isEdge) {
                            scrollWidth = document.getElementsByTagName("body")[0].scrollLeft;
                        } else if (isChrome || isFirefox || isIE) {
                            scrollWidth = document.getElementsByTagName("html")[0].scrollLeft;
                        }
                        return ((rectLeft + rectWidth / 2 - tipWidth / 2 + scrollWidth) + "px");
                    })
                    .style("top", function () {
                        var rectTop = rectBox.getBoundingClientRect().top,
                            tipHeight = this.getBoundingClientRect().height,
                            scrollHeight;
                        if (isSafari || isEdge) {
                            scrollHeight = document.getElementsByTagName("body")[0].scrollTop;
                        } else if (isChrome || isFirefox || isIE) {
                            scrollHeight = document.getElementsByTagName("html")[0].scrollTop;
                        }
                        return ((scrollHeight + rectTop - tipHeight - 10) + "px");
                    });
            })
            .on("mouseout", function () {
                var div = d3.select(".tooltip");
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .on("click", function (d) {
                var rect = d3.select(this),
                    rectBox = this;
                var div = d3.select(".testListTip");
                if (rect.attr("class").indexOf("clicked") > -1) {
                    rect.attr("class", rect.attr("class").split(" ")[0]);
                    rect.attr("style", "");
                    div.style("display", "none");
                } else {
                    var clickedRect = svg.select(".clicked");
                    if (clickedRect.empty() === false) {
                        clickedRect.attr("class", clickedRect.attr("class").split(" ")[0]).style("fill", "");
                    }
                    rect.attr("class", rect.attr("class") + " clicked");
                    rect.style("fill", window.getComputedStyle(this).fill);
                    div.html(function () {
                        var tempHTML = "";
                        if (result === "pass") {
                            if (d.passFiles.length > 1) {
                                tempHTML += "<span>Passed Reports:</span><br>";
                            } else {
                                tempHTML += "<span>Passed Report:</span><br>";
                            }
                            for (var i = 0; i < d.passFiles.length; i++) {
                                tempHTML += "<span><a href='.\\report\\" + d.passFiles[i] + "' target='_blank'>" + d.passFiles[i] + "</a></span><br>";
                            }
                        } else {
                            if (d.failFiles.length > 1) {
                                tempHTML += "<span>Failed Reports:</span><br>";
                            } else {
                                tempHTML += "<span>Failed Report:</span><br>";
                            }
                            for (var i = 0; i < d.failFiles.length; i++) {
                                tempHTML += "<span><a href='.\\report\\" + d.failFiles[i] + "' target='_blank'>" + d.failFiles[i] + "</a></span><br>";
                            }
                        }
                        return tempHTML;
                    });
                    div.style("display", "block");
                    div.style("left", function () {
                            var rectLeft = rectBox.getBoundingClientRect().left,
                                rectWidth = rectBox.getBoundingClientRect().width,
                                tipWidth = this.getBoundingClientRect().width,
                                scrollWidth;
                            var sheet = document.styleSheets;
                            var mainSheet, tipAfterRule;
                            for (var i = 0; i < sheet.length; i++) {
                                if (sheet[i].href.indexOf("main") > -1) {
                                    if (isFirefox) {
                                        mainSheet = sheet[i].cssRules;
                                    } else {
                                        mainSheet = sheet[i].rules;
                                    }
                                    i = sheet.length;
                                    for (var j = 0; j < mainSheet.length; j++) {
                                        if (mainSheet[j].selectorText === "div.testListTip::after") {
                                            tipAfterRule = mainSheet[j];
                                            j = mainSheet.length;
                                        }
                                    }
                                }
                            }
                            if (isIE) {
                                tipAfterRule.style.margin = "-5px 0px 0px -16px";
                            } else {
                                tipAfterRule.style.margin = "-5px 0px 0px -" + (tipWidth / 2 + 10) + "px";
                            }
                            if (isSafari || isEdge) {
                                scrollWidth = document.getElementsByTagName("body")[0].scrollLeft;
                            } else if (isChrome || isFirefox || isIE) {
                                scrollWidth = document.getElementsByTagName("html")[0].scrollLeft;
                            }
                            return ((rectLeft + rectWidth + scrollWidth + 10) + "px");
                        })
                        .style("top", function () {
                            var rectTop = rectBox.getBoundingClientRect().top,
                                rectHeight = rectBox.getBoundingClientRect().height,
                                tipHeight = this.getBoundingClientRect().height,
                                scrollHeight;
                            if (isSafari || isEdge) {
                                scrollHeight = document.getElementsByTagName("body")[0].scrollTop;
                            } else if (isChrome || isFirefox || isIE) {
                                scrollHeight = document.getElementsByTagName("html")[0].scrollTop;
                            }
                            return ((scrollHeight + rectTop + rectHeight / 2 - tipHeight / 2) + "px");
                        });
                }
            });
    }

    function zoomed() {
        //when zoom remove tooltip
        var div = d3.select(".tooltip");
        div.style("opacity", 0);
        //don't show reports
        div = d3.select(".testListTip");
        div.style("display", "none");
        var clickedRect = svg.select(".clicked");
        if (clickedRect.empty() === false) {
            clickedRect.attr("class", clickedRect.attr("class").split(" ")[0]).style("fill", "");
        }
        //draw bars
        var newX = d3.event.transform.rescaleX(x);
        passBar = drawArea.selectAll(".passBar");
        failBar = drawArea.selectAll(".failBar");
        drawBar(passBar, newX, "pass");
        drawBar(failBar, newX, "fail");
        svg.selectAll("rect")
            .filter(function () {
                var trans = this.attributes.transform.value;
                trans = trans.slice(trans.indexOf("(") + 1, trans.indexOf(","));
                trans = parseFloat(trans);
                if (trans < 99 || trans > width + 100) {
                    return [this]
                }
            })
            .style("display", "none");
        svg.selectAll("rect")
            .filter(function () {
                var trans = this.attributes.transform.value;
                trans = trans.slice(trans.indexOf("(") + 1, trans.indexOf(","));
                trans = parseFloat(trans);
                if (trans > 98 && trans < width + 101) {
                    return [this]
                }
            })
            .style("display", "block");

        //redraw grid line
        gridX.tickValues(createTickValues(minDate, calculateDays(maxDate, 1), Math.round(Math.max(80 * dateRange / svgWidth / d3.event.transform.k, 1))));
        gridLine.call(gridX.scale(newX));
        gridLine.selectAll("g")
            .filter(function () {
                var trans = this.attributes.transform.value;
                trans = trans.slice(trans.indexOf("(") + 1, trans.indexOf(","));
                trans = parseFloat(trans);
                if (trans < -1 || trans > width + 1) {
                    return [this]
                }
            })
            .remove();
        //always draw axis last
        xAxis.tickValues(createTickValues(minDate, calculateDays(maxDate, 1), Math.round(Math.max(80 * dateRange / svgWidth / d3.event.transform.k, 1))));
        xLine.call(xAxis.scale(newX));
        xLine.selectAll("g")
            .filter(function () {
                var trans = this.attributes.transform.value;
                trans = trans.slice(trans.indexOf("(") + 1, trans.indexOf(","));
                trans = parseFloat(trans);
                if (trans < -1 || trans > width + 1) {
                    return [this]
                }
            })
            .remove(); // remove out of bound ticks
    }

    function calculateDays(date, number) {
        var calD = new Date(Date.parse(date));
        calD.setUTCHours(Math.round(number * 24 - number * 24 % 1));
        calD.setUTCMinutes(Math.round(number * 24 % 1 * 60));
        return calD;
    }

    function toUTCDate(input) {
        if (input instanceof Date) {
            var tempDate = new Date(Date.parse(input));
            if (input.getHours() !== 0) {
                return tempDate;
            }
        } else {
            var tempDate = new Date(input);
        }
        return new Date(Date.UTC(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()));
    }

    function createTickValues(startDate, endDate, space) { // have to create own tick values since ticks restarts at the first day of the new month
        var dArr = [],
            step = 0;
        while (!(calculateDays(startDate, step) > toUTCDate(endDate))) {
            tempD = toUTCDate(calculateDays(startDate, step));
            dArr.push(tempD);
            step = step + space;
        }
        return dArr;
    }

    function wrapText(text, width) {
        text.each(function () {
            var text = d3.select(this),
                textContent = text.text(),
                tempWord = addBreakSpace(textContent).split(/\s+/),
                x = text.attr('x'),
                y = text.attr('y'),
                dy = parseFloat(text.attr('dy') || 0),
                tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
            for (var i = 0; i < tempWord.length; i++) {
                tempWord[i] = calHyphen(tempWord[i]);
            }
            textContent = tempWord.join(" ");
            var words = textContent.split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                spanContent,
                breakChars = ['/', '&', '-'];
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    spanContent = line.join(' ');
                    breakChars.forEach(function (char) {
                        // Remove spaces trailing breakChars that were added above
                        spanContent = spanContent.replace(char + ' ', char);
                    });
                    tspan.text(spanContent);
                    line = [word];
                    tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
                }
            }
            var emToPxRatio = parseInt(window.getComputedStyle(text._groups[0][0]).fontSize.slice(0, -2));
            text.attr("transform", "translate(-" + (margin.left - 13) + ", -" + lineNumber / 2 * lineHeight * emToPxRatio + ")");

            function calHyphen(word) {
                tspan.text(word);
                if (tspan.node().getComputedTextLength() > width) {
                    var chars = word.split('');
                    var asword = "";
                    for (var i = 0; i < chars.length; i++) {
                        asword += chars[i];
                        tspan.text(asword);
                        if (tspan.node().getComputedTextLength() > width) {
                            if (chars[i - 1] !== "-") {
                                word = word.slice(0, i - 1) + "- " + calHyphen(word.slice(i - 1));
                            }
                            i = chars.length;
                        }
                    }
                }
                return word;
            }
        });

        function addBreakSpace(inputString) {
            var breakChars = ['/', '&', '-'];
            breakChars.forEach(function (char) {
                // Add a space after each break char for the function to use to determine line breaks
                var reg = new RegExp(char, "g");
                inputString = inputString.replace(reg, char + ' ');
            });
            return inputString;
        }
    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function fixScroll(inputElement) {
        var height = inputElement.height(),
            scrollHeight;
        if (isChrome || isIE) {
            scrollHeight = inputElement.get(0).scrollHeight;
        } else {
            scrollHeight = parseInt(inputElement.height());
        }
        inputElement.off("mousewheel").on("mousewheel", function (event) {
            var blockScrolling = ((this.scrollTop === scrollHeight - height) && event.deltaY < 0 || this.scrollTop === 0 && event.deltaY > 0);
            return !blockScrolling;
        });
    }
}

function createTable(inputObject) {
    var tempHTML = "<table style=\"width: 100%; margin: auto\" class = \"detailTable\"><tr><th>Test Name</th><th>Test Date</th><th>Link</th><th>Result</th></tr>";
    inputObject.forEach(function fillTable(element) {
        var tempStr1 = "<tr><td>" + element.testName + "</td><td>" + formatTime(element.testDate) + "</td><td style=\"text-overflow: ellipsis;\"><a href='.\\report\\" + element.fileName + "' target='_blank'>" + element.fileName + "</a></td>";
        var tempStr2 = "<td>";
        if (element.testResult === "Pass") {
            tempStr2 += "<font color=\"#31c631\"><b>" + element.testResult + "</b></font></td></tr>";
        } else {
            tempStr2 += "<font color=\"#f75656\"><b>" + element.testResult + "</b></font></td></tr>";
        }
        tempHTML += tempStr1 + tempStr2;
    });
    tempHTML += "</table>";
    return tempHTML;
}

function waitHide(obj) {
    obj.style.opacity = '0';
    obj.style.height = '0px';
    window.setTimeout(function () {
        obj.style.display = 'none';
    }, 400);
}

function waitLoad(obj) {
    obj.style.opacity = '1';
    obj.style.height = '';
    window.setTimeout(
        function () {
            obj.style.display = 'block';
        }, 400);
}

function onDayChange() {
    if (onDateRadio.checked) {
        dateValue.disabled = false;
        withinDays.disabled = true;
        dateRange1.disabled = true;
        dateRange2.disabled = true;
    } else if (withinDaysRaio.checked) {
        dateValue.disabled = true;
        withinDays.disabled = false;
        dateRange1.disabled = true;
        dateRange2.disabled = true;
    } else {
        dateValue.disabled = true;
        withinDays.disabled = true;
        dateRange1.disabled = false;
        dateRange2.disabled = false;
    }

    validateButton();
}

function onCateChange() {
    if (cateCheck.checked) {
        cateSel.disabled = false;
    } else {
        cateSel.disabled = true;
    }
}

function limitDateRange() {
    if (validateDate(dateRange1.value)) {
        if ($('#testDate')[0].type != 'date') {
            $("#dateRange2").datepicker("option", "minDate", new Date(dateRange1.value));
        } else {
            dateRange2.min = dateRange1.value;
            if (new Date(dateRange1.value) > new Date(dateRange2.value)) {
                dateRange2.value = dateRange1.value;
            }
        }
    }
    validateButton();
}

function formatTime(str) {
    var tempDate = new Date(str);
    tempDate = new Date(tempDate.getTime() + tempDate.getTimezoneOffset() * 60000)
    var dd = tempDate.getDate();
    var mm = tempDate.getMonth() + 1;
    var yyyy = tempDate.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return mm + "/" + dd + "/" + yyyy;
}