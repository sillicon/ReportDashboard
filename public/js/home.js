function pageLoad() {
    var hash = window.location.hash.substr(1);
    if (hash == "envir2") {
        changeEnvir(document.querySelector("#envir2"));
    } else if (hash == "envir3") {
        changeEnvir(document.querySelector("#envir3"));
    } else {
        checkTestArea();
    }
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
    document.querySelector("body").addEventListener("click", function (e) {
        if (e.target.tagName != "path") {
            document.querySelector("#reportList").style.display = "none";
        }
    });
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
        document.querySelector("#sunburstView").style.display = "none";
        document.querySelector("#circlePackView").style.display = "none";
        document.querySelector("#treeView").style.display = "none";
        document.querySelector("#ordinaryView").style.display = "none";
    } else if (element.id == "categoryView") {
        document.querySelector("#cardView").setAttribute("class", "");
        document.querySelector("#sunburstView").style.display = "block";
        document.querySelector("#circlePackView").style.display = "block";
        document.querySelector("#treeView").style.display = "block";
        document.querySelector("#ordinaryView").style.display = "block";
    } else {
        document.querySelector("#sunburstView").setAttribute("class", "");
        document.querySelector("#circlePackView").setAttribute("class", "");
        document.querySelector("#treeView").setAttribute("class", "");
        document.querySelector("#ordinaryView").setAttribute("class", "");
    }
    element.setAttribute("class", "buttonSelected");
    checkTestArea();
}

function checkTestArea() {
    var dayNow = new Date();
    var tempStr = dayNow.getFullYear() + "-" + (dayNow.getMonth() + 1) + "-" + dayNow.getDate();
    var requestParams = {
        envir: document.querySelector(".naviActive").textContent,
        testDate: tempStr
    }
    var envir = document.querySelector(".naviActive").textContent;
    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var resultList = JSON.parse(this.responseText);
            if (document.querySelector("#categoryView").className == "buttonSelected") {
                d3.json("getTestName", function (error, root) {
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
                                if (depthObj[depthObj.length - 1].child[arr[arr.length - 1]].hasOwnProperty("child") && !depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child[0].hasOwnProperty("cateName")) {
                                    depthObj.push(depthObj[depthObj.length - 1].child[arr[arr.length - 1]]);
                                    arr.push(0);
                                } else if (depthObj[depthObj.length - 1].child[arr[arr.length - 1]].id == resultList[i].testID) {
                                    if (!depthObj[depthObj.length - 1].child[arr[arr.length - 1]].hasOwnProperty("child")) {
                                        depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child = [];
                                    }
                                    depthObj[depthObj.length - 1].child[arr[arr.length - 1]].child.push({
                                        testName: resultList[i].fileName,
                                        testResult: resultList[i].testResult,
                                        cateName: resultList[i].testName
                                    });
                                    if (i == resultList.length - 1 || resultList[i].testID != resultList[i + 1].testID) {
                                        depthObj[depthObj.length - 1].child[arr[arr.length - 1]].testResult = resultList[i].testResult;
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
                                    if (depthObj[depthObj.length - 1].child[j].hasOwnProperty("testResult") && (!depthObj[depthObj.length - 1].hasOwnProperty("testResult") || depthObj[depthObj.length - 1].child[j].testResult == "Fail")) {
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
                    if (document.querySelector("#treeView").className == "buttonSelected") {
                        // createTree(tempObj);
                        createCollapseTree(tempObj);
                    } else if (document.querySelector("#circlePackView").className == "buttonSelected") {
                        createCirclePack(tempObj);
                    } else if (document.querySelector("#sunburstView").className == "buttonSelected") {
                        createSunburst(tempObj);
                    } else if (document.querySelector("#ordinaryView").className == "buttonSelected") {
                        createOrdinary(tempObj);
                    }
                });
            } else {
                var getFullList = new XMLHttpRequest();
                getFullList.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var getList = JSON.parse(this.responseText);
                        var fullList = Object.keys(getList).map(function (key) {
                            return getList[key];
                        });
                        document.querySelector("#contentPane").innerHTML = "";
                        if (resultList.length != 0) {
                            fullList.splice(fullList.indexOf(resultList[0].testName), 1);
                            var passCount = resultList[0].testResult == "Pass" ? 1 : 0;
                            var resultGroup = [resultList[0]];
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
                        fullList.sort(function (a, b) {
                            if (a > b) {
                                return 1;
                            } else if (a < b) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });
                        for (var i = 0; i < fullList.length; i++) {
                            var element = fullList[i];
                            createCard(0, [], fullList[i]);
                        }
                    } else if (this.readyState == 4) {
                        document.querySelector("#contentPane").innerHTML = this.responseText;
                    }
                }
                getFullList.open("GET", "./getIDRef");
                getFullList.send();
            }
        } else if (this.readyState == 4) {
            document.querySelector("#contentPane").innerHTML = this.responseText;
        }
    }
    xmlHTTP.open("GET", "./getLatestReports" + formatParams(requestParams));
    xmlHTTP.send();
    document.querySelector("#contentPane").innerHTML = "<div id =\"loader\" class=\"loader\"></div>";
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
            .text(function () {
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
            .text(function () {
                if (passCount < totalTest) {
                    return "Fail";
                }
                return "Pass";
            });
        var strWidth2 = resultLabel.node().getComputedTextLength();
        resultLabel.attr("x", svgWidth / 2 - strWidth2 / 2);
        var successArc = svg.data(function () {
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
        var failArc = svg.data(function () {
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
        var timer = setInterval(function () {
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
        var timer = setInterval(function () {
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
        arcElement.on("mouseover", function () {
            arc.outerRadius(width / 2 + 5);
            arcElement.attr('d', arc);
        }).on("mouseout", function () {
            arc.outerRadius(width / 2);
            arcElement.attr('d', arc);
        }).on("click", function (d) {
            var div = d3.select("#reportList");
            var tempScg = svg._groups[0][0];
            var pos = d3.mouse(tempScg);
            div.html(function () {
                var tempHTML = "";
                for (var i = 0; i < d.length; i++) {
                    tempHTML += "<span><a href='.\\report\\" + d[i] + "' target='_blank'>" + d[i] + "</a></span><br>";
                }
                return tempHTML;
            });
            div.style("display", "block");
            div.style("left", function () {
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
            div.style("top", function () {
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
            .x(function (d) {
                return d.y;
            })
            .y(function (d) {
                return d.x;
            }));
    var node = g.selectAll(".treeNode")
        .data(jsonObj.descendants())
        .enter().append("g")
        .attr("class", function (d) {
            return "treeNode" + (d.children ? " treeNode--internal" : " treeNode--leaf");
        })
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        })

    node.append("circle")
        .attr("r", 2.5);

    node.append("text")
        .attr("dy", 3)
        .attr("x", function (d) {
            return d.children ? -8 : 8;
        })
        .style("text-anchor", function (d) {
            return d.children ? "end" : "start";
        })
        .text(function (d) {
            return d.data.testName;
        });
}

function createCollapseTree(jsonObj) {
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
        nodes.forEach(function (d) {
            d.y = d.depth * 180;
        });

        // Update the nodes…
        var node = svg.selectAll("g.treeNode")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "treeNode")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'treeNode')
            .attr('r', 1e-6)
            .style("fill", function (d) {
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
            .attr("x", function (d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .attr('cursor', 'pointer')
            .text(function (d) {
                return d.data.testName;
            })
            .on("click", function (d) {
                if (d.data.hasOwnProperty("cateName")) {
                    window.open(".\\report\\" + d.data.testName);
                }
            });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.treeNode')
            .attr('r', 10)
            .attr('cursor', 'pointer');

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.treeLink")
            .data(links, function (d) {
                return d.id;
            });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "treeLink")
            .attr('d', function (d) {
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
            .attr('d', function (d) {
                return diagonal(d, d.parent)
            });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function (d) {
                var o = {
                    x: source.x,
                    y: source.y
                }
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
        path = "M " + s.y + " " +  s.x + " C " + (s.y + d.y) / 2  + " "+ s.x + " , " + (s.y + d.y) / 2  + " " + d.x + " , " + d.y + " " + d.x;
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
        .sum(function (d) {
            if (d.child != null) {
                return 0;
            }
            return 1;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });
    var focus = jsonObj,
        nodes = pack(jsonObj).descendants(),
        view;
    var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", function (d) {
            return d.parent ? d.children ? "circlePacknode" : "circlePacknode circlePacknode--leaf" : "circlePacknode circlePacknode--root";
        })
        .style("fill", function (d) {
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
        .on("click", function (d) {
            if (focus !== d) {
                zoom(d);
                d3.event.stopPropagation();
            }
            else if (!d.children && d.data.hasOwnProperty("cateName")) {
                window.open(".\\report\\" + d.data.testName);
            };
        });
    var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "circlePacklabel")
        .style("fill-opacity", function (d) {
            return d.parent === jsonObj ? 1 : 0;
        })
        .style("display", function (d) {
            return d.parent === jsonObj ? "inline" : "none";
        })
        .text(function (d) {
            return d.data.testName;
        });
    var node = g.selectAll("circle,text");
    svg.style("background", color(0))
        .on("click", function () {
            zoom(jsonObj);
        });
    zoomTo([jsonObj.x, jsonObj.y, jsonObj.r * 2 + margin]);

    function zoom(d) {
        var focus0 = focus;
        focus = d;
        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function (d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function (t) {
                    zoomTo(i(t));
                };
            });

        transition.selectAll("text")
            .filter(function (d) {
                return d.parent === focus || this.style.display === "inline";
            })
            .style("fill-opacity", function (d) {
                return d.parent === focus ? 1 : 0;
            })
            .on("start", function (d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .on("end", function (d) {
                if (d.parent !== focus) this.style.display = "none";
            });
    }

    function zoomTo(v) {
        var k = diameter / v[2];
        view = v;
        node.attr("transform", function (d) {
            return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
        });
        circle.attr("r", function (d) {
            return d.r * k;
        });
    }
}

function createSunburst(jsonObj) {
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
        .startAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
        })
        .endAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
        })
        .innerRadius(function (d) {
            return Math.max(0, y(d.y0));
        })
        .outerRadius(function (d) {
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
    jsonObj.sum(function (d) {
        if (d.child != null) {
            return 0;
        }
        return 1;
    });
    svg.selectAll("path")
        .data(partition(jsonObj).descendants())
        .enter().append("path")
        .attr("d", arc)
        .attr("class", function (d) {
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
        .text(function (d) {
            return d.data.testName;
        });

    var text = d3.select("#contentPane svg").append("text")
        .attr("font-size", "1.3rem")
        .attr("id", "cateDescription")
        .text("QA Category")
        .attr("transform", "translate(" + svgWidth / 2+ ", 20)")
        .attr("text-anchor", "middle");

    function click(d) {
        if (!d.children && d.data.hasOwnProperty("cateName")) {
            window.open(".\\report\\" + d.data.testName);
        } else {
            svg.transition()
                .duration(750)
                .tween("scale", function () {
                    var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]),
                        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                    return function (t) {
                        x.domain(xd(t));
                        y.domain(yd(t)).range(yr(t));
                    };
                })
                .selectAll("path")
                .attrTween("d", function (d) {
                    return function () {
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
            if (obj.parent == null) {
                return obj.data.testName;
            }
            return getParent(obj.parent) + ">" + obj.data.testName;
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
            text.attr("transform", "translate(" + svgWidth / 2  + ", 20)");
        }
    }
    d3.select(self.frameElement).style("height", svgHeight + "px");
}

function createOrdinary(jsonObj) {
    var depthObj = [jsonObj];
    var divGroup = [makeDiv(jsonObj, document.querySelector("#contentPane"))]
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
        testName.className = "fieldTitle";
        var radioButton = document.createElement("div");
        var nameStr = document.createElement("div");
        if (obj.hasOwnProperty("testResult")) {
            if (obj.testResult == "Pass") {
                div.style.backgroundColor = "#deffde";
                radioButton.textContent = "\u2714";
            } else {
                div.style.backgroundColor = "#ffe7e7";
                radioButton.textContent = "\u2717";
            }
        } else {
            div.style.backgroundColor = "#f2f2f2";
            radioButton.textContent = "\u2753";
        }
        nameStr.textContent = obj.testName;
        radioButton.style.cssFloat = "left";
        radioButton.style.pointerEvents = "none";
        nameStr.style.cssFloat = "left";
        nameStr.style.pointerEvents = "none";
        testName.appendChild(radioButton);
        testName.appendChild(nameStr);
        if (obj.hasOwnProperty("child")) {
            var arrow = document.createElement("div");
            arrow.style.cssFloat = "left";
            arrow.style.pointerEvents = "none";
            arrow.textContent = "\u25C0";
            if (div.parentNode == document.querySelector("#contentPane")) {
                arrow.className = "expanded";
            }
            testName.appendChild(arrow);
            testName.style.cursor = "pointer";
            testName.onclick = function (e) {
                var parent = e.target.parentNode;
                if (e.target.childNodes[2].className == "") {
                    for (var i = 1; i < parent.childNodes.length; i++) {
                        parent.childNodes[i].className = parent.childNodes[i].className.split(" ")[0];
                    }
                    e.target.childNodes[2].className = "expanded";
                } else {
                    for (var i = 1; i < parent.childNodes.length; i++) {
                        parent.childNodes[i].className += " toggled"; 
                    }
                    e.target.childNodes[2].className = "";
                }
            }
        } else if (obj.hasOwnProperty("cateName")) {
            testName.style.cursor = "pointer";
            testName.onclick = function () {
                window.open(".\\report\\" + obj.testName);
            }
        }
        div.appendChild(testName);
        return div;
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
        .map(function (key) {
            return key + "=" + params[key]
        })
        .join("&")
}