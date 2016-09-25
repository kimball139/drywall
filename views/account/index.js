'use strict';

exports.init = function(req, res, next){
  req.app.db.models.Account.find({}, function (err, accounts) {
    res.render('account/index', { 
      title: 'a simple blog',
      "accounts" : accounts
    });
  });
};

/*
  var outcome = {};

  var getResults = function(callback) {
    req.query.search = req.query.search ? req.query.search : '';
    req.query.name = req.query.name ? req.query.name : '';
    req.query.tutorInfo = req.query.tutorInfo ? req.query.tutorInfo : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    if (req.query.name) {
    filters.name = new RegExp('^.*?'+ req.query.name +'.*$', 'i');
    }
    if (req.query.tutorInfo) {
      filters.tutorInfo = new RegExp('^.*?'+ req.query.tutorInfo +'.*$', 'i');
    }

    req.app.db.models.Account.pagedFind({
      filters: filters,
      keys: 'name tutorInfo',
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort
    }, function(err, results) {
      if (err) {
        return callback(err, null);
      }

      outcome.results = results;
      return callback(null, 'done');
    });
  };

  var asyncFinally = function(err, results) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      outcome.results.filters = req.query;
      res.send(outcome.results);
    }
    else {
      outcome.results.filters = req.query;
      res.render('account/index', {
        data: {
          results: escape(JSON.stringify(outcome.results))
        }
      });
    }
  };

  require('async').parallel([getResults], asyncFinally);
};
*/
//  res.render('account/index');
//};
