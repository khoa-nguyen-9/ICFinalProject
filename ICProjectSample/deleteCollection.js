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

retrieve_and_rank.deleteCollection(params,
  function (err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(JSON.stringify(response, null, 2));
});