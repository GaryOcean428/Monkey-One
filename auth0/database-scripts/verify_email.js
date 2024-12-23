function verify(email, callback) {
  const mysql = require('mysql');

  const connection = mysql.createConnection({
    host: configuration.HOST,
    user: configuration.USER,
    password: configuration.PASSWORD,
    database: configuration.DATABASE
  });

  connection.connect();

  const query = 'UPDATE users SET email_verified = true WHERE email = ?';
  
  connection.query(query, [email], function(err, results) {
    if (err) {
      callback(new Error("Failed to verify email"));
      return;
    }

    callback(null, results.affectedRows > 0);
  });

  connection.end();
}
