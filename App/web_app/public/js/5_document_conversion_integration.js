'use strict';

/*
Document Conversion integration with Retrieve and Rank
The Document Conversion integration example shows how to convert a document into Answer Units by using the
Document Conversion Service and upload it to the Retrieve and Rank Service to make the Answer Units searchable.
 1. Create a solr cluster, upload the solr configuration and create a collection
    1.1 In the files retrieve_and_ran_lifecycle.v1.js  and retrieve_and_rank_solr.v1.js you will find example functions
        on how to perform these steps.
    1.2 IMPORTANT: When uploading the solr configuration, use the [answer_unit_config.zip] from the resources folder,
    which includes a schema.xml that defines the fields that will be indexed.
 2. Edit the file document_conversion_integration.v1.js and enter the following:
    2.1 service credentials for the Document Conversion and the Retrieve and Rank services (each service instance has a
        different set of credentials)
    2.2 clusterId (obtained when creating the cluster)
    2.3 collectionName and inputDocument if you are using a different value from the default
 3. Run the following command:
      node document_conversion_integration.v1.js
*/

var watson = require('watson-developer-cloud');
var async = require('async');
var fs = require('fs');

/*
Insert the credentials for your Retrieve and Rank service instance
NOTE: you cannot use your Bluemix account credentials here
*/
var retrieve = watson.retrieve_and_rank({
  username: '783c5984-daa9-4334-93d6-ac6f87c0b4d7',
  password: 'uegcY7FvU5gz',
  version: 'v1'
});

/*
Insert the credentials for your Document Conversion service instance
NOTE: you cannot use your Bluemix account credentials here
*/
var document_conversion = watson.document_conversion({
  username: 'a69fc9af-377e-4369-8e1b-abec75ee154c',
  password: 'DbMWdGDWzivE',
  version:  'v1'
});

var clusterId = 'sc8864bebe_b5f1_45c5_8428_a43b53bf9212';

var inputDocument = '/resource/ADR1.docx';
var collectionName = 'yeast-collection';

var solrClient = retrieve.createSolrClient({
  cluster_id: clusterId,
  collection_name: collectionName
});

var path = 'resource/collection/'
fs.readdir(path, function(err, files) {
  if (err) return;
  files.forEach(function(f) {
    console.log('Files: ' + f);
    async.waterfall([

      function convert(done) {
        // convert a single document
        document_conversion.convert({
          // (JSON) ANSWER_UNITS, NORMALIZED_HTML, or NORMALIZED_TEXT
          file: fs.createReadStream(__dirname + '/'+path + f),
          conversion_target: document_conversion.conversion_target.ANSWER_UNITS,
          config: {
            html_to_html: {
              specify_content_to_extract: {
                enabled: true,
                xpaths: ['//h3']
              }
            }
          }
       }, function(err, response) {
          if (err) {
           console.error(err);
          } else {
            done(null, response);
          }
        });
      },

      function indexAndCommit(response, done) {
        console.log('Indexing a document...');
        var doc = mapAnswerUnits2SolrDocs(response);
        solrClient.add(doc, function(err) {
          if (err) {
            console.log('Error indexing document: ' + err);
            done();
          } else {
            console.log('Indexed a document.');
            solrClient.commit(function(err) {
              if (err) {
                console.log('Error committing change: ' + err);
              } else {
                console.log('Successfully committed changes.');
              }
              done();
            });
          }
        });
      }

    ]);
  });
});


function mapAnswerUnits2SolrDocs(data) {
  var answerUnits = data.answer_units;
  var solrDocList = [];
  answerUnits.forEach(function(value) {
    var solrDoc = convertAnswerUnit2SolrDoc(value);
    solrDocList.push(solrDoc);
  });
  return solrDocList;
}

function convertAnswerUnit2SolrDoc(au) {
  var solrDoc;
  var auContents = au.content;
  auContents.forEach(function(auContent) {
    if (auContent.media_type === 'text/plain') {
      solrDoc = {
        id: au.id,
        //title: au.title,
        //type: au.type,
        //media_type: auContent.media_type,
        body: auContent.text
      };
    }
  });
  console.log(solrDoc);
  return solrDoc;
}