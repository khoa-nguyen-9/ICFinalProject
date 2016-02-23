var request = require('request');
var fs = require("fs");
var striptags = require('striptags');
var officegen = require('officegen');
var csv = require('ya-csv');

var stdin = 'http://www.yeastgenome.org/locus/S000003808/overview'

var reader = csv.createCsvFileReader('resource/SGD_features.csv', {
    'separator': ',',
    'quote': '"',
    'escape': '"',       
    'comment': '',
});

var writer = new csv.CsvWriter(process.stdout);
reader.addListener('data', function(data) {
  if (data[1] === 'ORF') {
      //writer.writeRecord([ data[3] ]);
    var stdin = 'http://www.yeastgenome.org/locus/' + data[0] +'/overview'
    //console.log(stdin);

    request(stdin, function (error, response, html) {
      console.log(data[3]);
      if (!error && response.statusCode == 200) {
/*        fs.writeFile('input.txt', html,  function(err) {
          if (err) {
            return console.error(err);
          }
        });*/
        var overviewText = html.match(/regulation_overview(.*)/);
        if((typeof overviewText !== 'undefined') && (overviewText != null)){
          var overviewParagraph = overviewText[0].match("<p>(.*)</p>");
          if(overviewParagraph !=null){
            var text = striptags(overviewParagraph[0]).replace(/ *\([^)]*\) */g, "");
            console.log(text)
            var title = data[3];

            var docx = officegen ( 'docx' );
            var pObj = docx.createP ();
            pObj.addText (text);
            var FILENAME = "resource/collection/" + title +".docx";
            var out = fs.createWriteStream(FILENAME);
            docx.generate(out, {
              'finalize': function ( written ) {
                console.log ( 'Finish to create a doc file.\nTotal bytes created: ' + written + '\n' );
              },
              'error': function ( err ) {
                console.log ( err );
              }
            });
          }
        } else {
          console.log(data[3]);
        }
      } else {
        console.log(error);
      }
    });

  }
});

