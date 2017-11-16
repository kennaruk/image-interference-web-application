let google = require('googleapis');
let authentication = require("./authentication");

const spreadsheetId = '1_P0G1TzfUHQNx-rtLhiaVH9PHoIgc32O6nyw7Y_6BRg';
const sheet = 'Sheet1!';
const range = sheet+'A2:E2';
const sheets = google.sheets('v4');
const valueInputOption = "RAW";
exports.testAppend = (callback) => {
    authentication.authenticate().then((auth) => {
        var values = [
            [
                "วิทยาศาสตร์",
                "20",
                "ชาย"
            ]
        // Additional rows ...
        ];
        var body = {
            values: values
        };
        sheets.spreadsheets.values.append({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: valueInputOption,
            resource: body
        }, function(err, result) {
            if(err) {
                // Handle error
                console.log(err);
                callback(true);
            } else {
                console.log('%d cells appended.', result.updates.updatedCells);
                callback(false);
            }
        });
    });
}
