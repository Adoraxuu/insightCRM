require('dotenv').config();
const app = require('./app');
const { pool } = require('./connection/dbConnection');
const port = process.env.PORT || 3000;

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    client.release();

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to DB');
    console.error(err);
    process.exit(1);
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}, http://localhost:${port}`)
})