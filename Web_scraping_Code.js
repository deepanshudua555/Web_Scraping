////////////8th, 9th ans 10th october bhi isi me hai/////////////////


// The purpose of this project is to extract information of worldcup 2019 from cricinfo and present
// that in the form of excel and pdf scorecards.
// the real purpose is to learn how to extract information and get experience with java script
// A very good reason to ever make a project is to have GOOD FUN

// npm init -y
// npm install minimist
// npm install axios
// npm install jsdom
// npm install excel4node
// npm install pdf-lib

//node Web_scraping_Code.js --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results --dest=Worldcup.csv --dataDir=WorldCup

let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let excel = require("excel4node");
let pdf = require("pdf-lib");
let fs = require("fs");
let path = require('path');

let args = minimist(process.argv);


// download using axios 
// read using jsdom
//maniplate data using array function
// make excel using excel4node
// make pdf using pdf-lib

let responceKaPromice = axios.get(args.source);
responceKaPromice.then(function (responce) {
    // if(responce.sta tusCode!=200){
    //     return;
    // }
    let html = responce.data;
    // console.log(html);
    let dom = new jsdom.JSDOM(html);
    let document = dom.window.document;
    // let title = document.title;
    // console.log(title);
    let matchinfoDivs = document.querySelectorAll("div.match-score-block");
    // console.log(matchinfoDivs.length);
    let matches = [];
    for (let i = 0; i < matchinfoDivs.length; i++) {
        let match = {
            t1: "",
            t2: "",
            t1s: "",
            t2s: "",
            result: "",

        };

        let namePs = matchinfoDivs[i].querySelectorAll("p.name");
        match.t1 = namePs[0].textContent;
        match.t2 = namePs[1].textContent;

        let scoreSpan = matchinfoDivs[i].querySelectorAll("div.score-detail > span.score");
        if (scoreSpan.length == 2) {
            match.t1s = scoreSpan[0].textContent;
            match.t2s = scoreSpan[1].textContent;
        } else if (scoreSpan.length == 1) {
            match.t1s = scoreSpan[0].textContent;
            match.t2s = "";
        } else {
            match.t1s = "";
            match.t2s = "";

        }

        let spanResult = matchinfoDivs[i].querySelector("div.status-text > span");
        match.result = spanResult.textContent;

        matches.push(match);
    }

    let matchesJSON = JSON.stringify(matches);
    fs.writeFileSync("matches.json", matchesJSON, "utf-8");
    let teams = [];
    for (let i = 0; i < matches.length; i++) {
        populateTeams(teams, matches[i]);
    }
    for (let i = 0; i < matches.length; i++) {
        putMatchInAppteams(teams, matches[i]);
    }

    let teamsJSON = JSON.stringify(teams);
    fs.writeFileSync("teams.json", teamsJSON, "utf-8");

    //creating excel file
    creatExcelFile(teams);
    //creating folders and pdfs 
    PrepareFoldersAndPdfs(teams, args.dataDir);
}).catch(function (err) {
    console.log(err);
})

function PrepareFoldersAndPdfs(teams, dataDir) {
    if (fs.existsSync(dataDir) == false) {

        fs.mkdirSync(dataDir);
    }


    for (let i = 0; i < teams.length; i++) {
        let teamsFolder = path.join(dataDir, teams[i].name);
        if (fs.existsSync(teamsFolder) == false) {
            fs.mkdirSync(teamsFolder);
        }
        for (let j = 0; j < teams[i].matches.length; j++) {
            let match = teams[i].matches[j];
            creatMatchScoreCardPdf(teamsFolder, teams[i].name,match);
        }
    }
}

function creatMatchScoreCardPdf(teamsFolder,sname , match) {
    let matchFileName = path.join(teamsFolder, match.vs + ".pdf");
    let templatefilebytes = fs.readFileSync("Template.pdf");
    let pdfDocpromice = pdf.PDFDocument.load(templatefilebytes);
    pdfDocpromice.then(function (pdfdoc) {
        let page = pdfdoc.getPage(0);
        page.drawText(sname, {
            x: 320,
            y: 667,
            size: 11,
        });
        page.drawText(match.vs, {
            x: 320,
            y: 641,
            size: 11,
        });
        page.drawText(match.selfScore, {
            x: 320,
            y: 615,
            size: 11,
        });
        page.drawText(match.oppScore, {
            x: 320,
            y: 589,
            size: 11,
        });
        page.drawText(match.result, {
            x: 320,
            y:563,
            size: 11,
        });
        let Promicetosave = pdfdoc.save();
        Promicetosave.then(function (changedByte) {
            fs.writeFileSync(matchFileName, changedByte);
        });
    });


        // fs.writeFileSync(matchFileName, "", "utf-8");
}

function creatExcelFile(teams) {
    let wb = new excel.Workbook();
    // let hstyle = wb.createStyle({
    //     font: {
    //         color: "red"
    //     },
    //     fill: {
    //         type: "pattern",
    //         patternType: "solid",
    //         fgColor: "blue"
    //     }
    // });


    for (let i = 0; i < teams.length; i++) {
        let sheet = wb.addWorksheet(teams[i].name);
        sheet.cell(1, 1).string("VS");
        sheet.cell(1, 2).string("Self Score");
        sheet.cell(1, 3).string("Opponent Score");
        sheet.cell(1, 4).string("Result");


        for (let j = 0; j < teams[i].matches.length; j++) {


            sheet.cell(2 + j, 1).string(teams[i].matches[j].vs);
            sheet.cell(2 + j, 2).string(teams[i].matches[j].selfScore);
            sheet.cell(2 + j, 3).string(teams[i].matches[j].oppScore);
            sheet.cell(2 + j, 4).string(teams[i].matches[j].result);
        }
    }
    wb.write(args.dest);
}

function populateTeams(teams, match) {
    let t1idx = teams.findIndex(function (team) {
        if (team.name == match.t1) {
            return true;
        } else {
            return false;
        }
    });
    if (t1idx == -1) {
        let team = {
            name: match.t1,
            matches: []
        };
        teams.push(team);
    }
    let t2idx = teams.findIndex(function (team) {
        if (team.name == match.t2) {
            return true;
        } else {
            return false;
        }
    });
    if (t2idx == -1) {
        let team = {
            name: match.t2,
            matches: []
        };
        teams.push(team);
    }
}

function putMatchInAppteams(teams, match) {
    let t1idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t1) {
            t1idx = i;
            break;
        }
    }
    let team1 = teams[t1idx];
    team1.matches.push({
        vs: match.t2,
        selfScore: match.t1s,
        oppScore: match.t2s,
        result: match.result

    });
    let t2idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t2) {
            t2idx = i;
            break;
        }
    }
    let team2 = teams[t2idx];
    team2.matches.push({
        vs: match.t1,
        selfScore: match.t2s,
        oppScore: match.t1s,
        result: match.result

    });
}