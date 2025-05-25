const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 10000,  
  connectionTimeoutMillis: 5000
});

const db = drizzle(pool);

pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW()')
      .then(res => {
        console.log('✅ PostgreSQL connected:', res.rows[0].now);
        client.release();
      });
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection failed');
    console.error(err);
    process.exit(1);
  });

module.exports = {
  pool,
  db
};
