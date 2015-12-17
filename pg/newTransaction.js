var wrapQuery = require('./wrapQuery');
var wrapQueryStream = require('./wrapQueryStream');
var encodeBuffer = require('./encodeBuffer');
var encodeDate = require('./encodeDate');
var deleteFromSql = require('./deleteFromSql');

function newResolveTransaction(domain, pool) {

    return function(onSuccess, onError) {
        pool.connect(onConnected);

        function onConnected(err, client, done) {
            if (err) {
                onError(err);
                return;
            }
            var rdb = {};
            client.executeQuery = wrapQuery(client);            
            client.streamQuery = wrapQueryStream(client);            
            rdb.dbClient = client;
            rdb.dbClientDone = done;
            rdb.encodeBuffer = encodeBuffer;
            rdb.encodeDate = encodeDate;
            rdb.deleteFromSql = deleteFromSql;
            domain.rdb = rdb;
            domain.rdb.domainExit = domain.domainExit;
            domain.domainExit = undefined;
            onSuccess();
        }
    };
}

module.exports = newResolveTransaction;