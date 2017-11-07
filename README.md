# QAReportCenter
This repo is the souce code of Online Team's Automated Tests Storing site.
It uses Node.JS with Express v4 framework to provide RESTful website experience.
The QA reports can be queried and visualized as chart using D3.js.

Ways to setup development environment:<br>
Download zip file, then in folder directory, use `npm install` to get necessary node modules.<br>
While debugging, use `launch.json` settings to launch the node server.

Ways to deploy in Windows environment:<br>
This app is being held on [iisnode](https://github.com/tjanczuk/iisnode)
Simply install iisnode on a Windows machine, and put this folder(with node modules) into wwwroot folder, and everything is done.
