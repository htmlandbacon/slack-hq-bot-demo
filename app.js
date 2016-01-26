var express = require('express');
var bodyParser = require('body-parser');
var rp = require('request-promise');
var _ = require('underscore');

var app = express();
var port = process.env.PORT || 3000;

// body parser middleware
app.use(bodyParser.urlencoded({extended: true}));

// test route
app.get('/', function (req, res) {
  res.status(200).send('Hello world!');
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
  next();
});

app.post('/hello', function (req, res) {
  var userName = req.body.user_name;
  var botPayload = {
    text: 'Hello, ' + userName + '!'
  };

  // avoid infinite loop
  if (userName !== 'slackbot') {
    return res.status(200).json(botPayload);
  }
  return res.status(200).end();
});

app.use('/benism', function (req, res) {
  var benism = require('./ben.json');

  var randomNumber = Math.floor(Math.random() * ((benism.length - 1) - 0 + 1)) + 0;

  var userName = req.body.user_name;
  var botPayload = {
    text: benism[randomNumber]
  };
  // avoid infinite loop
  if (userName !== 'slackbot') {
    return res.status(200).json(botPayload);
  }
  return res.status(200).end();
});

app.use('/services', function (req, res) {
  rp('http://dwp-digital-services.herokuapp.com/api').then(function (data) {
    var dataset = JSON.parse(data);
    var datasetSorted = _.filter(dataset, {phase: 'beta'});
    var random = _.sample(datasetSorted, 1);
    var userName = req.body.user_name;
    var botPayload = 'Service: ' + random[0].name + ' - ' + random[0].description;
    if (random[0].phase_modifier !== undefined) {
      botPayload = botPayload + ' (' + random[0].phase_modifier + ')';
    }

    // avoid infinite loop
    if (userName !== 'slackbot') {
      return res.status(200).json({text: botPayload});
    }
    return res.status(200).end();
  });
});

app.listen(port, function () {
  console.log('Server listening on port ' + port);
});
