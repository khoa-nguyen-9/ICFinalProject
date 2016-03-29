var request = require("request")
var officegen = require('officegen');
var fs = require('fs');

var url = "https://f7213345-5d80-4e5c-850f-712dec73b6d6:CCSLbDnHpJXG@gateway.watsonplatform.net/retrieve-and-rank/api/v1/" 
+ "solr_clusters/scb567fb0f_0dd0_4c23_a773_872cf686e784/solr/yeast_sample_collection/"
+ "select?q=What is regulator of FBP1&wt=json&fl=id,body";
//+ "fcselect?ranker_id=42AF7Ex10-rank-1028&q=What is regulator of FBP1&wt=json&fl=id,body";

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
        var FILENAME = "result/" + 'results6_' + day + "_" + monthIndex + "_" + year +".xlsx";
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