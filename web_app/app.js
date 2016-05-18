'use strict';

 var express  = require('express'),
 app          = express(),
 request      = require("request"),
 watson       = require('watson-developer-cloud'),
 fs           = require('fs'),
 qs           = require('qs'),
 PythonShell  = require('python-shell'),
 striptags    = require('striptags'),
 csv          = require('ya-csv'),
 wait         = require('wait.for'),
 natural      = require('natural');
 
/*
 * Bootstrap application settings
 */
require('./config/express')(app);

/*
 * Bluemix credentials
 */

var document_conversion = watson.document_conversion({
  username: '78e25f85-aed1-48de-b0c6-805234041b1b',
  password: 'FDe3eWfAbrsW',
  version_date: '2015-12-01',
  version: 'v1'
});

var retrieve_and_rank = watson.retrieve_and_rank({
  username: 'a4ba001c-b9d8-4237-93d7-18236111eb15',
  password: 'DuOlum4khC4S',
  version: 'v1'
});

var clusterId = 'sc2206a51d_4901_4a90_8c57_d844cb0d4a37';
var collectionName = 'yeast_collection';
var solrClient = retrieve_and_rank.createSolrClient({
  cluster_id: clusterId,
  collection_name: collectionName
});

var types = {
  'ANSWER_UNITS': '.json',
  'NORMALIZED_HTML': '.html',
  'NORMALIZED_TEXT': '.txt'
};

var keyWords = ["regulate", "repress", "target", "induce", "activate", "transcription"];

var samples = ['sampleHTML.html','samplePDF.pdf','sampleWORD.docx'];

var uploadFolder   = __dirname + '/uploads/';
var sampleFolder   = __dirname + '/public/data/';
var resourceFolder = __dirname + '/public/resource/';

/*
 * Create reader for resource file
 */
var genereader = csv.createCsvFileReader(resourceFolder + 'SGD_features.csv', {
  'separator': ',',
  'quote': '"',
  'escape': '"',       
  'comment': '',
});

var tfreader = csv.createCsvFileReader(resourceFolder + 'Gene_Regulation.csv', {
  'separator': ',',
  'quote': '"',
  'escape': '"',       
  'comment': '',
});

var gtreader = csv.createCsvFileReader(resourceFolder + 'gt.csv', {
  'separator': ',',
  'quote': '"',
  'escape': '"',       
  'comment': '',
});

/**
 * Returns the file path to a previously uploaded file or a sample file
 * @param  {String} filename the file name
 * @return {String} absolute path to the file or null if it doesn't exists
 */
 function getFilePath(filename) {
  if (samples.indexOf(filename) !== -1) {
    return sampleFolder + filename;
  } else {
    if (fs.readdirSync(uploadFolder).indexOf(filename) !== -1)
      return uploadFolder + filename;
    else
      return null;
  }
}

/*
 * Create index page
 */
app.get('/', function(req, res) {
  res.render('index', { ct: req._csrfToken });
});

/*
 * Random question page
 */
app.get('/random', function(req, res) {
  res.render('random', { ct: req._csrfToken });
});

/*
 * Create user question page
 */
app.get('/user', function(req, res) {
  res.render('user', { ct: req._csrfToken });
});

/*
 * Create end session page
 */
app.get('/endsession', function(req, res) {
  res.render('endsession', { ct: req._csrfToken });
});

/*
 * Create upload page
 */
app.get('/upload', function(req, res) {
  res.render('upload', { ct: req._csrfToken });
});

/*
 * Get transcription factor list
 */
var tfList = [];
tfreader.addListener('data', function(data) {
  tfList.push(data[2]);
}); 

app.get('/api/gettfs', function(req, res) {
  res.send(tfList);
});

/*
 * Get genes list
 */
var geneList = [];
var geneInfoList = [];
genereader.addListener('data', function(data) {
  var geneInfo = {
    gClass : data[1],
    gName : data[3]
  }
  geneInfoList.push(geneInfo);
  geneList.push(data[4]);
}); 

app.get('/api/getgenes', function(req, res) {
  res.send(geneList);
});

function checkRanker(params,callback) {
  retrieve_and_rank.rankerStatus(params,
  function(err, response) {
    if (err)
      console.log('error:', err);
    else {
      if (response.status == "Available") {
        var ranker_id = response.ranker_id;
        console.log(ranker_id);
        var question      = 'q=' + params.question;
        var query     = qs.stringify({q: question, ranker_id: ranker_id, fl: 'id,body,title'});
        solrClient.get('fcselect', query, function(err, searchResponse) {
          if(err) {
            console.log('Error searching for documents: ' + err);
          }
          else {
            var results = [];
            for(var i = 0; i < 5;i++){
              var result = {
                id : searchResponse.response.docs[i].id,
                body : searchResponse.response.docs[i].body[0],
                title: searchResponse.response.docs[i].title[0]
              };
              results.push(result);
            }
            callback(null,results);
          }
        });
      } else {
        return null;
      }
    }     
  });
}

function getRankers(callback) {
  retrieve_and_rank.listRankers({},
  function(err, response) {
    if (err)
      console.log('error: ', err);
    else {
      response.rankers.sort(function(a,b){
        return new Date(b.created) - new Date(a.created);
      });
      callback(null,response.rankers);
    }
  });
  
}
function getResult(req, res) {
  var question = req.query.question;
  var rankers = wait.for(getRankers);

  for(var i = 0; i<rankers.length; i++) {
    var params = {
      ranker_id: rankers[i].ranker_id,
      question: question
    };
    params.ranker_id = '3b140ax14-rank-1930';
    var results = wait.for(checkRanker,params);
    if (results != null) {
      res.send(results);
      return;
    }
  }
} 

/*
 * Proximity search
 */
app.get('/api/getproxsearch', function(req, res) {
  //console.log(geneList);
  var result = {
      nodes : [],
      links : []
  }
  for (var p = 0; p < req.query.paragraphs.length; p++) {
    var text = req.query.paragraphs[p];
    var TfIdf = natural.TfIdf,
        tfidf = new TfIdf();
    var sentences = text.match(/(.*?(?:\.|\?|!))(?: |$)/g);
    if (sentences!= null) {
      for (var i = 0; i<sentences.length; i++) {
        tfidf.addDocument(sentences[i]);
      }
      var nodes = [];
      for (var i = 0; i<keyWords.length;i++) {
        for (var j = 0; j < sentences.length; j++) {
          var tokens = sentences[j].split(" ");
          for (var z = 0; z < tokens.length; z++) {
            if (natural.JaroWinklerDistance(keyWords[i],tokens[z]) > 0.9) {
              for (var k = 0; k< geneList.length; k++) {
                var index = sentences[j].toUpperCase().indexOf(geneList[k]);
                if ( (index >= 0) && (geneList[k] !== '')) { 
                  var key = sentences[j].substring(index,index+geneList[k].length);
                  if ((key != "ho") && (is_in_array(key,nodes)== -1)) {
                    if (key == key.toUpperCase()) {
                      nodes.push({id: key, url: geneInfoList[k].gName, group: 2});
                    } else {
                      var newKey = sentences[j].substring(index,index+geneList[k].length+1);
                      nodes.push({id: newKey, url: geneInfoList[k].gName, group: 1});
                    }  
                  }
                }
              }
              break;
            }

          }  
        }
      } 

      nodes = nodes.filter(function(elem, pos,arr) {
        return arr.indexOf(elem) == pos;
      });
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].group == 1) {
          var check1 = is_in_array(nodes[i].id,result.nodes);
          if (check1 == -1) {
             result.nodes.push(nodes[i]);
             check1 = result.nodes.length-1;
          }
          for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].group == 2) {
              var check2 = is_in_array(nodes[j].id,result.nodes);
              if (check2 == -1) {
                result.nodes.push(nodes[j]);
                check2 = result.nodes.length-1;
              }
              result.links.push({source: check1, target: check2, type: "resolved"})
            }
          }
        }
      }
    }
  }
  console.log(result);
  res.send(result);
});


function is_in_array(s,your_array) {
    for (var i = 0; i < your_array.length; i++) {
        if (your_array[i].id.toLowerCase() === s.toLowerCase()) return i;
    }
    return -1;
}

/*
 * Get result 
 */
app.get('/api/getresult', function(req, res) {
  wait.launchFiber(getResult,req,res);
});

/*
 * Get ground truth data
 */
var gtData = [];
gtreader.addListener('data', function(data) {
  var labels = [];
  for (var i = 1; i < data.length; i+=2) {
    var label = {
      id : data[i],
      rank : data[i+1]
    }
    labels.push(label);
  }
  var record = {
    question : data[0],
    labels : labels
  }
  gtData.push(record);
}); 

app.get('/api/getgtdata', function(req, res) {
  res.send(gtData);
});

/*
 * Update ground truth data
 */
app.post('/updategt',function(req,res){
  var d = new Date();
  var gtwriter = csv.createCsvFileWriter(resourceFolder + 'gt_' + d.getDate() + '-' + (d.getMonth()+1) + '-' + d.getFullYear() + '.csv');
  var updates = req.body.gtdata;
  for (var i = 0; i < updates.length; i++) {
    var record = [];
    record.push(updates[i].question);
    var labels = updates[i].labels;
    for (var j = 0; j < labels.length; j++) {
      record.push(labels[j].id);
      record.push(labels[j].rank);
    }
    gtwriter.writeRecord(record);
  }
  
});

/*
 * Create new ranker
 */
app.post('/createRanker',function(req,res){
  var d = new Date();
  var options = {
    mode: 'text',
    args: ['-u', 'a4ba001c-b9d8-4237-93d7-18236111eb15:DuOlum4khC4S', 
    '-i', 'public/resource/gt_' + d.getDate() + '-' + (d.getMonth()+1) + '-' + d.getFullYear() + '.csv', '-c', 'sc2206a51d_4901_4a90_8c57_d844cb0d4a37', 
    '-x', 'yeast_collection', '-n','yeast_ranker']
  };
 
  var pyshell = new PythonShell('public/resource/train.py',options);
  console.log('running python');
  PythonShell.run('public/resource/train.py', options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution 
    // console.log('results: %j', results);
    var params = {
      training_data: fs.createReadStream(resourceFolder +'trainingdata.txt'),
      training_metadata: "{\"name\":\"My ranker\"}"
    };
    retrieve_and_rank.createRanker(params,
    function(err, response) {
      if (err)
        console.log('error: ', err);
      // else
        // console.log(JSON.stringify(response, null, 2));
    });
  });
});

/*
 * Create new collection
 */
app.post('/createCollection',function(req,res){
  var count = 0;
  for (var i = 0; i < geneInfoList.length; i++) {
    if (geneInfoList[i].gClass === 'ORF') {
      count++;
      var stdin = 'http://www.yeastgenome.org/locus/' + geneInfoList[i].gName +'/overview';
      console.log(geneInfoList[i].gName);
      request(stdin, function (error, response, html) {
        if (!error) {
          var overviewText = html.match(/regulation_overview(.*)/);
          if((typeof overviewText !== 'undefined') && (overviewText != null)){
            var overviewParagraph = overviewText[0].match("<p>(.*)</p>");
            if(overviewParagraph !=null){
              var text = striptags(overviewParagraph[0]).replace(/ *\([^)]*\) */g, "");
              console.log(text);
              var doc = { id : count, body: text };
            }
          }
        } else {
          console.log(error);
        }
      });
      setTimeout(function(){}, 60000);
    }
  }
});

/*
 * Uploads a file
 */
app.post('/files', app.upload.single('document'), function(req, res, next) {
  if (!req.file  && !req.file.path) {
    return next({
      error: 'Missing required parameter: file',
      code: 400
    });
  }
  res.json({ id: req.file.filename });
});

/*
 * Converts a document
 */
app.get('/api/convert', function(req, res, next) {
  var file = getFilePath(req.query.document_id);
  var params = {
    conversion_target : req.query.conversion_target,
    file: file ? fs.createReadStream(file) : null
  };

  document_conversion.convert(params, function(err, data) {
    if (err) {
      return next(err);
    }
    var type = types[req.query.conversion_target];
    res.type(type);
    if (req.query.download) {
      res.setHeader('content-disposition','attachment; filename=output-' + Date.now() + '.' + type);
    }
    res.send(data);
  });
});

/*
 * Returns an uploaded file from the service
 */
app.get('/files/:id', function(req, res) {
  var file = getFilePath(req.params.id);
  fs.createReadStream(file)
  .on('response', function(response) {
    if (req.query.download) {
     response.headers['content-disposition'] = 'attachment; filename=' + req.params.id;
    }
  })
  .pipe(res);
});

/*
 * error-handler settings
 */
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 8080;
app.listen(port);
console.log('listening at:', port);
