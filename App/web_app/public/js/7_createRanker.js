var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: '783c5984-daa9-4334-93d6-ac6f87c0b4d7',
  password: 'uegcY7FvU5gz',
  version: 'v1'
});

var params = {
  training_data: fs.createReadStream('ranker_train.csv'),
  training_metadata: fs.createReadStream('ranker_meta.json')
};

retrieve_and_rank.createRanker(params,
  function(err, response) {
    if (err)
      console.log('error: ', err);
    else
      console.log(JSON.stringify(response, null, 2));
});