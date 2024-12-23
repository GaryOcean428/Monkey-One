function changePassword(email, newPassword, callback) {
  const bcrypt = require('bcrypt');
  const mysql = require('mysql');

  const connection = mysql.createConnection({
    host: configuration.HOST,
    user: configuration.USER,
    password: configuration.PASSWORD,
    database: configuration.DATABASE
  });

  connection.connect();

  bcrypt.hash(newPassword, 10, function(err, hashedPassword) {
    if (err) {
      callback(new Error("Failed to change password"));
      return;
    }

    const query = 'UPDATE users SET password = ? WHERE email = ?';
    
    connection.query(query, [hashedPassword, email], function(err, results) {
      if (err) {
        callback(new Error("Failed to change password"));
        return;
      }

      callback(null, results.affectedRows > 0);
    });
  });

  connection.end();
}
