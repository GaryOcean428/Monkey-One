function getUser(identifierValue, context, callback) {
  // This script should retrieve a user profile from your existing database,
  // without authenticating the user.
  try {
    const mysql = require('mysql');

    // Validate input
    if (!identifierValue) {
      return callback(null);
    }

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

    connection.connect();

    // Find user by email
    connection.query('SELECT * FROM users WHERE email = ?', [identifierValue], function(err, results) {
      if (err) {
        connection.end();
        return callback(new Error('Error querying database'));
      }

      if (results.length === 0) {
        connection.end();
        return callback(null);
      }

      const user = results[0];

      // Return user profile in Auth0's normalized user profile format
      // https://auth0.com/docs/users/normalized/auth0/normalized-user-profile-schema
      const profile = {
        user_id: user.id.toString(),
        email: user.email,
        email_verified: !!user.email_verified,
        name: user.name || user.email.split('@')[0],
        nickname: user.nickname,
        created_at: user.created_at,
        updated_at: user.updated_at,
        app_metadata: {},
        user_metadata: {}
      };

      connection.end();
      return callback(null, profile);
    });

  } catch (error) {
    console.log('Get user error:', error);
    callback(new Error('An error occurred while getting user profile'));
  }
}
