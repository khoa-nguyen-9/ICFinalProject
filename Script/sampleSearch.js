var watson = require('watson-developer-cloud');

var retrieve = watson.retrieve_and_rank({
  username: '783c5984-daa9-4334-93d6-ac6f87c0b4d7',
  password: 'uegcY7FvU5gz',
  version: 'v1'
});

var document_conversion = watson.document_conversion({
  username: 'a69fc9af-377e-4369-8e1b-abec75ee154c',
  password: 'DbMWdGDWzivE',
  version:  'v1'
});

var clusterId = 'sc8864bebe_b5f1_45c5_8428_a43b53bf9212';

var inputDocument = '/resource/ADR1.docx';
var collectionName = 'yeast-collection';

var solrClient = retrieve.createSolrClient({
  cluster_id: clusterId,
  collection_name: collectionName
});

function search() {
  console.log('Searching all documents.');
  var query = solrClient.createQuery();  
  // This query searches for the term 'psychological' in the body field.
  // For a wildcard query use:
  // query.q({ '*' : '*' });
  query.q({
    'body': 'regulate'
  });

  solrClient.search(query, function(err, searchResponse) {
    if (err) {
      console.log('Error searching for documents: ' + err);
    } else {
      console.log('Found ' + searchResponse.response.numFound + ' document(s).');
      console.log('First document: ' + JSON.stringify(searchResponse.response.docs[0], null, 2));
      console.log('Second document: ' + JSON.stringify(searchResponse.response.docs[1], null, 2));
    }
  });
}

search();