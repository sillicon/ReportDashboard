function pageLoad() {
    var tempStr = getTodayDate();
    if ($('#chooseDay')[0].type != 'date') {
        $('#chooseDay').datepicker();
        $("#chooseDay").datepicker("option", "maxDate", new Date());
    } else {
        document.querySelector("#chooseDay").max = tempStr;
    }
    document.querySelector("#chooseDay").value = tempStr;
    //detect browsers
    // Opera 8.0+
    isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    isFirefox = typeof InstallTrigger !== 'undefined';
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    isSafari = /constructor/i.test(window.HTMLElement) || (function(p) {
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
    document.querySelector("body").addEventListener("click", function(e) {
        if (e.target.tagName != "path") {
            document.querySelector("#reportList").style.display = "none";
        }
    });
    //preload image
    var preImg = ["./images/tick.svg", "./images/cross.svg", "./images/question.svg", "./images/leftarrow.svg", "./images/info.svg", "./images/github.svg", "./images/comment.svg"];
    preloadImages(preImg);
    //load user profile
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
        document.querySelector("#buttonGroup2").style.display = "none";
    } else if (element.id == "categoryView") {
        document.querySelector("#cardView").setAttribute("class", "");
        document.querySelector("#buttonGroup2").style.display = "inline-block";
    } else {
        document.querySelector("#buttonGroup2 .buttonSelected").setAttribute("class", "");
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
    document.querySelector("#contentPane").innerHTML = "<div id =\"loader\" class=\"loader\"></div>";
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
                            if (resultList[i].hasOwnProperty("loginURL")) {
                                depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child.push({
                                    loginURL: resultList[i].loginURL
                                });
                            } else if (resultList[i].hasOwnProperty("issueURL")) {
                                depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child.push({
                                    issueURL: resultList[i].issueURL,
                                    issueName: resultList[i].issueName,
                                    labels: resultList[i].labels,
                                    milestone: resultList[i].milestone,
                                    author: resultList[i].author,
                                    assignees: resultList[i].assignees
                                });
                            } else {
                                depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child.push({
                                    testName: resultList[i].fileName,
                                    testResult: resultList[i].testResult,
                                    cateName: resultList[i].testName,
                                    uniqueID: resultList[i]._id,
                                    comments: resultList[i].comments
                                });
                                if (i == resultList.length - 1 || resultList[i].testID != resultList[i + 1].testID) {
                                    depthObj[depthObj.length - 1].child[arr[arr.length - 1]].testResult = resultList[i].testResult;
                                }
                            }
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
            var selButton = document.querySelector("#buttonGroup2 .buttonSelected");
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
                        temp.push(resultGroup[i].fileName);
                    }
                }
                return [temp];
            }).append('path')
            .attr('class', 'successArc')
            .attr('transform', 'translate(' + (width / 2 + margin.left) + ',' + (height / 2 + margin.top) + ')');
        var failArc = svg.data(function() {
                var temp = [];
                for (var i = 0; i < resultGroup.length; i++) {
                    if (resultGroup[i].testResult == "Fail") {
                        temp.push(resultGroup[i].fileName);
                    }
                }
                return [temp];
            }).append('path')
            .attr('class', 'failArc')
            .attr('transform', 'translate(' + (width / 2 + margin.left) + ',' + (height / 2 + margin.top) + ')');
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
                successArc.attr('d', arc1);
                temp1++;
            } else if (temp1 >= percent * 100 && temp2 == 0) {
                arc1.endAngle(-Math.PI * 3 / 4 + percent * Math.PI * 3 / 2);
                successArc.attr('d', arc1);
                arc2.endAngle(-Math.PI * 3 / 4 + (percent + temp2 / 100) * Math.PI * 3 / 2);
                failArc.attr('d', arc2);
                temp2++;
            } else if (temp1 + temp2 < 100) {
                arc2.endAngle(-Math.PI * 3 / 4 + (percent + temp2 / 100) * Math.PI * 3 / 2);
                failArc.attr('d', arc2);
                temp2++;
            } else if (temp1 + temp2 == 100) {
                arc2.endAngle(Math.PI * 3 / 4);
                failArc.attr('d', arc2);
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
        var noneArc = svg.append('path')
            .attr('class', 'noneArc')
            .attr('transform', 'translate(' + (width / 2 + margin.left) + ',' + (height / 2 + margin.top) + ')');
        var arc = d3.arc()
            .innerRadius(width / 2 - 30)
            .outerRadius(width / 2)
            .startAngle(-Math.PI * 3 / 4)
            .endAngle(Math.PI * 3 / 4);
        var temp = 0;
        var timer = setInterval(function() {
            if (temp < 100) {
                arc.endAngle(-Math.PI * 3 / 4 + temp / 100 * Math.PI * 3 / 2);
                noneArc.attr('d', arc);
                temp++;
            } else {
                arc.endAngle(Math.PI * 3 / 4);
                noneArc.attr('d', arc);
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
            arcElement.attr('d', arc);
        }).on("mouseout", function() {
            arc.outerRadius(width / 2);
            arcElement.attr('d', arc);
        }).on("click", function(d) {
            var div = d3.select("#reportList");
            var tempScg = svg._groups[0][0];
            var pos = d3.mouse(tempScg);
            div.html(function() {
                var tempHTML = "";
                for (var i = 0; i < d.length; i++) {
                    tempHTML += "<span><a href='.\\report\\" + d[i] + "' target='_blank'>" + d[i] + "</a></span><br>";
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
        nodeEnter.append('circle')
            .attr('class', 'treeNode')
            .attr('r', 1e-6)
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
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .attr('cursor', 'pointer')
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
                    window.open(".\\report\\" + d.data.testName);
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
        nodeUpdate.select('circle.treeNode')
            .attr('r', 10)
            .attr('cursor', 'pointer');

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
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "treeLink")
            .attr('d', function(d) {
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
            .attr('d', function(d) {
                return diagonal(d, d.parent)
            });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
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
                window.open(".\\report\\" + d.data.testName);
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
            window.open(".\\report\\" + d.data.testName);
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
        var div = document.createElement("div");
        parentNode.appendChild(div);
        div.className = ("ordinaryCard");
        if (div.parentNode != document.querySelector("#contentPane") && div.parentNode != document.querySelector("#contentPane > div")) {
            div.className += " toggled";
        }
        div.style.textAlign = "left";
        var testName = document.createElement("div");
        div.appendChild(testName);
        testName.className = "fieldTitle";
        testName.style.cursor = "pointer";
        div.style.backgroundColor = "#fafafa";
        if (!obj.hasOwnProperty("loginURL") && !obj.hasOwnProperty("issueURL")) {
            var radioButton = document.createElement("img");
            if (["Test Category 4", "Test Area 30", "Test Area 31"].indexOf(obj.testName) > -1) {
                radioButton.src = "./images/github.svg";
            } else if (obj.hasOwnProperty("testResult")) {
                if (obj.testResult === "Pass") {
                    div.style.backgroundColor = "#deffde";
                    radioButton.src = "./images/tick.svg";
                } else {
                    div.style.backgroundColor = "#ffe7e7";
                    radioButton.src = "./images/cross.svg";
                }
            } else {
                radioButton.src = "./images/question.svg";
            }
            var nameStr = document.createElement("div");
            nameStr.textContent = obj.testName;
            nameStr.style.pointerEvents = "none";
            radioButton.height = "25";
            radioButton.width = "20";
            radioButton.style.cssFloat = "left";
            radioButton.style.pointerEvents = "none";
            testName.appendChild(radioButton);
            nameStr.style.cssFloat = "left";
        } else {
            var nameStr = document.createElement("a");
            if (obj.hasOwnProperty("loginURL")) {
                testName.className += " login";
                nameStr.textContent = "Click here to authorize GitHub access";
                nameStr.href = obj.loginURL;
            } else if (obj.hasOwnProperty("issueURL")) {
                testName.className += " issueTitle";
                nameStr.textContent = obj.issueName;
                nameStr.href = obj.issueURL;
                nameStr.target = "_blank";
                nameStr.className = "issueName";
            }
        }
        testName.appendChild(nameStr);
        if (obj.hasOwnProperty("issueURL")) {
            div.appendChild(document.createElement("br"));
            for (let l = 0; l < obj.labels.length; l++) {
                var label = document.createElement("div");
                label.className = "label";
                label.textContent = obj.labels[l].name;
                label.style.backgroundColor = "#" + obj.labels[l].color;
                //check background color if it's too light
                var rgb = parseInt(obj.labels[l].color, 16); // convert rrggbb to decimal
                var r = (rgb >> 16) & 0xff; // extract red
                var g = (rgb >> 8) & 0xff; // extract green
                var b = (rgb >> 0) & 0xff; // extract blue
                var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
                if (luma > 150) {
                    label.style.color = "black";
                } else {
                    label.style.color = "white";
                }
                div.appendChild(label);
            }
            var info = document.createElement("div");
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
            div.appendChild(info);
        }

        if (obj.hasOwnProperty("child")) {
            var arrow = document.createElement("img");
            arrow.style.cssFloat = "left";
            arrow.style.pointerEvents = "none";
            arrow.height = "25";
            arrow.width = "15";
            arrow.src = "./images/leftarrow.svg";
            if (div.parentNode == document.querySelector("#contentPane")) {
                arrow.className = "expanded";
            }
            testName.appendChild(arrow);
            testName.onclick = function(e) {
                if (!(e.target.tagName === "IMG" && e.target.src.indexOf("info.svg") > 0)) {
                    var parent = e.target.parentNode;
                    if (e.target.childNodes[2].className == "") {  
                        e.target.childNodes[2].className = "expanded";
                    } else {
                        e.target.childNodes[2].className = "";
                    }
                    var cardCol = $($(parent).children().splice(1));
                    cardCol.transition({
                        animation : 'scale',
                        duration  : 300,
                        interval  : 30
                    });
                }
            }
        } else if (obj.hasOwnProperty("cateName")) {
            testName.onclick = function() {
                if (!(e.target.tagName === "IMG" && e.target.src.indexOf("comment.svg") > 0)) {
                    window.open(".\\report\\" + obj.testName);
                }
            }
            testName.style.height = "30px";
            var descrip = document.createElement("div");
            var tempCollect = obj.testName.substring(0, obj.testName.lastIndexOf(".")).match(/[a-zA-Z ]+|[0-9_]+/g)[1];
            var tempCol = tempCollect.split(/_/g);
            tempCollect = "Test Date: " + tempCol[0] + "/" + tempCol[1] + "/" + tempCol[2] + "<br>" + "Upload Time: " + tempCol[3] + ":" + tempCol[4] + ":" + tempCol[5];
            descrip.innerHTML = tempCollect;
            descrip.style.margin = "auto auto 10px 30px";
            div.appendChild(descrip);
            //create comment icon
            let commentImg = document.createElement("img");
            commentImg.height = "25";
            commentImg.width = "20";
            commentImg.style.cssFloat = "right";
            commentImg.src = "./images/comment.svg";
            commentImg.onclick = function(e) {
                let parent = e.target.parentNode;
                let commentSection = $(parent.nextElementSibling.nextElementSibling);
                commentSection.transition({
                    animation: "scale",
                    duration: 300,
                    interval: 30
                });
            }
            testName.appendChild(commentImg);
            //create comment section
            let comments = document.createElement("div");
            comments.id = "commentsHolder";
            let commentTitle = document.createElement("div");
            commentTitle.textContent = "Commnets";
            commentTitle.style.fontWeight = "bold";
            commentTitle.style.borderBottom = "1px solid #000000";
            comments.appendChild(commentTitle);
            if (obj.comments && obj.comments.length > 0) {
                for (let i = 0; i < obj.comments.length; i++) {
                    //create existing comment card
                    createCommentCard(obj.comments[i], comments, "append");
                }
            } else {
                let noComment = document.createElement("div");
                noComment.className = "commentCard nocomment";
                noComment.textContent = "No comment";
                comments.appendChild(noComment);
            }
            let currentUser = JSON.parse(sessionStorage.getItem("user"));
            let commentButton = document.createElement("div");
            commentButton.className = "cardButton";
            if (currentUser) {
                commentButton.textContent = "Comment";
                commentButton.className += " buttonDisabled";
                let avatar = document.createElement("img");
                avatar.src = currentUser.photos[0].value;
                avatar.className = "avatar";
                comments.appendChild(avatar);
                let textBox = document.createElement("textarea");
                textBox.placeholder = "Leave a comment";
                textBox.maxLength = 255;
                textBox.oninput = function (e) {
                    if (e.target.value != "") {
                        commentButton.className = "cardButton";
                    } else {
                        commentButton.className = "cardButton buttonDisabled";
                    }
                }
                comments.appendChild(textBox);
                commentButton.onclick = function(e) {
                    e.target.className = "cardButton buttonDisabled";
                    let requestJSON = {
                        _id: obj.uniqueID,
                        commenter: JSON.parse(sessionStorage.getItem("user")).displayName,
                        commentText: e.target.previousElementSibling.value
                    }
                    let xmlHTTP = new XMLHttpRequest();
                    xmlHTTP.open("POST", "./publishComment");
                    xmlHTTP.setRequestHeader("Content-Type", "application/json");
                    xmlHTTP.send(JSON.stringify(requestJSON));
                    xmlHTTP.onreadystatechange = function () {
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
                            e.target.className = "cardButton";
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
            div.appendChild(comments);
        }
        if (obj.hasOwnProperty("id") && ["Test Area 30", "Test Area 31"].indexOf(obj.testName) < 0) {
            var infoButton = document.createElement("a");
            infoButton.href = "https://github.com/sillicon";
            infoButton.target = '_blank';
            var infoIcon = document.createElement("img");
            infoIcon.height = "25";
            infoIcon.width = "20";
            infoIcon.style.cssFloat = "right";
            infoIcon.src = "./images/info.svg";
            infoButton.appendChild(infoIcon);
            testName.appendChild(infoButton);
        }
        return div;
    }

    function createCommentCard(input, targetElement, position) {
        let existComment = document.createElement("div");
        existComment.className = "commentCard";
        let coAvatar = document.createElement("div");
        let coName = document.createElement("label");
        let coTimelabel = document.createElement("label");
        let coText = document.createElement("div");
        coAvatar.textContent = input.commenter.substring(0, 1).toUpperCase();
        coAvatar.style.backgroundColor = "hsl(" + Math.abs(parseInt(hashCode(input.commenter.substr(-7)), 16) / 0xfffffff) + ", 50%, 70%)";
        coAvatar.className = "coAvatar";
        coName.textContent = input.commenter;
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
        .attr('cursor', 'pointer');

    cell.append("title")
        .text(function(d) {
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
            window.open(".\\report\\" + d.data.testName);
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
    var imgsrc = 'data:image/svg+xml;utf8,' + html;
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
            element.setAttribute('style', computedStyleStr);
        }

        function traverse(obj) {
            var tree = [];
            tree.push(obj);
            visit(obj);

            function visit(node) {
                if (node && node.hasChildNodes()) {
                    var child = node.firstChild;
                    while (child) {
                        if (child.nodeType === 1 && child.nodeName != 'SCRIPT') {
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
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
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