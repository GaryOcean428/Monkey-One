function create(user, callback) {
  // This script should create a user entry in your existing database
  const bcrypt = require('bcrypt');
  const mysql = require('mysql');

  const connection = mysql.createConnection({
    host: configuration.HOST,
    user: configuration.USER,
    password: configuration.PASSWORD,
    database: configuration.DATABASE
  });

  connection.connect();

  const query = 'SELECT id FROM users WHERE email = ?';
  
  connection.query(query, [user.email], function(err, results) {
    if (err) {
      callback(new Error("Failed to create user"));
      return;
    }
    
    if (results.length > 0) {
      callback(new Error("User already exists"));
      return;
    }

    bcrypt.hash(user.password, 10, function(err, hashedPassword) {
      if (err) {
        callback(new Error("Failed to create user"));
        return;
      }

      const insertQuery = 'INSERT INTO users SET ?';
      const userData = {
        email: user.email,
        password: hashedPassword,
        email_verified: false,
        created_at: new Date()
      };

      connection.query(insertQuery, userData, function(err, results) {
        if (err) {
          callback(new Error("Failed to create user"));
          return;
        }

        callback(null, {
          user_id: results.insertId.toString(),
          email: user.email,
          email_verified: false
        });
      });
    });
  });

  connection.end();
}
