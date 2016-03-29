var request = require("request")
var officegen = require('officegen');
var fs = require('fs');

var url = "https://783c5984-daa9-4334-93d6-ac6f87c0b4d7:uegcY7FvU5gz@gateway.watsonplatform.net/retrieve-and-rank/api/v1/" 
+ "solr_clusters/sc8864bebe_b5f1_45c5_8428_a43b53bf9212/solr/example-collection/"
+ "select?q=What is regulator of FBP1&wt=json&fl=id,body";

request({
    url: url,
    json: true
}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
    	var xlsx = officegen ( 'xlsx' );
		sheet = xlsx.makeNewSheet ();
		sheet.name = 'results';
		for(var i = 0; i < body.response.docs.length;i++){
			sheet.data[i] = [];
			sheet.data[i][0] = body.response.docs[i].id;
			sheet.data[i][1] = body.response.docs[i].body[0];
		}
    	 // Print the json response
    	var date = new Date();
    	var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
        var FILENAME = "result/" + 'results5_' + day + "_" + monthIndex + "_" + year +".xlsx";
        var out = fs.createWriteStream(FILENAME);
        xlsx.generate(out, {
        	'finalize': function ( written ) {
                console.log ( 'Finish to create a xlsx file.\nTotal bytes created: ' + written + '\n' );
            },
            	'error': function ( err ) {
            	console.log ( err );
            }
        });
    }
})