const knex = require('knex')({
  client: 'better-sqlite3',
  connection: {
    filename: './database.sqlite'
  },
  useNullAsDefault: true
});

module.exports = knex;