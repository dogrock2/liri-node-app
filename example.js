let request = require('request');

let rxCUIurl = "https://rxnav.nlm.nih.gov/REST/rxcui?name=Tylenol";

request(rxCUIurl, function (error, response, body) {
   if (!error && response.statusCode == 200) {
       console.log(body);
   } else {
       console.log(`Error: ${error}`);
       console.log(`Status code: ${response.statusCode}`);
   }
});