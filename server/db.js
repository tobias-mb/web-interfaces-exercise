let Pool = require('pg').Pool;
const dbcredentials = require('./dbcredentials.json');

let pool = null;
try {
  //remember to not upload anything private here
  pool  = new Pool(dbcredentials);
  
} catch (error) {
  console.error('pg pool create failed');
  console.error(error);
}


module.exports = pool;

/* This works for new heroku update

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

module.exports = client;
  
 */