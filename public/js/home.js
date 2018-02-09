function pageLoad() {
    var tempStr = getTodayDate();
    if ($("#chooseDay")[0].type != "date") {
        $("#chooseDay").datepicker();
        $("#chooseDay").datepicker("option", "maxDate", new Date());
    } else {
        document.querySelector("#chooseDay").max = tempStr;
    }
    document.querySelector("#chooseDay").value = tempStr;
    document.querySelector("#chooseDay").title = "Click to change date";

    //detect browsers
    // Opera 8.0+
    isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0;
    // Firefox 1.0+
    isFirefox = typeof InstallTrigger !== "undefined";
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    isSafari = /constructor/i.test(window.HTMLElement) || (function(p) {
        return p.toString() === "[object SafariRemoteNotification]";
    })(!window["safari"] || safari.pushNotification);
    // Internet Explorer 6-11
    isIE = /*@cc_on!@*/ false || !!document.documentMode;
    // Edge 20+
    isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    isBlink = (isChrome || isOpera) && !!window.CSS;

    //bind click events
    document.querySelector("body").addEventListener("click", function(e) {
        if (e.target.tagName != "path") {
            document.querySelector("#reportList").style.display = "none";
        }
    });
    let tempElements = document.querySelectorAll("#contentNavi a");
    for (let i = 0; i < tempElements.length; i++) {
        tempElements[i].addEventListener("click", function(e) {
            changeEnvir(e.target);
        });
    }
    tempElements = document.querySelectorAll("#buttonGroup2 div,#buttonGroup3 div");
    for (let i = 0; i < tempElements.length; i++) {
        tempElements[i].addEventListener("click", function(e) {
            changeView(e.target);
        });
    }
    document.querySelector("#summary").addEventListener("click", function() {
        getSummary();
    });
    document.querySelector("#exportSVG").addEventListener("click", function() {
        exportSVG();
    });
    document.querySelector("#chooseDay").addEventListener("change", function() {
        checkTestArea();
    });

    //preload image
    var preImg = ["./images/tick.svg", "./images/cross.svg", "./images/question.svg", "./images/leftarrow.svg", "./images/info.svg"];
    preloadImages(preImg);

    var currentUser = JSON.parse(sessionStorage.getItem("user"));
    var loginBox = document.querySelector("#loginGithub"),
        img = document.querySelector("#headerGitLogo"),
        label = document.querySelector("#loginLabel");
    if (currentUser) {
        preloadImages([currentUser.photos[0].value]);
        img.src = currentUser.photos[0].value;
        label.textContent = currentUser.username;
        loginBox.addEventListener("click", function(e) {
            location.href = currentUser.profileUrl;
        });
    } else {
        img.src = "./images/github.svg";
        label.textContent = "GitHub Login";
        loginBox.addEventListener("click", function(e) {
            location.href = "./login/github";
        });
        let getGitUser = new XMLHttpRequest();
        getGitUser.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let user = this.responseText;
                if (user != "") {
                    user = JSON.parse(user);
                    img.src = user.photos[0].value;
                    label.textContent = user.username;
                    loginBox.addEventListener("click", function(e) {
                        location.href = user.profileUrl;
                    });
                    sessionStorage.setItem("user", JSON.stringify(user));
                }
            }
        }
        getGitUser.open("GET", "./getGitUser");
        getGitUser.send();
    }
    
    var hash = window.location.hash.substr(1);
    if (hash == "envir2") {
        changeEnvir(document.querySelector("#envir2"));
    } else if (hash == "envir3") {
        changeEnvir(document.querySelector("#envir3"));
    } else {
        checkTestArea();
    }
}

function changeEnvir(element) {
    document.querySelector(".naviActive").setAttribute("class", "naviInactive");
    element.setAttribute("class", "naviActive");
    document.querySelector("#envirName").textContent = element.textContent;
    checkTestArea();
}

function changeView(element) {
    if (element.id == "cardView") {
        document.querySelector("#categoryView").setAttribute("class", "");
        document.querySelector("#buttonGroup3").style.display = "none";
    } else if (element.id == "categoryView") {
        document.querySelector("#cardView").setAttribute("class", "");
        document.querySelector("#buttonGroup3").style.display = "inline-block";
    } else {
        document.querySelector("#buttonGroup3 .buttonSelected").setAttribute("class", "");
    }
    element.setAttribute("class", "buttonSelected");
    checkTestArea();
}

function checkTestArea() {
    var requestParams = {
        envir: document.querySelector(".naviActive").textContent,
        testDate: document.querySelector("#chooseDay").value
    }
    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var resultList = JSON.parse(this.responseText);
            if (document.querySelector("#categoryView").className === "buttonSelected") {
                var getGitTK = new XMLHttpRequest();
                getGitTK.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var token = this.responseText;
                        if (token !== "") {
                            //make githubrequest to get issues
                            var xhrIssue = new XMLHttpRequest;
                            var queryObj = {
                                milestone: "*",
                                state: "open",
                                labels: "question",
                                access_token: token,
                                per_page: 100,
                                direction: "desc",
                                sort: "due_date"
                            };
                            xhrIssue.onreadystatechange = function() {
                                if (this.readyState == 4 && this.status == 200) {
                                    var issueList = JSON.parse(this.responseText);
                                    for (let s = 0; s < issueList.length; s++) {
                                        var issue = {
                                            testID: 30,
                                            issueURL: issueList[s].html_url,
                                            issueName: issueList[s].title,
                                            labels: issueList[s].labels,
                                            milestone: issueList[s].milestone,
                                            author: issueList[s].user,
                                            assignees: issueList[s].assignees
                                        }
                                        resultList.push(issue);
                                    }
                                    manageReports(resultList);
                                }
                            }
                            xhrIssue.open("GET", "https://api.github.com/repos/sillicon/ReportDashboard/issues" + formatParams(queryObj));
                            xhrIssue.send();
                        } else {
                            var requireLogin = {
                                testID: 30,
                                loginURL: "./login/github"
                            }
                            resultList.push(requireLogin);
                            manageReports(resultList);
                        }
                    }
                }
                getGitTK.open("GET", "./getGitToken");
                getGitTK.send();
            } else {
                manageReports(resultList);
            }
        } else if (this.readyState == 4) {
            document.querySelector("#contentPane").innerHTML = this.responseText;
        }
    }
    xmlHTTP.open("GET", "./getLatestReports" + formatParams(requestParams));
    xmlHTTP.send();
    document.querySelector("#contentPane").innerHTML = "<div class=\"ui segment\"><div class=\"ui active inverted dimmer\"><div class=\"ui large text loader\">Loading</div></div><p></p><p></p><p></p></div>";
}

function manageReports(resultList) {
    if (document.querySelector("#categoryView").className === "buttonSelected") {
        d3.json("getTestName", function(error, root) {
            if (error) throw error;
            var tempObj = {
                testName: "QA Category",
                child: root
            }
            //DFS - Greedy
            for (var i = 0; i < resultList.length; i++) {
                var depthObj = [tempObj];
                var arr = [0];
                var found = false;
                while (!found && depthObj.length > 0) {
                    if (arr[arr.length - 1] <= depthObj[depthObj.length - 1].child.length - 1) {
                        if (depthObj[depthObj.length - 1].child[arr[arr.length - 1]].hasOwnProperty("child") &&
                            !(depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child[0].hasOwnProperty("cateName") || depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child[0].hasOwnProperty("issueURL"))) {
                            depthObj.push(depthObj[depthObj.length - 1].child[arr[arr.length - 1]]);
                            arr.push(0);
                        } else if (depthObj[depthObj.length - 1].child[arr[arr.length - 1]].id == resultList[i].testID) {
                            if (!depthObj[depthObj.length - 1].child[arr[arr.length - 1]].hasOwnProperty("child")) {
                                depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child = [];
                            }
                            let insertObj = {};
                            if (resultList[i].hasOwnProperty("loginURL")) {
                                insertObj.loginURL = resultList[i].loginURL;
                            } else if (resultList[i].hasOwnProperty("issueURL")) {
                                insertObj.issueURL = resultList[i].issueURL;
                                insertObj.issueName = resultList[i].issueName;
                                insertObj.labels = resultList[i].labels;
                                insertObj.milestone = resultList[i].milestone;
                                insertObj.author = resultList[i].author;
                                insertObj.assignees = resultList[i].assignees;
                            } else {
                                insertObj.testName = resultList[i].fileName;
                                insertObj.testResult = resultList[i].testResult;
                                insertObj.cateName = resultList[i].testName;
                                insertObj.uniqueID = resultList[i]._id;
                                insertObj.comments = resultList[i].comments;
                                if (resultList[i].hasOwnProperty("reportURL")) {
                                    insertObj.reportURL = resultList[i].reportURL;
                                }
                                if (i == resultList.length - 1 || resultList[i].testID != resultList[i + 1].testID) {
                                    depthObj[depthObj.length - 1].child[arr[arr.length - 1]].testResult = resultList[i].testResult;
                                }
                            }
                            depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child.push(insertObj);
                            if (i < resultList.length - 1) {
                                found = true;
                            } else {
                                arr[arr.length - 1]++;
                            }
                        } else {
                            arr[arr.length - 1]++;
                        }
                    } else {
                        for (var j = 0; j < depthObj[depthObj.length - 1].child.length; j++) {
                            if (depthObj[depthObj.length - 1].child[j].hasOwnProperty("testResult") &&
                                (!depthObj[depthObj.length - 1].hasOwnProperty("testResult") || depthObj[depthObj.length - 1].child[j].testResult == "Fail")) {
                                depthObj[depthObj.length - 1].testResult = depthObj[depthObj.length - 1].child[j].testResult;
                            }
                        }
                        arr.pop();
                        depthObj.pop();
                        arr[arr.length - 1]++;
                    }
                }
            }
            document.querySelector("#contentPane").innerHTML = "";
            var selButton = document.querySelector("#buttonGroup3 .buttonSelected");
            if (selButton.id == "sunburstView") {
                createSunburst(tempObj);
            } else if (selButton.id == "circlePackView") {
                createCirclePack(tempObj);
            } else if (selButton.id == "treemapView") {
                createTreemap(tempObj);
            } else if (selButton.id == "treeView") {
                // createTree(tempObj);
                createCollapseTree(tempObj);
            } else if (selButton.id == "ordinaryView") {
                createOrdinary(tempObj);
            }
        });
    } else {
        var getFullList = new XMLHttpRequest();
        getFullList.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var getList = JSON.parse(this.responseText);
                var fullList = Object.keys(getList).map(function(key) {
                    return getList[key];
                });
                document.querySelector("#contentPane").innerHTML = "";
                if (resultList.length !== 0) {
                    fullList.splice(fullList.indexOf(resultList[0].testName), 1);
                    var passCount = resultList[0].testResult == "Pass" ? 1 : 0;
                    var resultGroup = [resultList[0]];
                    if (resultList.length === 1) {
                        createCard(passCount, resultGroup, resultList[0].testName);
                    } else {
                        for (var i = 1; i < resultList.length; i++) {
                            if (resultList[i].testName != resultList[i - 1].testName) {
                                fullList.splice(fullList.indexOf(resultList[i - 1].testName), 1);
                                createCard(passCount, resultGroup, resultList[i - 1].testName);
                                passCount = 0;
                                resultGroup = [resultList[i]];
                            } else {
                                resultGroup.push(resultList[i]);
                            }
                            passCount = resultList[i].testResult == "Pass" ? passCount + 1 : passCount;
                            if (i == resultList.length - 1) {
                                createCard(passCount, resultGroup, resultList[i].testName);
                            }
                        }
                    }
                }
                fullList.sort(function(a, b) {
                    if (a > b) {
                        return 1;
                    } else if (a < b) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                for (var i = 0; i < fullList.length; i++) {
                    if (fullList[i].indexOf("Area 30") < 0 && fullList[i].indexOf("Area 31") < 0) { // do not show github card
                        createCard(0, [], fullList[i]);
                    }
                }
            } else if (this.readyState == 4) {
                document.querySelector("#contentPane").innerHTML = this.responseText;
            }
        }
        getFullList.open("GET", "./getIDRef");
        getFullList.send();
    }
}

function createCard(passCount, resultGroup, testField) {
    var totalTest = resultGroup.length;
    var margin = {
            top: 50,
            right: 10,
            bottom: 50,
            left: 10
        },
        svgWidth = 200,
        svgHeight = 200,
        width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom;

    var div = d3.select("#contentPane").append("div")
        .attr("class", "areaCard");
    div.append("div").attr("class", "fieldTitle").text(testField);
    div.append("div").style("font-size", "1.1rem").text("Total test run for today: " + totalTest);
    var svg = div.append("svg")
        .attr("style", "width: " + svgWidth + "px\; height: " + svgHeight + "px\;");
    if (totalTest != 0) {
        var percent = passCount / totalTest;
        var resultText = svg.append("text").text(null);
        resultText.attr("x", svgWidth / 2)
            .attr("y", svgHeight / 2 + 10)
            .attr("font-size", "40px")
            .attr("fill", "#b6b6b6")
            .attr("font-weight", "bold")
            .text(function() {
                if (passCount < totalTest) {
                    return totalTest - passCount;
                }
                return passCount;
            });
        var strWidth = resultText.node().getComputedTextLength();
        resultText.attr("x", svgWidth / 2 - strWidth / 2);
        var resultLabel = svg.append("text").text(null);
        resultLabel.attr("x", svgWidth / 2)
            .attr("y", svgHeight / 2 + 70)
            .attr("font-size", "1.5rem")
            .attr("fill", "#b6b6b6")
            .text(function() {
                if (passCount < totalTest) {
                    return "Fail";
                }
                return "Pass";
            });
        var strWidth2 = resultLabel.node().getComputedTextLength();
        resultLabel.attr("x", svgWidth / 2 - strWidth2 / 2);
        var successArc = svg.data(function() {
                var temp = [];
                for (var i = 0; i < resultGroup.length; i++) {
                    if (resultGroup[i].testResult == "Pass") {
                        if (resultGroup[i].hasOwnProperty("reportURL")) {
                            temp.push(resultGroup[i].reportURL);
                        } else {
                            temp.push(resultGroup[i].fileName);
                        }
                    }
                }
                return [temp];
            }).append("path")
            .attr("class", "successArc")
            .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");
        var failArc = svg.data(function() {
                var temp = [];
                for (var i = 0; i < resultGroup.length; i++) {
                    if (resultGroup[i].testResult == "Fail") {
                        if (resultGroup[i].hasOwnProperty("reportURL")) {
                            temp.push(resultGroup[i].reportURL);
                        } else {
                            temp.push(resultGroup[i].fileName);
                        }
                    }
                }
                return [temp];
            }).append("path")
            .attr("class", "failArc")
            .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");
        var arc1 = d3.arc()
            .innerRadius(width / 2 - 30)
            .outerRadius(width / 2)
            .startAngle(-Math.PI * 3 / 4);
        var arc2 = d3.arc()
            .innerRadius(width / 2 - 30)
            .outerRadius(width / 2)
            .startAngle(-Math.PI * 3 / 4 + percent * Math.PI * 3 / 2);
        var temp1 = 0,
            temp2 = 0;
        var timer = setInterval(function() {
            if (temp1 < percent * 100) {
                arc1.endAngle(-Math.PI * 3 / 4 + temp1 / 100 * Math.PI * 3 / 2);
                successArc.attr("d", arc1);
                temp1++;
            } else if (temp1 >= percent * 100 && temp2 == 0) {
                arc1.endAngle(-Math.PI * 3 / 4 + percent * Math.PI * 3 / 2);
                successArc.attr("d", arc1);
                arc2.endAngle(-Math.PI * 3 / 4 + (percent + temp2 / 100) * Math.PI * 3 / 2);
                failArc.attr("d", arc2);
                temp2++;
            } else if (temp1 + temp2 < 100) {
                arc2.endAngle(-Math.PI * 3 / 4 + (percent + temp2 / 100) * Math.PI * 3 / 2);
                failArc.attr("d", arc2);
                temp2++;
            } else if (temp1 + temp2 == 100) {
                arc2.endAngle(Math.PI * 3 / 4);
                failArc.attr("d", arc2);
                clearInterval(timer);
            }
        }, 10);
        bindMouseBehavior(successArc, arc1);
        bindMouseBehavior(failArc, arc2);
    } else {
        var percentText = svg.append("text").text(null);
        percentText.attr("x", svgWidth / 2)
            .attr("y", svgHeight / 2 + 70)
            .attr("font-size", "1.5rem")
            .attr("fill", "#b6b6b6")
            .text("Not Run");
        var strWidth = percentText.node().getComputedTextLength();
        percentText.attr("x", svgWidth / 2 - strWidth / 2);
        var noneArc = svg.append("path")
            .attr("class", "noneArc")
            .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");
        var arc = d3.arc()
            .innerRadius(width / 2 - 30)
            .outerRadius(width / 2)
            .startAngle(-Math.PI * 3 / 4)
            .endAngle(Math.PI * 3 / 4);
        var temp = 0;
        var timer = setInterval(function() {
            if (temp < 100) {
                arc.endAngle(-Math.PI * 3 / 4 + temp / 100 * Math.PI * 3 / 2);
                noneArc.attr("d", arc);
                temp++;
            } else {
                arc.endAngle(Math.PI * 3 / 4);
                noneArc.attr("d", arc);
                clearInterval(timer);
            }
        }, 10);
    }
    div.append("a")
        .attr("href", "https://github.com/sillicon")
        .attr("target", "_blank")
        .style("font-size", "1.1rem")
        .text("Test case description");

    function bindMouseBehavior(arcElement, arc) {
        arcElement.on("mouseover", function() {
            arc.outerRadius(width / 2 + 5);
            arcElement.attr("d", arc);
        }).on("mouseout", function() {
            arc.outerRadius(width / 2);
            arcElement.attr("d", arc);
        }).on("click", function(d) {
            var div = d3.select("#reportList");
            var tempScg = svg._groups[0][0];
            var pos = d3.mouse(tempScg);
            div.html(function() {
                var tempHTML = "";
                for (var i = 0; i < d.length; i++) {
                    if (d[i].indexOf("http") > -1) {
                        tempHTML += "<span><a href='" + d[i] + "' target='_blank'>Click here for report</a></span><br>";
                    } else {
                        tempHTML += "<span><a href='.\\report\\" + d[i] + "' target='_blank'>" + d[i] + "</a></span><br>";
                    }
                }
                return tempHTML;
            });
            div.style("display", "block");
            div.style("left", function() {
                var arcLeft = tempScg.getBoundingClientRect().left,
                    arcWidth = tempScg.getBoundingClientRect().width,
                    tipWidth = this.getBoundingClientRect().width,
                    scrollWidth;
                //set ::after rule based on different browser
                var sheet = document.styleSheets;
                for (var i = 0; i < sheet.length; i++) {
                    if (sheet[i].href.indexOf("Home") > -1) {
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
                return ((arcLeft + pos[0] + scrollWidth + 15) + "px");
            });
            div.style("top", function() {
                var arctTop = tempScg.getBoundingClientRect().top,
                    arcHeight = tempScg.getBoundingClientRect().height,
                    tipHeight = this.getBoundingClientRect().height,
                    scrollHeight;
                if (isSafari || isEdge) {
                    scrollHeight = document.getElementsByTagName("body")[0].scrollTop;
                } else if (isChrome || isFirefox || isIE) {
                    scrollHeight = document.getElementsByTagName("html")[0].scrollTop;
                }
                return ((arctTop + pos[1] + scrollHeight - tipHeight / 2) + "px");
            });
        });
    }
}

function createTree(jsonObj) {
    var tempStr = getComputedStyle(document.querySelector("#contentPane")).width;
    var svgWidth = parseInt(tempStr.substr(0, tempStr.length - 2)) - 50;
    var svgHeight = window.innerHeight - 200;
    var svg = d3.select("#contentPane").append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);
    var g = svg.append("g").attr("transform", "translate(150,0)");
    var tree = d3.tree()
        .size([svgHeight, svgWidth - 350]);
    jsonObj = d3.hierarchy(jsonObj, function children(d) {
        return d.child;
    })
    var link = g.selectAll(".treeLink")
        .data(tree(jsonObj).links())
        .enter().append("path")
        .attr("class", "treeLink")
        .attr("d", d3.linkHorizontal()
            .x(function(d) {
                return d.y;
            })
            .y(function(d) {
                return d.x;
            }));
    var node = g.selectAll(".treeNode")
        .data(jsonObj.descendants())
        .enter().append("g")
        .attr("class", function(d) {
            return "treeNode" + (d.children ? " treeNode--internal" : " treeNode--leaf");
        })
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        })

    node.append("circle")
        .attr("r", 2.5);

    node.append("text")
        .attr("dy", 3)
        .attr("x", function(d) {
            return d.children ? -8 : 8;
        })
        .style("text-anchor", function(d) {
            return d.children ? "end" : "start";
        })
        .text(function(d) {
            return d.data.testName;
        });
}

function createCollapseTree(jsonObj) {
    if (!isIE && !isEdge) {
        document.querySelector("#exprotContainer").style.display = "block";
    }
    var margin = {
        top: 0,
        right: 80,
        bottom: 20,
        left: 120
    };
    var tempStr = getComputedStyle(document.querySelector("#contentPane")).width;
    var width = parseInt(tempStr.substr(0, tempStr.length - 2)) - 200,
        height = 800 - margin.top - margin.bottom;
    var i = 0,
        duration = 750;
    var treemap = d3.tree().size([height, width]);
    var svg = d3.select("#contentPane").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    jsonObj = d3.hierarchy(jsonObj, function children(d) {
        return d.child;
    });
    jsonObj.x0 = height / 2;
    jsonObj.y0 = 0;
    jsonObj.children.forEach(collapse);

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }
    update(jsonObj);

    function update(source) {
        // Assigns the x and y position for the nodes
        var treeData = treemap(jsonObj);
        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        var normalize = width / 5;
        nodes.forEach(function(d) {
            d.y = d.depth * normalize;
        });

        // Update the nodes…
        var node = svg.selectAll("g.treeNode")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "treeNode")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", click);

        // Add Circle for the nodes
        nodeEnter.append("circle")
            .attr("class", "treeNode")
            .attr("r", 1e-6)
            .style("fill", function(d) {
                if (d.data.testResult == undefined) {
                    return d.children || d._children ? "lightsteelblue" : "#a1a1a1";
                } else if (d.data.testResult == "Pass") {
                    return "#00a300";
                } else if (d.data.testResult == "Fail") {
                    return "#ff3030";
                }
            });

        // Add labels for the nodes
        nodeEnter.append("text")
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .attr("cursor", "pointer")
            .text(function(d) {
                if (d.data.hasOwnProperty("loginURL")) {
                    return "Click here to authorize GitHub access";
                } else if (d.data.hasOwnProperty("issueURL")) {
                    return d.data.issueName;
                } else {
                    return d.data.testName;
                }

            })
            .on("click", function(d) {
                if (d.data.hasOwnProperty("cateName")) {
                    if (d.data.hasOwnProperty("reportURL")) {
                        window.open(d.data.reportURL);
                    } else {
                        window.open(".\\report\\" + d.data.testName);
                    }
                } else if (d.data.hasOwnProperty("loginURL")) {
                    window.open(".\\login\\github");
                } else if (d.data.hasOwnProperty("issueURL")) {
                    window.open(d.data.issueURL);
                }
            });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select("circle.treeNode")
            .attr("r", 10)
            .attr("cursor", "pointer");

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.treeLink")
            .data(links, function(d) {
                return d.id;
            });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("path", "g")
            .attr("class", "treeLink")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                }
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr("d", function(d) {
                return diagonal(d, d.parent)
            });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                }
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
        path = "M " + s.y + " " + s.x + " C " + (s.y + d.y) / 2 + " " + s.x + " , " + (s.y + d.y) / 2 + " " + d.x + " , " + d.y + " " + d.x;
        return path
    }
    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
}

function createCirclePack(jsonObj) {
    document.querySelector("#exprotContainer").style.display = "block";
    var tempStr = getComputedStyle(document.querySelector("#contentPane")).width;
    var svgWidth = Math.min(parseInt(tempStr.substr(0, tempStr.length - 2)) - 50, window.innerHeight - 200);
    var svgHeight = svgWidth;
    var svg = d3.select("#contentPane").append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth)
        .style("overflow", "hidden");
    var margin = 20,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
    var color = d3.scaleLinear()
        .domain([0, 5])
        .range(["hsl(193, 50%, 80%)", "hsl(215,80%,40%)"])
        .interpolate(d3.interpolateHcl);
    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);
    jsonObj = d3.hierarchy(jsonObj, function children(d) {
            return d.child;
        })
        .sum(function(d) {
            if (d.child != null) {
                return 0;
            }
            return 1;
        })
        .sort(function(a, b) {
            return b.value - a.value;
        });
    var focus = jsonObj,
        nodes = pack(jsonObj).descendants(),
        view;
    var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", function(d) {
            return d.parent ? d.children ? "circlePacknode" : "circlePacknode circlePacknode--leaf" : "circlePacknode circlePacknode--root";
        })
        .style("fill", function(d) {
            if (d.children) {
                return color(d.depth);
            } else if (d.data.hasOwnProperty("testResult")) {
                if (d.data.testResult == "Pass") {
                    return "#00a300";
                }
                return "#ff3030";
            } else {
                return "#c7c7c7";
            }
        })
        .on("click", function(d) {
            if (focus !== d) {
                zoom(d);
                d3.event.stopPropagation();
            } else if (!d.children && d.data.hasOwnProperty("cateName")) {
                if (d.data.hasOwnProperty("reportURL")) {
                    window.open(d.data.reportURL);
                } else {
                    window.open(".\\report\\" + d.data.testName);
                }
            } else if (d.data.hasOwnProperty("loginURL")) {
                window.open(d.data.loginURL);
            } else if (d.data.hasOwnProperty("issueURL")) {
                window.open(d.data.issueURL);
            };
        });
    var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "circlePacklabel")
        .style("fill-opacity", function(d) {
            return d.parent === jsonObj ? 1 : 0;
        })
        .style("display", function(d) {
            return d.parent === jsonObj ? "inline" : "none";
        })
        .text(function(d) {
            if (d.data.hasOwnProperty("loginURL")) {
                return "Click here to authorize GitHub access";
            } else if (d.data.hasOwnProperty("issueURL")) {
                return d.data.issueName;
            } else if (d.data.hasOwnProperty("reportURL")) {
                return d.data.reportURL;
            } else {
                return d.data.testName;
            }
        });
    var node = g.selectAll("circle,text");
    svg.style("background", color(0))
        .on("click", function() {
            zoom(jsonObj);
        });
    zoomTo([jsonObj.x, jsonObj.y, jsonObj.r * 2 + margin]);

    function zoom(d) {
        var focus0 = focus;
        focus = d;
        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function(t) {
                    zoomTo(i(t));
                };
            });

        transition.selectAll("text")
            .filter(function(d) {
                return d.parent === focus || this.style.display === "inline";
            })
            .style("fill-opacity", function(d) {
                return d.parent === focus ? 1 : 0;
            })
            .on("start", function(d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .on("end", function(d) {
                if (d.parent !== focus) this.style.display = "none";
            });
    }

    function zoomTo(v) {
        var k = diameter / v[2];
        view = v;
        node.attr("transform", function(d) {
            return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
        });
        circle.attr("r", function(d) {
            return d.r * k;
        });
    }
}

function createSunburst(jsonObj) {
    document.querySelector("#exprotContainer").style.display = "block";
    var tempStr = getComputedStyle(document.querySelector("#contentPane")).width;
    var svgWidth = Math.min(parseInt(tempStr.substr(0, tempStr.length - 2)) - 50, window.innerHeight - 250);
    var svgHeight = svgWidth + 100;
    var radius = svgWidth / 2 - 40;
    var formatNumber = d3.format(",d");
    var x = d3.scaleLinear()
        .range([0, 2 * Math.PI]);
    var y = d3.scaleSqrt()
        .range([0, radius])
    var partition = d3.partition();
    var arc = d3.arc()
        .startAngle(function(d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
        })
        .endAngle(function(d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
        })
        .innerRadius(function(d) {
            return Math.max(0, y(d.y0));
        })
        .outerRadius(function(d) {
            return Math.max(0, y(d.y1));
        });
    var svg = d3.select("#contentPane").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", "translate(" + svgWidth / 2 + "," + (svgHeight / 2) + ")");
    jsonObj = d3.hierarchy(jsonObj, function children(d) {
        return d.child;
    });
    jsonObj.sum(function(d) {
        if (d.child != null) {
            return 0;
        }
        return 1;
    });
    svg.selectAll("path")
        .data(partition(jsonObj).descendants())
        .enter().append("path")
        .attr("d", arc)
        .attr("class", function(d) {
            if (d.data.hasOwnProperty("testResult")) {
                if (d.data.testResult == "Pass") {
                    return "sunburstPath testPass";
                }
                return "sunburstPath testFail";
            } else {
                return "sunburstPath norun";
            }
        })
        .on("click", click)
        .on("mouseover", hover)
        .append("title")
        .text(function(d) {
            return d.data.testName;
        });

    var text = d3.select("#contentPane svg").append("text")
        .attr("font-size", "1.3rem")
        .attr("id", "cateDescription")
        .text("QA Category")
        .attr("transform", "translate(" + svgWidth / 2 + ", 20)")
        .attr("text-anchor", "middle");

    function click(d) {
        if (!d.children && d.data.hasOwnProperty("cateName")) {
            if (d.data.hasOwnProperty("reportURL")) {
                window.open(d.data.reportURL);
            } else {
                window.open(".\\report\\" + d.data.testName);
            }
        } else if (d.data.hasOwnProperty("loginURL")) {
            window.open(d.data.loginURL);
        } else if (d.data.hasOwnProperty("issueURL")) {
            window.open(d.data.issueURL);
        } else {
            svg.transition()
                .duration(750)
                .tween("scale", function() {
                    var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]),
                        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                    return function(t) {
                        x.domain(xd(t));
                        y.domain(yd(t)).range(yr(t));
                    };
                })
                .selectAll("path")
                .attrTween("d", function(d) {
                    return function() {
                        return arc(d);
                    };
                });
        };
    }

    function hover(d) {
        var tempStr = getParent(d);
        var width = (svgWidth - 50) * 2 / 3;
        var text = d3.select("#cateDescription").text(tempStr);
        wrap(text, width);

        function getParent(obj) {
            var nameStr = "";
            if (obj.data.hasOwnProperty("loginURL")) {
                nameStr = "Click here to authorize GitHub access";
                return nameStr;
            } else if (obj.data.hasOwnProperty("issueURL")) {
                nameStr = obj.data.issueName;
            } else {
                nameStr = obj.data.testName;
            }
            if (obj.parent == null) {
                return nameStr;
            } else {
                return getParent(obj.parent) + ">" + nameStr;
            }
        }

        function wrap(text, width) {
            var words = text.text().split(/>/g).reverse(),
                word,
                line = [],
                lineHeight = 22,
                y = text.attr("y"),
                dy = parseFloat(text.attr("font-size"));
            if (isChrome) {
                var tspan = text.text(null).append("tspan").attr("x", 0).attr("dy", dy + "rem").attr("text-anchor", "middle");
            } else {
                var tspan = text.text(null).append("tspan").attr("x", 0).attr("dy", 0).attr("text-anchor", "middle");
            }
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" > "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" > ") + " >");
                    line = [word];
                    var dx = tspan.node().getComputedTextLength();
                    if (isChrome) {
                        tspan = text.append("tspan").attr("text-anchor", "middle").attr("x", 0).attr("dy", dy + "rem").text(word);
                    } else {
                        tspan = text.append("tspan").attr("text-anchor", "middle").attr("x", 0).attr("dy", lineHeight).text(word);
                    }

                }
            }
            text.attr("transform", "translate(" + svgWidth / 2 + ", 20)");
        }
    }
    d3.select(self.frameElement).style("height", svgHeight + "px");
}

function createOrdinary(jsonObj) {
    document.querySelector("#exprotContainer").style.display = "none";
    var depthObj = [jsonObj];
    var divGroup = [makeDiv(jsonObj, document.querySelector("#contentPane"))];
    var arr = [0];
    while (depthObj.length > 0) {
        if (arr[arr.length - 1] <= depthObj[depthObj.length - 1].child.length - 1) {
            if (depthObj[depthObj.length - 1].child[arr[arr.length - 1]].hasOwnProperty("child")) {
                divGroup.push(makeDiv(depthObj[depthObj.length - 1].child[arr[arr.length - 1]], divGroup[divGroup.length - 1]));
                depthObj.push(depthObj[depthObj.length - 1].child[arr[arr.length - 1]]);
                arr.push(0);
            } else {
                makeDiv(depthObj[depthObj.length - 1].child[arr[arr.length - 1]], divGroup[divGroup.length - 1]);
                arr[arr.length - 1]++;
            }
        } else {
            divGroup.pop();
            arr.pop();
            depthObj.pop();
            arr[arr.length - 1]++;
        }
    }

    function makeDiv(obj, parentNode) {
        let div = document.createElement("div");
        let radioButton = document.createElement("button");
        let nameCard = document.createElement("div");
        let returnDiv = document.createElement("div");
        let plusSVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 8 16 16\" class=\"plus\"><path d=\"M15 17H9v6H7v-6H1v-2h6V9h2v6h6v2z\"></path></svg>";
        let minusSVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 8 16 16\" class=\"minus\"><path d=\"M15 17H1v-2h14v2z\"></path></svg>";
        let dotSVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 8 16 16\" class=\"dot\"><circle cx=\"8\" cy=\"16\" r=\"4\"></circle></svg>";
        let reportSVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" class=\"report\"><path d=\"M22 24h4v2h-4v-2zm0-12h4v2h-4v-2zm0 4h4v2h-4v-2zM8 6h10v2H8V6zm14 14h4v2h-4v-2zM8 12h10v2H8v-2zm0 4h12v2H8v-2zM22.801 0H4v32h26V7.199L22.801 0zM28 30H6V2h14v8h8v20zm0-22h-6V2h.621L28 7.379V8zM8 20h12v2H8v-2zm0 4h10v2H8v-2z\"/></svg>";
        let nameStr;

        parentNode.appendChild(div);
        div.className = "ordinaryCard";
        if (parentNode != document.querySelector("#contentPane") && parentNode.parentNode != document.querySelector("#contentPane > div")) {
            div.style.display = "none";
        }
        div.style.textAlign = "left";
        div.appendChild(radioButton);
        div.appendChild(nameCard);
        radioButton.style.cssFloat = "left";
        if (parentNode.id === "contentPane") {
            radioButton.innerHTML = minusSVG;
        } else {
            radioButton.innerHTML = plusSVG;
        }
        nameCard.className = "nameCard";
        returnDiv.className = "cardHolder";
        if (obj.hasOwnProperty("child")) {
            div.appendChild(returnDiv);
            radioButton.className = "haschild";
            radioButton.onclick = function(e) {
                let parent = this.parentNode;
                if (this.firstChild.className.baseVal.indexOf("plus") > -1) {
                    this.innerHTML = minusSVG;
                } else {
                    this.innerHTML = plusSVG;
                }
                let cardCol = $($(parent.children[2]).children());
                cardCol.transition({
                    animation: "slide down",
                    duration: Math.min(1000 / obj.child.length, 300),
                    interval: Math.min(80, Math.max(200 / obj.child.length, 10))
                });
            }
        } else if (obj.hasOwnProperty("cateName")) {
            radioButton.innerHTML = reportSVG;
        } else {
            radioButton.innerHTML = dotSVG;
        }

        if (!obj.hasOwnProperty("loginURL") && !obj.hasOwnProperty("issueURL")) {
            nameStr = document.createElement("div");
            nameCard.appendChild(nameStr);
            if (obj.hasOwnProperty("testResult")) {
                if (obj.testResult === "Pass") {
                    nameCard.style.backgroundColor = "#deffde";
                    radioButton.style.border = "5px solid #66dc66";
                } else {
                    nameCard.style.backgroundColor = "#ffe7e7";
                    radioButton.style.border = "5px solid #ffb2b2";
                }
            } else {
                radioButton.style.border = "5px solid #e3e3e3";
            }
            nameStr.textContent = obj.testName;
            nameStr.className = "fieldTitle";
            if (["Test Category 4", "Test Area 30", "Test Area 31"].indexOf(obj.testName) > -1) { // add github icon for devtopia links
                let gitIcon = document.createElement("i");
                gitIcon.className = "github icon";
                gitIcon.style.color = "black";
                gitIcon.style.paddingLeft = "20px";
                nameStr.appendChild(gitIcon);
            }
            if (obj.hasOwnProperty("id") && ["Test Area 30", "Test Area 31"].indexOf(obj.testName) < 0) { // add info icon
                let infoButton = document.createElement("a");
                infoButton.href = "https://github.com/sillicon";
                infoButton.target = "_blank";
                infoButton.style.textDecoration = "none";
                // let infoIcon = document.createElement("img");
                let infoIcon = document.createElement("i");
                // infoIcon.height = "25";
                // infoIcon.width = "20";
                infoIcon.className = "info circle icon";
                infoIcon.style.fontSize = "1.4rem";
                infoIcon.style.cssFloat = "right";
                infoIcon.style.color = "#42aaf5";
                infoIcon.title = "Click for more info";
                infoButton.appendChild(infoIcon);
                nameStr.appendChild(infoButton);
            }
            if (obj.hasOwnProperty("cateName")) {
                nameStr.style.cursor = "pointer";
                nameStr.onclick = function(e) {
                    if (e.target.tagName.toLowerCase() != "label" && e.target.tagName.toLowerCase() != "i") {
                        if (obj.hasOwnProperty("reportURL")) {
                            window.open(obj.reportURL);
                        } else {
                            window.open(".\\report\\" + obj.testName);
                        }
                    }
                }
                let descrip = document.createElement("div");
                let tempCollect = obj.testName.substring(0, obj.testName.lastIndexOf(".")).match(/[a-zA-Z JSAPI4.x-]+|[0-9_]+/g)[1];
                let tempCol = tempCollect.split(/_/g);
                tempCollect = "Test Date: " + tempCol[0] + "/" + tempCol[1] + "/" + tempCol[2] + "<br>" + "Upload Time: " + tempCol[3] + ":" + tempCol[4] + ":" + tempCol[5];
                descrip.innerHTML = tempCollect;
                descrip.style.margin = "auto auto 10px 30px";
                //decide if user has privilege to change or delete result
                let currentUser = JSON.parse(sessionStorage.getItem("user"));
                if (currentUser && ["sillicon"].indexOf(currentUser.username) > -1) {
                    let editIcon = document.createElement("i");
                    let deleteIcon = document.createElement("i");
                    nameStr.appendChild(editIcon);
                    nameStr.appendChild(deleteIcon);
                    editIcon.className = "write icon";
                    editIcon.style.color = "black";
                    editIcon.style.marginLeft = "10px";
                    editIcon.title = "Change result";
                    deleteIcon.className = "trash outline icon";
                    deleteIcon.style.color = "black";
                    deleteIcon.title = "Delete report";
                    editIcon.onclick = function(e) {
                        let modal, modalHeader, modalInfo, actions, yesBut, noBut, closeIcon;
                        if (document.getElementById("editModal") === null) {
                            modal = document.createElement("div");
                            document.querySelector("body").appendChild(modal);
                            modal.id = "editModal";
                            modal.className = "ui modal";
                            modalHeader = document.createElement("div");
                            modalInfo = document.createElement("div");
                            actions = document.createElement("actions");
                            yesBut = document.createElement("div");
                            noBut = document.createElement("div");
                            closeIcon = document.createElement("i");
                            modalHeader.className = "header";
                            modalInfo.className = "content";
                            actions.className = "actions";
                            yesBut.className = "ok button";
                            noBut.className = "cancel button";
                            closeIcon.className = "close black icon";
                            yesBut.textContent = "OK";
                            noBut.textContent = "Cancel";
                            modalHeader.textContent = "Change test result";
                            modal.appendChild(modalHeader);
                            modal.appendChild(modalInfo);
                            actions.appendChild(yesBut);
                            actions.appendChild(noBut);
                            modal.appendChild(actions);
                            modal.appendChild(closeIcon);
                        } else {
                            modal = document.querySelector("#editModal");
                            modalHeader = modal.querySelector(".header");
                            modalInfo = modal.querySelector(".content");
                            actions = modal.querySelector(".actions");
                            yesBut = modal.querySelector(".ok.button");
                            noBut = modal.querySelector(".cancel.button");
                        }
                        modalInfo.textContent = "Do you want to alter the test result?";
                        if (obj.testResult === "Pass") {
                            modalInfo.textContent += " (Pass to Fail)";
                        } else {
                            modalInfo.textContent += " (Fail to Pass)";
                        }
                        $("#editModal").modal({
                            inverted: true,
                            onApprove: function() { // when OK is clicked
                                let alterObj = {
                                    _id: obj.uniqueID
                                }
                                let xhr = new XMLHttpRequest();
                                xhr.onreadystatechange = function() {
                                    if (this.readyState == 4 && this.status == 200) {
                                        checkTestArea();
                                    } else if (this.readyState == 4 && this.status == 500) {
                                        let warnModal, modalInfo, closeIcon;
                                        if (document.getElementById("warnModal") === null) {
                                            warnModal = document.createElement("div");
                                            modalInfo = document.createElement("div");
                                            closeIcon = document.createElement("i");
                                            document.querySelector("body").appendChild(warnModal);
                                            warnModal.id = "warnModal";
                                            warnModal.className = "ui modal";
                                            closeIcon = document.createElement("i");
                                            modalInfo.className = "content";
                                            closeIcon.className = "close black icon";
                                            warnModal.appendChild(modalInfo);
                                            warnModal.appendChild(closeIcon);
                                        } else {
                                            warnModal = document.querySelector("#warnModal");
                                            modalInfo = warnModal.querySelector(".content");
                                            closeIcon = warnModal.querySelector(".close.icon");
                                        }
                                        modalInfo.textContent = this.responseText;
                                        $("#warnModal").modal({
                                            inverted: true,
                                            onHidden: checkTestArea()
                                        }).modal("setting", "transition", "scale").modal("show");
                                    }
                                }
                                xhr.open("GET", "./alterResult" + formatParams(alterObj));
                                xhr.send();
                            }
                        }).modal("setting", "transition", "scale").modal("show");
                    }
                    deleteIcon.onclick = function(e) {
                        let modal, modalHeader, modalInfo, actions, yesBut, noBut, closeIcon;
                        if (document.getElementById("deleteModal") === null) {
                            modal = document.createElement("div");
                            document.querySelector("body").appendChild(modal);
                            modal.id = "deleteModal";
                            modal.className = "ui modal";
                            modalHeader = document.createElement("div");
                            modalInfo = document.createElement("div");
                            actions = document.createElement("actions");
                            yesBut = document.createElement("div");
                            noBut = document.createElement("div");
                            closeIcon = document.createElement("i");
                            modalHeader.className = "header";
                            modalInfo.className = "content";
                            actions.className = "actions";
                            yesBut.className = "delete ok button";
                            noBut.className = "cancel button";
                            closeIcon.className = "close black icon";
                            yesBut.textContent = "Delete";
                            noBut.textContent = "Cancel";
                            modalHeader.textContent = "Delete test result";
                            modalInfo.textContent = "Do you want to delete this result?";
                            modal.appendChild(modalHeader);
                            modal.appendChild(modalInfo);
                            actions.appendChild(yesBut);
                            actions.appendChild(noBut);
                            modal.appendChild(actions);
                            modal.appendChild(closeIcon);
                        } else {
                            modal = document.querySelector("#deleteModal");
                            modalHeader = modal.querySelector(".header");
                            modalInfo = modal.querySelector(".content");
                            actions = modal.querySelector(".actions");
                            yesBut = modal.querySelector(".delete.ok.button");
                            noBut = modal.querySelector(".cancel.button");
                        }
                        $("#deleteModal").modal({
                            inverted: true,
                            onApprove: function() { // when OK is clicked
                                let deleteObj = {
                                    _id: obj.uniqueID
                                }
                                let xhr = new XMLHttpRequest();
                                xhr.onreadystatechange = function() {
                                    if (this.readyState == 4 && this.status == 200) {
                                        checkTestArea();
                                    } else if (this.readyState == 4 && this.status == 500) {
                                        let warnModal, modalInfo, closeIcon;
                                        if (document.getElementById("warnModal") === null) {
                                            warnModal = document.createElement("div");
                                            modalInfo = document.createElement("div");
                                            closeIcon = document.createElement("i");
                                            document.querySelector("body").appendChild(warnModal);
                                            warnModal.id = "warnModal";
                                            warnModal.className = "ui modal";
                                            closeIcon = document.createElement("i");
                                            modalInfo.className = "content";
                                            closeIcon.className = "close black icon";
                                            warnModal.appendChild(modalInfo);
                                            warnModal.appendChild(closeIcon);
                                        } else {
                                            warnModal = document.querySelector("#warnModal");
                                            modalInfo = warnModal.querySelector(".content");
                                            closeIcon = warnModal.querySelector(".close.icon");
                                        }
                                        modalInfo.textContent = this.responseText;
                                        $("#warnModal").modal({
                                            inverted: true,
                                            onHidden: checkTestArea()
                                        }).modal("setting", "transition", "scale").modal("show");
                                    }
                                }
                                xhr.open("GET", "./deleteResult" + formatParams(deleteObj));
                                xhr.send();
                            }
                        }).modal("setting", "transition", "scale").modal("show");
                    }
                }
                //comment section
                let commentImg = document.createElement("i");
                let coNum = document.createElement("label");
                coNum.className = "coNum";
                commentImg.style.cssFloat = "right";
                commentImg.style.fontSize = "1.3rem";
                commentImg.style.color = "#005e95";
                commentImg.className = "comment outline icon";
                commentImg.title = "Toggle comment"
                commentImg.onclick = function(e) {
                    e.stopPropagation();
                    if (this.className.indexOf("outline") > -1) {
                        this.className = "comment icon";
                        this.style.color = "#42aaf5";
                    } else {
                        this.className = "comment outline icon";
                        this.style.color = "#005e95";
                    }
                    let parent = this.parentNode;
                    let commentSection = $(parent.parentNode.childNodes[2]);
                    commentSection.transition({
                        animation: "slide down",
                        duration: 400,
                        interval: 30
                    });
                }
                nameStr.appendChild(commentImg);
                nameStr.appendChild(coNum);
                nameCard.appendChild(descrip);
                //create comment section
                let comments = document.createElement("div");
                comments.className = "commentsHolder";
                let commentTitle = document.createElement("div");
                commentTitle.textContent = "Comments";
                commentTitle.style.fontWeight = "bold";
                commentTitle.style.borderBottom = "1px solid #000000";
                comments.appendChild(commentTitle);
                if (obj.comments && obj.comments.length > 0) {
                    coNum.textContent = obj.comments.length;
                    for (let i = 0; i < obj.comments.length; i++) {
                        //create existing comment card
                        createCommentCard(obj.comments[i], comments, "append");
                    }
                } else {
                    coNum.textContent = "0";
                    let noComment = document.createElement("div");
                    noComment.className = "commentCard nocomment";
                    noComment.textContent = "No comment";
                    comments.appendChild(noComment);
                }
                let commentButton = document.createElement("div");
                commentButton.className = "cardButton";
                if (currentUser) {
                    commentButton.textContent = "Comment";
                    commentButton.className += " buttonDisabled";
                    let avatar = document.createElement("img");
                    avatar.src = currentUser.photos[0].value;
                    avatar.className = "avatar";
                    avatar.alt = "userAvatar";
                    comments.appendChild(avatar);
                    let textBox = document.createElement("textarea");
                    textBox.placeholder = "Leave a comment";
                    textBox.maxLength = 255;
                    textBox.oninput = function(e) {
                        if (e.target.value != "") {
                            commentButton.className = "cardButton";
                        } else {
                            commentButton.className = "cardButton buttonDisabled";
                        }
                    }
                    comments.appendChild(textBox);
                    commentButton.onclick = function(e) {
                        e.target.className = "cardButton buttonDisabled";
                        let tempName = JSON.parse(sessionStorage.getItem("user")).displayName;
                        if (tempName == null) {
                            tempName = JSON.parse(sessionStorage.getItem("user")).username;;
                        }
                        let requestJSON = {
                            _id: obj.uniqueID,
                            commenter: tempName,
                            commentText: e.target.previousElementSibling.value
                        }
                        let xmlHTTP = new XMLHttpRequest();
                        xmlHTTP.open("POST", "./publishComment");
                        xmlHTTP.setRequestHeader("Content-Type", "application/json");
                        xmlHTTP.send(JSON.stringify(requestJSON));
                        xmlHTTP.onreadystatechange = function() {
                            if (this.readyState == 4 && this.status == 200) {
                                let testEle = e.target.previousElementSibling.previousElementSibling.previousElementSibling;
                                if (testEle.className === "commentCard nocomment") {
                                    $(testEle).remove();
                                }
                                let input = {
                                    commenter: requestJSON.commenter,
                                    commentTime: new Date().toLocaleString(),
                                    comment: requestJSON.commentText
                                }
                                createCommentCard(input, e.target.previousElementSibling.previousElementSibling, "insert");
                                e.target.previousElementSibling.value = "";
                                e.target.className = "cardButton buttonDisabled";
                            }
                        }
                    }
                } else {
                    commentButton.textContent = "Log in to comment";
                    commentButton.onclick = function() {
                        location.href = "./login/github";
                    }
                }
                comments.appendChild(commentButton);
                $(comments).transition("hide");
                nameCard.appendChild(comments);
            }
        } else {
            //if is in manual category and not logged in
            nameStr = document.createElement("a");
            nameCard.appendChild(nameStr);
            radioButton.style.border = "5px solid #e3e3e3";
            if (obj.hasOwnProperty("loginURL")) {
                nameCard.className += " login";
                nameStr.textContent = "Click here to authorize GitHub access";
                nameStr.href = obj.loginURL;
            } else if (obj.hasOwnProperty("issueURL")) {
                nameCard.className += " issueTitle";
                nameStr.textContent = obj.issueName;
                nameStr.href = obj.issueURL;
                nameStr.target = "_blank";
                nameStr.className = "issueName";
            }
        }
        if (obj.hasOwnProperty("issueURL")) {
            nameCard.appendChild(document.createElement("br"));
            for (let l = 0; l < obj.labels.length; l++) {
                let label = document.createElement("div");
                label.className = "label";
                label.textContent = obj.labels[l].name;
                label.style.backgroundColor = "#" + obj.labels[l].color;
                //check background color if it's too light
                let rgb = parseInt(obj.labels[l].color, 16); // convert rrggbb to decimal
                let r = (rgb >> 16) & 0xff; // extract red
                let g = (rgb >> 8) & 0xff; // extract green
                let b = (rgb >> 0) & 0xff; // extract blue
                let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
                if (luma > 150) {
                    label.style.color = "black";
                } else {
                    label.style.color = "white";
                }
                nameCard.appendChild(label);
            }
            let info = document.createElement("div");
            info.className = "info";
            info.textContent = "assigned to:";
            if (obj.assignees.length === 0) {
                info.textContent += " none";
            } else {
                for (let assign = 0; assign < obj.assignees.length; assign++) {
                    info.textContent += " " + obj.assignees[assign].login;
                }
            }
            info.textContent += " created by: " + obj.author.login + " milestone: " + obj.milestone.title;
            nameCard.appendChild(info);
        }

        return returnDiv;
    }

    function createCommentCard(input, targetElement, position) {
        let existComment = document.createElement("div");
        existComment.className = "commentCard";
        let coAvatar = document.createElement("div");
        let coName = document.createElement("label");
        let coTimelabel = document.createElement("label");
        let coText = document.createElement("div");
        if (input.commenter != null) {
            coAvatar.textContent = input.commenter.substring(0, 1).toUpperCase();
            coAvatar.style.backgroundColor = "hsl(" + Math.abs(parseInt(hashCode(input.commenter.substr(-7)), 16) / 0xfffffff) + ", 50%, 70%)";
            coName.textContent = input.commenter;;
        } else {
            coAvatar.textContent = "A";
            coName.textContent = "Anonymous";
            coAvatar.style.backgroundColor = "hsl(" + Math.abs(parseInt(hashCode("Anonymous".substr(-7)), 16) / 0xfffffff) + ", 50%, 70%)";
        }
        coAvatar.className = "coAvatar";
        coName.className = "coName";
        coTimelabel.textContent = new Date(input.commentTime).toLocaleString();
        coTimelabel.className = "coTimelabel";
        coText.textContent = input.comment;
        coText.className = "coText";
        existComment.appendChild(coAvatar);
        existComment.appendChild(coName);
        existComment.appendChild(coTimelabel);
        existComment.appendChild(coText);
        if (position === "append") {
            targetElement.appendChild(existComment);
        } else if (position === "insert") {
            targetElement.parentNode.insertBefore(existComment, targetElement);
        }
    }

    function hashCode(str) {
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}

function createTreemap(jsonObj) {
    document.querySelector("#exprotContainer").style.display = "none";
    jsonObj.child.splice(3); // do not show github issues in Treemap view
    var tempStr = getComputedStyle(document.querySelector("#contentPane")).width;
    var svgWidth = parseInt(tempStr.substr(0, tempStr.length - 2)) - 50;
    var svgHeight = svgWidth + 100;
    var svg = d3.select("#contentPane").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)

    var color = d3.scaleLinear()
        .domain([0, 7])
        .range(["hsl(193, 50%, 80%)", "hsl(215,80%,40%)"])
        .interpolate(d3.interpolateHcl);

    var treemap = d3.treemap()
        .size([svgWidth, svgHeight])
        .paddingOuter(5)
        .paddingTop(32)
        .paddingInner(5)
        .tile(d3.treemapBinary);

    jsonObj = d3.hierarchy(jsonObj, function children(d) {
        return d.child;
    });
    jsonObj.sum(function(d) {
        if (d.child != null) {
            if (d.hasOwnProperty("id")) {
                return 1;
            }
            return 0;
        }
        return 1;
    });

    treemap(jsonObj);

    var cell = svg
        .selectAll(".treemapNode")
        .data(jsonObj.descendants())
        .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
        })
        .attr("class", "treemapNode")
        .each(function(d) {
            d.node = this;
        })
        .on("mouseover", hovered(true))
        .on("mouseout", hovered(false))
        .on("click", click);

    cell.append("rect")
        .attr("id", function(d) {
            if (d.data.hasOwnProperty("cateName")) {
                return "rect-" + encodeURI(d.data.testName.substring(0, d.data.testName.lastIndexOf(".")));
            }
            return "rect-" + encodeURI(d.data.testName);
        })
        .attr("width", function(d) {
            return d.x1 - d.x0;
        })
        .attr("height", function(d) {
            return d.y1 - d.y0;
        })
        .style("fill", function(d) {
            if (d.data.hasOwnProperty("cateName")) {
                if (d.data.testResult == "Pass") {
                    return "#79de79";
                }
                return "#ff7777";
            } else {
                return color(d.depth);
            }
        });

    cell.append("clipPath")
        .attr("id", function(d) {
            if (d.data.hasOwnProperty("cateName")) {
                return "clip-" + encodeURI(d.data.testName.substring(0, d.data.testName.lastIndexOf(".")));
            }
            return "clip-" + encodeURI(d.data.testName);
        })
        .append("use")
        .attr("xlink:href", function(d) {
            if (d.data.hasOwnProperty("cateName")) {
                return "#rect-" + encodeURI(d.data.testName.substring(0, d.data.testName.lastIndexOf(".")));
            }
            return "#rect-" + encodeURI(d.data.testName);
        });

    var label = cell.append("text")
        .attr("class", "treemapNode")
        .attr("clip-path", function(d) {
            if (d.data.hasOwnProperty("cateName")) {
                return "url(#clip-" + encodeURI(d.data.testName.substring(0, d.data.testName.lastIndexOf("."))) + ")";
            }
            return "url(#clip-" + encodeURI(d.data.testName) + ")";
        });

    label.filter(function(d) {
            return d.children;
        })
        .selectAll("tspan")
        .data(function(d) {
            return [d.data.testName];
        })
        .enter().append("tspan")
        .attr("x", function(d, i) {
            return i ? null : 5;
        })
        .attr("y", 20)
        .text(function(d) {
            return d;
        });

    label.filter(function(d) {
            return !d.children;
        })
        .selectAll("tspan")
        .data(function(d) {
            if (d.data.hasOwnProperty("cateName")) {
                var collect = d.data.testName.substring(0, d.data.testName.lastIndexOf(".")).match(/[a-zA-Z JSAPI4.x-]+|[0-9_]+/g);
                var tempCol = collect[1].split(/_/g);
                collect[1] = "";
                collect[2] = tempCol[0] + "/" + tempCol[1] + "/" + tempCol[2];
                collect[3] = tempCol[3] + ":" + tempCol[4] + ":" + tempCol[5];
                return collect;
            }
            return d.data.testName.split(/ /g);
        })
        .enter().append("tspan")
        .attr("x", 5)
        .attr("y", function(d, i) {
            return 20 + i * 20;
        })
        .text(function(d) {
            return d;
        });
    label.filter(function(d) {
            return d.data.hasOwnProperty("cateName");
        })
        .attr("class", "treemapNode reportName")
        .attr("cursor", "pointer");

    cell.append("title")
        .text(function(d) {
            if (d.data.hasOwnProperty("reportURL")) {
                return d.data.reportURL;
            }
            return d.data.testName;
        });

    function hovered(hover) {
        return function(d) {
            d3.selectAll(d.ancestors().map(function(d) {
                    return d.node;
                }))
                .classed("treemapNode--hover", hover)
                .select("rect")
                .attr("width", function(d) {
                    return d.x1 - d.x0 - hover;
                })
                .attr("height", function(d) {
                    return d.y1 - d.y0 - hover;
                });
        };
    }

    function click(d) {
        if (!d.children && d.data.hasOwnProperty("cateName")) {
            if (d.data.hasOwnProperty("reportURL")) {
                window.open(d.data.reportURL);
            } else {
                window.open(".\\report\\" + d.data.testName);
            }
        }
    }
}

function exportSVG() {
    var svg = document.querySelector("#contentPane svg");
    var prefix = {
        xmlns: "http://www.w3.org/2000/xmlns/",
        xlink: "http://www.w3.org/1999/xlink",
        svg: "http://www.w3.org/2000/svg"
    };
    var emptySvg = document.createElement("svg");
    emptySvg.id = "tempSVG";
    document.querySelector("#contentPane").appendChild(emptySvg);
    var emptySvgDeclarationComputed = getComputedStyle(emptySvg);
    emptySvg.innerHTML = svg.innerHTML;
    emptySvg.setAttribute("width", svg.getAttribute("width"));
    emptySvg.setAttribute("height", svg.getAttribute("height"));
    emptySvg.setAttribute("version", "1.1");
    emptySvg.setAttribute("xmlns", prefix.svg);
    emptySvg.setAttribute("xmlns:xlink", prefix.xlink);

    setInlineStyles(emptySvg, emptySvgDeclarationComputed);

    var html = emptySvg.outerHTML;
    var imgsrc = "data:image/svg+xml;utf8," + html;
    var image = new Image();
    image.src = imgsrc;
    image.onload = function(params) {
        var svg = document.querySelector("#contentPane svg");
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d");
        var location = {
            height: getComputedStyle(svg).height,
            width: getComputedStyle(svg).width
        }
        canvas.height = location.height.substring(0, location.height.length - 2);
        canvas.width = location.width.substring(0, location.width.length - 2);
        canvas.style.height = location.height;
        canvas.style.width = location.width;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        var canvasdata = canvas.toDataURL();
        document.querySelector("#tempSVG").remove();
        var a = document.createElement("a");
        a.download = "ExportImage.png";
        a.href = canvasdata;
        if (isFirefox) {
            document.querySelector("#contentPane").appendChild(a);
        }
        a.click();
        if (isFirefox) {
            a.remove();
        }
    }

    function setInlineStyles(svg, emptySvgDeclarationComputed) {
        // hardcode computed css styles inside svg
        var allElements = traverse(svg);
        var i = allElements.length;
        while (i--) {
            explicitlySetStyle(allElements[i]);
        }

        function explicitlySetStyle(element) {
            var cSSStyleDeclarationComputed = getComputedStyle(element);
            var i, len, key, value;
            var computedStyleStr = "";
            for (i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
                key = cSSStyleDeclarationComputed[i];
                value = cSSStyleDeclarationComputed.getPropertyValue(key);
                if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
                    computedStyleStr += key + ":" + value + ";";
                }
            }
            element.setAttribute("style", computedStyleStr);
        }

        function traverse(obj) {
            var tree = [];
            tree.push(obj);
            visit(obj);

            function visit(node) {
                if (node && node.hasChildNodes()) {
                    var child = node.firstChild;
                    while (child) {
                        if (child.nodeType === 1 && child.nodeName != "SCRIPT") {
                            tree.push(child);
                            visit(child);
                        }
                        child = child.nextSibling;
                    }
                }
            }
            return tree;
        }
    }

}

function getTodayDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = "0" + dd;
    }
    if (mm < 10) {
        mm = "0" + mm;
    }
    return yyyy + "-" + mm + "-" + dd;
}

function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function(key) {
            return key + "=" + params[key]
        })
        .join("&")
}

function preloadImages(array) {
    if (!preloadImages.list) {
        preloadImages.list = [];
    }
    var list = preloadImages.list;
    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function() {
            var index = list.indexOf(this);
            if (index !== -1) {
                // remove image from the array once it's loaded
                // for memory consumption reasons
                list.splice(index, 1);
            }
        }
        list.push(img);
        img.src = array[i];
    }
}

function getSummary() {
    let testSummary = {
        "cate1CateNum": 0,
        "cate1CateTest": 0,
        "cate1TestNum": 0,
        "cate1TestPass": 0,
        "cate2CateNum": 0,
        "cate2CateTest": 0,
        "cate2TestNum": 0,
        "cate2TestPass": 0,
        "cate3CateNum": 0,
        "cate3CateTest": 0,
        "cate3TestNum": 0,
        "cate3TestPass": 0
    }
    let requestParams = {
        envir: document.querySelector(".naviActive").textContent,
        testDate: document.querySelector("#chooseDay").value
    }

    let reportReq = new XMLHttpRequest();
    reportReq.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let latestReports = JSON.parse(this.responseText);
            let cateReq = new XMLHttpRequest();
            cateReq.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let testCate = {
                        testName: "QA Category",
                        child: JSON.parse(this.responseText)
                    }
                    let reportCount = [];
                    for (let i = 0; i < latestReports.length; i++) {
                        let report = latestReports[i];
                        if (reportCount[report.testID] === undefined) {
                            reportCount[report.testID] = {
                                pass: 0,
                                total: 0
                            }
                            if (report.testResult === "Pass") {
                                reportCount[report.testID].pass++;
                            }
                            reportCount[report.testID].total++;
                        } else {
                            if (report.testResult === "Pass") {
                                reportCount[report.testID].pass++;
                            }
                            reportCount[report.testID].total++;
                        }
                    }

                    let depthObj = [testCate];
                    let arr = [0];
                    while (depthObj.length > 0) {
                        if (arr[arr.length - 1] <= depthObj[depthObj.length - 1].child.length - 1) {
                            let tempObj = depthObj[depthObj.length - 1].child[arr[arr.length - 1]];
                            if (tempObj.hasOwnProperty("child")) {
                                depthObj.push(tempObj);
                                arr.push(0);
                            } else {
                                if (arr[0] === 0) {
                                    testSummary.cate1CateNum++;
                                } else if (arr[0] === 1) {
                                    testSummary.cate2CateNum++;
                                } else if (arr[0] === 2) {
                                    testSummary.cate3CateNum++;
                                }
                                if (reportCount[tempObj.id] != undefined) {
                                    let count = reportCount[tempObj.id];
                                    if (arr[0] === 0) {
                                        testSummary.cate1CateTest++;
                                        testSummary.cate1TestNum += count.total;
                                        testSummary.cate1TestPass += count.pass;
                                    } else if (arr[0] === 1) {
                                        testSummary.cate2CateTest++;
                                        testSummary.cate2TestNum += count.total;
                                        testSummary.cate2TestPass += count.pass;
                                    } else if (arr[0] === 2) {
                                        testSummary.cate3CateTest++;
                                        testSummary.cate3TestNum += count.total;
                                        testSummary.cate3TestPass += count.pass;
                                    }
                                }
                                arr[arr.length - 1]++;
                            }
                        } else {
                            arr.pop();
                            depthObj.pop();
                            arr[arr.length - 1]++;
                        }
                    }
                    let modal;
                    if (document.getElementById("modal") === null) {
                        modal = d3.select("body").append("div").attr("id", "modal");
                    } else {
                        modal = d3.select("#modal");
                    }
                    modal.attr("class", "ui modal");
                    let rates = [];
                    rates[0] = [testSummary.cate1CateTest, testSummary.cate1CateNum];
                    rates[1] = [testSummary.cate2CateTest, testSummary.cate2CateNum];
                    rates[2] = [testSummary.cate3CateTest, testSummary.cate3CateNum];
                    rates[3] = [(testSummary.cate1TestPass + testSummary.cate2TestPass + testSummary.cate3TestPass), (testSummary.cate1TestNum + testSummary.cate2TestNum + testSummary.cate3TestNum)];
                    for (let i = 0; i < 4; i++) {
                        createGauge(i, modal, rates[i]);
                    }
                    $("#modal").modal("show");
                }
            }
            cateReq.open("GET", "./getTestName");
            cateReq.send();
        }
    }
    reportReq.open("GET", "./getLatestReports" + formatParams(requestParams));
    reportReq.send();

    function createGauge(index, modal, counts) {
        let div, gauge;
        let divID = "gaugeBlock" + index;
        let gaugeID = "gauge" + index;
        let rate = counts[1] === 0 ? 0 : counts[0] / counts[1];
        if (document.getElementById(gaugeID) === null) {
            div = modal.append("div").attr("id", divID).attr("class", "gaugeBlock");
            let icon = modal.append("i").attr("class", "close icon");
            if (index === 0) {
                div.append("div").attr("class", "gaugeDesc").text("Category 1 coverage:");
                div.append("div").attr("class", "gaugeInfo").text(counts[1] + " areas, " + counts[0] + " tested.");
            } else if (index === 1) {
                div.append("div").attr("class", "gaugeDesc").text("Category 2 coverage:");
                div.append("div").attr("class", "gaugeInfo").text(counts[1] + " areas, " + counts[0] + " tested.");
            } else if (index === 2) {
                div.append("div").attr("class", "gaugeDesc").text("Category 3 coverage:");
                div.append("div").attr("class", "gaugeInfo").text(counts[1] + " areas, " + counts[0] + " tested.");
            } else {
                div.append("div").attr("class", "gaugeDesc").text("Total tests pass rate:");
                if (counts[1] === 1) {
                    div.append("div").attr("class", "gaugeInfo").text(counts[1] + " test, " + counts[0] + " passed.");
                } else {
                    div.append("div").attr("class", "gaugeInfo").text(counts[1] + " tests, " + counts[0] + " passed.");
                }
            }
            gauge = div.append("svg").attr("id", gaugeID).attr("class", "gauge");
        } else {
            div = d3.select("#" + divID);
            gauge = d3.select("#" + gaugeID);
            div.select("div.gaugeInfo").text(function() {
                let tempStr = this.textContent;
                let strCol = tempStr.split(/[0-9_]+/);
                tempStr = counts[1] + strCol[1] + counts[0] + strCol[2];
                return tempStr;
            });
        }

        let config = liquidFillGaugeDefaultSettings();
        config.circleColor = d3.interpolateBuGn(rate * 0.6 + 0.1);
        config.textColor = d3.interpolateBuGn(rate * 0.5 + 0.1);
        config.waveColor = d3.interpolateBuGn(rate * 0.7 + 0.2);
        config.waveTextColor = d3.interpolateBuGn(rate / 4);
        loadLiquidFillGauge(gauge, Math.round(rate * 100), config);
    }

    function liquidFillGaugeDefaultSettings() {
        return {
            minValue: 0, // The gauge minimum value.
            maxValue: 100, // The gauge maximum value.
            circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
            circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            circleColor: "#178BCA", // The color of the outer circle.
            waveHeight: 0.1, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 2, // The number of full waves per width of the wave circle.
            waveRiseTime: 2000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 1500, // The amount of time in milliseconds for a full wave to enter the wave circle.
            waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
            waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
            waveAnimate: true, // Controls if the wave scrolls or is static.
            waveColor: "#178BCA", // The color of the fill wave.
            waveOffset: .25, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
            textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
            textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
            valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
            displayPercent: true, // If true, a % symbol is displayed after the value.
            textColor: "#045681", // The color of the value text when the wave does not overlap it.
            waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
        };
    }

    function loadLiquidFillGauge(element, value, config) {
        if (config == null) config = liquidFillGaugeDefaultSettings();
        const gauge = element;
        const elementId = gauge.node().id;
        if (gauge.node().childNodes.length > 0) {
            for (let i = 0; i < gauge.node().childNodes.length; i++) {
                const element = gauge.node().childNodes[i];
                gauge.node().removeChild(element);
            }
        }
        const height = parseInt(gauge.style("width").substring(0, gauge.style("width").length - 2));
        const width = parseInt(gauge.style("height").substring(0, gauge.style("height").length - 2));
        const radius = Math.min(height, width) / 2;
        const locationX = width / 2 - radius;
        const locationY = height / 2 - radius;
        const fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;

        let waveHeightScale = null;
        if (config.waveHeightScaling) {
            waveHeightScale = d3.scaleLinear()
                .range([0, config.waveHeight, 0])
                .domain([0, 50, 100]);
        } else {
            waveHeightScale = d3.scaleLinear()
                .range([config.waveHeight, config.waveHeight])
                .domain([0, 100]);
        }

        const textPixels = (config.textSize * radius / 2);
        const textFinalValue = parseFloat(value).toFixed(2);
        const textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
        const percentText = config.displayPercent ? "%" : "";
        const circleThickness = config.circleThickness * radius;
        const circleFillGap = config.circleFillGap * radius;
        const fillCircleMargin = circleThickness + circleFillGap;
        const fillCircleRadius = radius - fillCircleMargin;
        const waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

        const waveLength = fillCircleRadius * 2 / config.waveCount;
        const waveClipCount = 1 + config.waveCount;
        const waveClipWidth = waveLength * waveClipCount;

        // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
        let textRounder = function(value) {
            return Math.round(value);
        };
        if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
            textRounder = function(value) {
                return parseFloat(value).toFixed(1);
            };
        }
        if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
            textRounder = function(value) {
                return parseFloat(value).toFixed(2);
            };
        }

        // Data for building the clip wave area.
        const data = [];
        for (let i = 0; i <= 40 * waveClipCount; i++) {
            data.push({
                x: i / (40 * waveClipCount),
                y: (i / (40))
            });
        }

        // Scales for drawing the outer circle.
        const gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
        const gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);

        // Scales for controlling the size of the clipping path.
        const waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
        const waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);

        // Scales for controlling the position of the clipping path.
        const waveRiseScale = d3.scaleLinear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
            .domain([0, 1]);
        const waveAnimateScale = d3.scaleLinear()
            .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
            .domain([0, 1]);

        // Scale for controlling the position of the text within the gauge.
        const textRiseScaleY = d3.scaleLinear()
            .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
            .domain([0, 1]);

        // Center the gauge within the parent SVG.
        const gaugeGroup = gauge.append("g")
            .attr("transform", "translate(" + locationX + "," + locationY + ")");

        // Draw the outer circle.
        const gaugeCircleArc = d3.arc()
            .startAngle(gaugeCircleX(0))
            .endAngle(gaugeCircleX(1))
            .outerRadius(gaugeCircleY(radius))
            .innerRadius(gaugeCircleY(radius - circleThickness));
        gaugeGroup.append("path")
            .attr("d", gaugeCircleArc)
            .style("fill", config.circleColor)
            .attr("transform", "translate(" + radius + "," + radius + ")");

        // Text where the wave does not overlap.
        const text1 = gaugeGroup.append("text")
            .text(textRounder(textStartValue) + percentText)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", textPixels + "px")
            .style("fill", config.textColor)
            .attr("transform", "translate(" + radius + "," + textRiseScaleY(config.textVertPosition) + ")");
        let text1InterpolatorValue = textStartValue;


        // The clipping wave area.
        const clipArea = d3.area()
            .x(function(d) {
                return waveScaleX(d.x);
            })
            .y0(function(d) {
                return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
            })
            .y1(function(d) {
                return (fillCircleRadius * 2 + waveHeight);
            });
        const waveGroup = gaugeGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + elementId);
        const wave = waveGroup.append("path")
            .datum(data)
            .attr("d", clipArea)
            .attr("T", 0);

        // The inner circle with the clipping wave attached.
        const fillCircleGroup = gaugeGroup.append("g")
            .attr("clip-path", "url(#clipWave" + elementId + ")");
        fillCircleGroup.append("circle")
            .attr("cx", radius)
            .attr("cy", radius)
            .attr("r", fillCircleRadius)
            .style("fill", config.waveColor);

        // Text where the wave does overlap.
        const text2 = fillCircleGroup.append("text")
            .text(textRounder(textStartValue))
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", textPixels + "px")
            .style("fill", config.waveTextColor)
            .attr("transform", "translate(" + radius + "," + textRiseScaleY(config.textVertPosition) + ")");
        let text2InterpolatorValue = textStartValue;

        // Make the value count up.
        if (config.valueCountUp) {
            text1.transition()
                .duration(config.waveRiseTime)
                .tween("text", function() {
                    const i = d3.interpolateNumber(text1InterpolatorValue, textFinalValue);
                    return function(t) {
                        text1InterpolatorValue = textRounder(i(t));
                        // Set the gauge's text with the new value and append the % sign
                        // to the end
                        text1.text(text1InterpolatorValue + percentText);
                    }
                });
            text2.transition()
                .duration(config.waveRiseTime)
                .tween("text", function() {
                    const i = d3.interpolateNumber(text2InterpolatorValue, textFinalValue);
                    return function(t) {
                        text2InterpolatorValue = textRounder(i(t));
                        // Set the gauge's text with the new value and append the % sign
                        // to the end                
                        text2.text(text2InterpolatorValue + percentText);
                    }
                });
        }

        // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
        const waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
        if (config.waveRise) {
            waveGroup.attr("transform", "translate(" + waveGroupXPosition + "," + waveRiseScale(0) + ")")
                .transition()
                .duration(config.waveRiseTime)
                .attr("transform", "translate(" + waveGroupXPosition + "," + waveRiseScale(fillPercent) + ")")
                .on("start", function() {
                    wave.attr("transform", "translate(1,0)");
                }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else {
            waveGroup.attr("transform", "translate(" + waveGroupXPosition + "," + waveRiseScale(fillPercent) + ")");
        }

        if (config.waveAnimate) animateWave();

        function animateWave() {
            wave.attr("transform", "translate(" + waveAnimateScale(wave.attr("T")) + ",0)");
            wave.transition()
                .duration(config.waveAnimateTime * (1 - wave.attr("T")))
                .ease(d3.easeLinear)
                .attr("transform", "translate(" + waveAnimateScale(1) + ",0)")
                .attr("T", 1)
                .on("end", function() {
                    wave.attr("T", 0);
                    animateWave(config.waveAnimateTime);
                });
        }
    }
}