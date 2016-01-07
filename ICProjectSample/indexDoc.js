var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: '{username}',
  password: '{password}',
  version: 'v1'
});

var params = {
  cluster_id: 'sc1ca23733_faa8_49ce_b3b6_dc3e193264c6',
  collection_name: 'example-collection',
};

var doc = {
    id: 1,
    author: 'brenckman,m.',
    bibliography: 'j. ae. scs. 25, 1958, 324.',
    body: 'experimental investigation of the aerodynamics of a wing in a slipstream.   an experimental study of a wing in a propeller slipstream was made in order to determine the spanwise distribution of the lift increase due to slipstream at different angles of attack of the wing and at different free stream to slipstream velocity ratios.',
    title: 'experimental investigation of the aerodynamics of a wing in a slipstream'
};

solrClient = retrieve_and_rank.createSolrClient(params);

console.log('Indexing a document...');
solrClient.add(doc, function (err, response) {
  if (err) {
    console.log('Error indexing document: ', err);
  }
    else {
      console.log('Indexed a document.');
      solrClient.commit(function(err) {
        if(err) {
          console.log('Error committing change: ' + err);
        }
          else {
            console.log('Successfully committed changes.');
          }
      });
    }
});