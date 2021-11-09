//node First_ExcelFile.js --source=teams.json --dest=teams.csv
// npm install excel4node
// npm install minimist
let minimist = require("minimist");
let fs = require("fs");
let excel = require("excel4node");


let args = minimist(process.argv);
// console.log(args.source);
// console.log(args.dest);

let teamsJSON = fs.readFileSync(args.source, "utf-8");
let teams = JSON.parse(teamsJSON);
// console.log(teams[0].matches[0].vs);

let wb = new excel.Workbook();
let hstyle = wb.createStyle({
    font:{
        color:"red"
    },
    fill:{
        type:"pattern",
        patternType:"solid",
        fgColor:"blue"
    }
});


for (let i = 0; i < teams.length; i++) {
    let sheet = wb.addWorksheet(teams[i].name);
    sheet.cell(2, 1).string("VS");
    sheet.cell(2, 2).string("Result");

    sheet.cell(1, 1).string("Rank");
    sheet.cell(1, 2).number(teams[i].rank);



    for (let j = 0; j < teams[i].matches.length; j++) {
        let vs = teams[i].matches[j].vs;
        let result = teams[i].matches[j].result;

        sheet.cell(3 + j, 1).string(vs);
        sheet.cell(3 + j, 2).string(result);
    }
}
wb.write(args.dest);
