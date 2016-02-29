var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: '783c5984-daa9-4334-93d6-ac6f87c0b4d7',
  password: 'uegcY7FvU5gz',
  version: 'v1'
});

var params = {
  cluster_id: 'sc8864bebe_b5f1_45c5_8428_a43b53bf9212',
  config_name: 'yeast-config',
  collection_name: 'yeast-sample-collection',
  wt: 'json'
};

retrieve_and_rank.createCollection(params,
  function (err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(JSON.stringify(response, null, 2));
});