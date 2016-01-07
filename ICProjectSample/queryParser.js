var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: '{username}',
  password: '{password}',
  version: 'v1'
});

var params = {
  cluster_id: 'sc1ca23733_faa8_49ce_b3b6_dc3e193264c6',
  collection_name: 'example-collection',
  wt: 'json'
};

// Get a Solr client for indexing and searching documents.
// See https://github.com/watson-developer-cloud/nodejs-wrapper/tree/master/services/retrieve_and_rank.
solrClient = retrieve_and_rank.create(params);

console.log('Searching all documents.');
var query = solrClient.createQuery();
query.q({ '*' : '*' });

solrClient.search(query, function(err, searchResponse) {
  if(err) {
    console.log('Error searching for documents: ' + err);
  }
    else {
      console.log('Found ' + searchResponse.response.numFound + ' documents.');
      console.log('First document: ' + JSON.stringify(searchResponse.response.docs[0], null, 2));
    }
});