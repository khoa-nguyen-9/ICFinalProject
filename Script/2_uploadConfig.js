var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: 'f7213345-5d80-4e5c-850f-712dec73b6d6',
  password: 'CCSLbDnHpJXG',
  version: 'v1'
});

var params = {
  cluster_id: 'scb567fb0f_0dd0_4c23_a773_872cf686e784',
  config_name: 'yeast-config',
  config_zip_path: 'solrconfig.zip'
};

retrieve_and_rank.uploadConfig(params,
  function (err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(JSON.stringify(response, null, 2));
});