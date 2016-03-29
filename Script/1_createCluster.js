var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: 'f7213345-5d80-4e5c-850f-712dec73b6d6',
  password: 'CCSLbDnHpJXG',
  version: 'v1'
});

retrieve_and_rank.createCluster({
  cluster_name: 'yeast cluster'
},
  function (err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(JSON.stringify(response, null, 2));
});