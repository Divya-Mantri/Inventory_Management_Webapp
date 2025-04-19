const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'sql201.infinityfree.com',         // use your real MySQL hostname
  user: 'if0_38773901',            // your MySQL username
  password: 'KjKH5kBpAbMWUXk',   // your MySQL password
  database: 'if0_38773901_hardwarestore_1' // your database name
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database on InfinityFree!');
});

module.exports = connection;
