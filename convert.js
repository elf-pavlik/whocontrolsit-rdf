var fs = require('fs');
var yaml = require('js-yaml');
var _ = require('lodash');
var UUID = require('uuid');

var doc = yaml.safeLoad(fs.readFileSync('drc_bo.yml', 'utf8'));
var graph = [];

// TODO reuse terms from existing vocabs like schema.org
var context = {
  '@vocab': 'http://ns.whocontrolsit.com/#',
  'schema': 'http://schema.org/',
  'id': '@id',
  'type': '@type',
  'name': 'schema:name',
  'sameAs': 'schema:sameAs',
  'control': { "@type": "@id", "@container": "@set" }
};

var prefixes = {
  entities: 'http://alpha.whocontrolsit.com/entities/',
  relationships: 'http://alpha.whocontrolsit.com/relationships/'
};

function entityUri(id) {
  return prefixes.entities + id;
}

function relationshipUri(id) {
  return prefixes.relationships + id;
}

// get entities
doc.forEach(function(tuple){
  var record = tuple[1];
  var obj = {
    id: entityUri(tuple[0]),
    type: record[':entity_type'],
    name: record[':name'],
    control: []
  };
  if(record[':notes']) obj.notes = record[':notes'];
  if(record[':jurisdiction']) obj.jurisdiction = record[':jurisdiction'];
  if(obj.jurisdiction && record[':company_number']){
    obj.sameAs = 'https://opencorporates.com/companies/' + obj.jurisdiction + '/' + record[':company_number'];
  }
  graph.push(obj);
});

// get relationships
doc.forEach(function(tuple){
  var record = tuple[1];
  var obj, parent;
  if(record[':parent']){
    obj = {
      id: relationshipUri(UUID.v4()),
      type: record[':relationship_type'].replace(' ', ''),
      percentage: Number(record[':details'])
    };
    parent = _.find(graph, function(entity){ return entity.id == entityUri(record[':parent']); });
    parent.control.push(obj.id);
    graph.push(obj);
  }
  if(record[':child']){
    obj = {
      id: relationshipUri(UUID.v4()),
      type: record[':relationship_type'].replace(' ', '')
    };
    if(record[':details']){
      obj.percentage = Number(record[':details'].replace('%', ''));
    }
    parent = _.find(graph, function(entity){ return entity.id == entityUri(tuple[0]); });
    parent.control.push(obj.id);
    graph.push(obj);
  }
});

var jsonld = {
  '@context': context,
  '@graph': graph
};

console.log(JSON.stringify(jsonld));
//console.log(doc);
