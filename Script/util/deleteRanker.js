var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: '783c5984-daa9-4334-93d6-ac6f87c0b4d7',
  password: 'uegcY7FvU5gz',
  version: 'v1'
});

var params = {
  ranker_id: '42B250x11-rank-974',
};

retrieve_and_rank.deleteRanker(params,
  function(err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(JSON.stringify(response, null, 2));
});