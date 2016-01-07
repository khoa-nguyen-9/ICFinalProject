var watson  = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: '{username}',
  password: '{password}',
  version: 'v1'
});

var params = {
  cluster_id: 'sc1ca23733_faa8_49ce_b3b6_dc3e193264c6',
  collection_name: 'example-collection'
};

//  Use a querystring parser to encode output.
var qs = require('qs');

// Get a Solr client for indexing and searching documents.
// See https://github.com/watson-developer-cloud/nodejs-wrapper/tree/master/services/retrieve_and_rank.
solrClient = retrieve_and_rank.createSolrClient(params);

var ranker_id = 'B2E325-rank-67';
var question  = 'q=what is the basic mechanism of the transonic aileron buzz';
var query     = qs.stringify({q: question, ranker_id: ranker_id, fl: 'id,title'});

solrClient.get('fcselect', query, function(err, searchResponse) {
  if(err) {
    console.log('Error searching for documents: ' + err);
  }
    else {
      console.log(JSON.stringify(searchResponse.response.docs, null, 2));
    }
});