async function login(email, password, callback) {
  try {
    const mysql = require('mysql');

    // Validate inputs
    if (!email || !password) {
      return callback(new WrongUsernameOrPasswordError(email));
    }

    // Create connection using the context object's configuration
    const connection = mysql.createConnection({
      host: configuration.HOST,
      user: configuration.USER,
      password: configuration.PASSWORD,
      database: configuration.DATABASE
    });

    // Promisify the connection query
    const query = (sql, params) => {
      return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    };

    try {
      connection.connect();

      // Find user by email
      const users = await query('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        // Log invalid username/email attempt
        return callback(new WrongUsernameOrPasswordError(email));
      }

      const user = users[0];

      // Verify password
      const bcrypt = require('bcrypt');
      const isValid = await new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (error, result) => {
          if (error) reject(error);
          resolve(result);
        });
      });

      if (!isValid) {
        // Log invalid password attempt
        return callback(new WrongUsernameOrPasswordError(email, "Wrong password"));
      }

      // Construct user profile
      const profile = {
        user_id: user.id.toString(),
        email: user.email,
        email_verified: !!user.email_verified,
        name: user.name || user.email.split('@')[0],
        nickname: user.nickname,
        created_at: user.created_at
      };

      callback(null, profile);

    } finally {
      // Always close the connection
      connection.end();
    }

  } catch (error) {
    console.log('Login error', error);
    callback(new Error('An error occurred while logging in'));
  }
}
