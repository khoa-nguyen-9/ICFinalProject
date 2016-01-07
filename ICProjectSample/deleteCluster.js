var watson = require('watson-developer-cloud');
var retrieve_and_rank = watson.retrieve_and_rank({
  username: 'a05eeec0-c1fc-43eb-9a1a-cbcb128307c5',
  password: '8lleaeqc0x8M',
  version: 'v1'
});

retrieve_and_rank.deleteCluster({
  cluster_id: 'sc7f4cfeb2_f18f_472e_8742_ee0f07d9feff'
},
  function (err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(JSON.stringify(response, null, 2));
});