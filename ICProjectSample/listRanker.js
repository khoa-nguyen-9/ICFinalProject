var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: '{username}',
  password: '{password}',
  version: 'v1'
});

retrieve_and_rank.listRankers({},
  function(err, response) {
    if (err)
      console.log('error: ', err);
    else
      console.log(JSON.stringify(response, null, 2));
});