var fs = require('fs');
var yaml = require('js-yaml');
var _ = require('lodash');
var UUID = require('uuid');

var doc = yaml.safeLoad(fs.readFileSync('base.yml', 'utf8'));
var graph = [];

// get entities
doc.forEach(function(tuple){
  var record = tuple[1];
  var obj = {
    id: tuple[0],
    type: record[':entity_type'],
    name: record[':name']
  };
  if(record[':notes']) obj.notes = record[':notes'];
  if(record[':jurisdiction']) obj.jurisdiction = record[':jurisdiction'];
  if(obj.jurisdiction && record[':company_number']){
    obj.sameAs = 'https://opencorporates.com/companies/' + obj.jurisdiction + '/' + record[':company_number'];
  }
  graph.push(obj);
});

// get relationships

console.log(graph);
//console.log(doc);
