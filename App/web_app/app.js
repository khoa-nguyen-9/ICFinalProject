'use strict';

 var express  = require('express'),
 app          = express(),
 request      = require("request"),
 watson       = require('watson-developer-cloud'),
 fs           = require('fs'),
 qs           = require('qs'),
 PythonShell  = require('python-shell'),
 csv          = require('ya-csv');
 
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
  username: 'f7213345-5d80-4e5c-850f-712dec73b6d6',
  password: 'CCSLbDnHpJXG',
  version: 'v1'
});

var clusterId = 'scb567fb0f_0dd0_4c23_a773_872cf686e784';
var collectionName = 'yeast_sample_collection';
var solrClient = retrieve_and_rank.createSolrClient({
  cluster_id: clusterId,
  collection_name: collectionName
});

var types = {
  'ANSWER_UNITS': '.json',
  'NORMALIZED_HTML': '.html',
  'NORMALIZED_TEXT': '.txt'
};

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

var gtreader = csv.createCsvFileReader(resourceFolder + 'ground_truth.csv', {
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
genereader.addListener('data', function(data) {
  geneList.push(data[4]);
}); 

app.get('/api/getgenes', function(req, res) {
  res.send(geneList);
});

/*
 * Get result
 */
app.get('/api/getresult', function(req, res) {
  var question = req.query.question;
  // var url = "https://f7213345-5d80-4e5c-850f-712dec73b6d6:CCSLbDnHpJXG@gateway.watsonplatform.net/retrieve-and-rank/api/v1/" 
  // + "solr_clusters/scb567fb0f_0dd0_4c23_a773_872cf686e784/solr/yeast_sample_collection/"
  // + "select?q=" + question + "&wt=json&fl=id,body";
  // //+ "fcselect?ranker_id=42AF7Ex10-rank-1028&q=What is regulator of FBP1&wt=json&fl=id,body";
  // request({
  //   url: url,
  //   json: true
  // }, function (error, response, body) {
  //   var sampleResult = [];
  //   if (!error && response.statusCode === 200) {
  //     for(var i = 0; i < body.response.docs.length;i++){
  //       var result = {
  //         id : body.response.docs[i].id,
  //         body : body.response.docs[i].body[0]
  //       };
  //       sampleResult.push(result);
  //     }
  //   }
  //   res.send(sampleResult);
  // })

  //var ranker_id = '868fedx13-rank-337';
  retrieve_and_rank.listRankers({},
  function(err, response) {
    if (err)
      console.log('error: ', err);
    else {
      response.rankers.sort(function(a,b){
        return new Date(b.created) - new Date(a.created);
      });
      var i = 0;
      //for(var i = 0; i<response.rankers.length; i++) {
        var params = {
          ranker_id: response.rankers[i].ranker_id,
        };
        retrieve_and_rank.rankerStatus(params,
        function(err, response) {
          if (err)
            console.log('error:', err);
          else {
            if (response.status == "Available") {
              var ranker_id = response.ranker_id;
              console.log(ranker_id);
              question      = 'q=' + question;
              var query     = qs.stringify({q: question, ranker_id: ranker_id, fl: 'id,body'});
              solrClient.get('fcselect', query, function(err, searchResponse) {
                if(err) {
                  console.log('Error searching for documents: ' + err);
                }
                else {
                  var results = [];
                  for(var i = 0; i < searchResponse.response.docs.length;i++){
                    var result = {
                      id : searchResponse.response.docs[i].id,
                      body : searchResponse.response.docs[i].body[0]
                    };
                    results.push(result);
                  }
                  res.send(results);
                  return;
                }
              });
            }
          }     
        });
      //}
    }
  });

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
  var gtwriter = csv.createCsvFileWriter(resourceFolder + 'ground_truth.csv');
  var updates = req.body.gtdata;
  for (var i = 0; i < updates.length; i++) {
    var record = [];
    record.push(updates[i].question);
    var labels = updates[i].labels;
    console.log(updates[i].question);
    console.log(labels);
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
  var options = {
    mode: 'text',
    args: ['-u', 'f7213345-5d80-4e5c-850f-712dec73b6d6:CCSLbDnHpJXG', 
    '-i', 'public/resource/ground_truth.csv', '-c', 'scb567fb0f_0dd0_4c23_a773_872cf686e784', 
    '-x', 'yeast_sample_collection', '-n','example-ranker2']
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

// error-handler settings
require('./config/error-handler')(app);


var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
