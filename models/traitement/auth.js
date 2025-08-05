//const mq = require('../../config/db');

const { pool: mq } = require('../../config/db');
const crypto = require('crypto');
// Get all users
function GetAllUsers(callback) {
  const query = 'SELECT * FROM userss';
  mq.query(query, function (err, rows) {
    if (err) return callback(err, null);
    callback(null, rows);
  });
}

// Get user by ID
function GetUserById(id, callback) {
  const query = 'SELECT * FROM userss WHERE id = ?';
  mq.query(query, [id], function (err, rows) {
    if (err) return callback(err, null);
    callback(null, rows[0]); // Return single user
  });
}



function AuthenticateUser(username, password, callback) {
  const query = 'SELECT * FROM users WHERE email = ? AND password = SHA2(?, 256)';
  mq.query(query, [username, password], function (err, rows) {
    if (err) return callback(err, null);
    callback(null, rows[0] || null); // Return user object or null if not found
  });
}
/*
// Create a new user
function CreateUser(userData, callback) {
  const query = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
  const { username, email, password } = userData;
  mq.query(query, [username, email, password], function (err, result) {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

// Update user information
function UpdateUser(id, updates, callback) {
  const query = 'UPDATE user SET ? WHERE id = ?';
  mq.query(query, [updates, id], function (err, result) {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

// Delete user
function DeleteUser(id, callback) {
  const query = 'DELETE FROM user WHERE id = ?';
  mq.query(query, [id], function (err, result) {
    if (err) return callback(err, null);
    callback(null, result);
  });
}
*/

async function UpdateLastLogin(userId) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE userss SET last_login = NOW() WHERE id = ?`;
        mq.query(query, [userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function CreateSession(id_user) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO user_session (id_user, datetime) VALUES (?, NOW())`;
    mq.query(query, [id_user], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function getSessions(callback) {
  const query = 'SELECT user_session.*, user.username FROM user_session JOIN user ON user.id = user_session.id_user ORDER BY user_session.datetime DESC';

  mq.query(query, (err, rows) => {
    if (err) {
      return callback(err, null);
    }

    // If no rows found, return an empty array instead of null
    callback(null, rows.length > 0 ? rows : []);
  });
}




module.exports = {
 
  GetAllUsers,
  GetUserById,
  AuthenticateUser,
  UpdateLastLogin,
  CreateSession,
  getSessions
  
};