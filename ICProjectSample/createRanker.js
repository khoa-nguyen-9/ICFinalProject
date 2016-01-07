var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: '{username}',
  password: '{password}',
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