const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDirectory = process.env.VERCEL ? '/tmp' : __dirname;
const dbPath = path.join(dbDirectory, 'profiles.db');

let memoryProfiles = [];
let nextId = 1;
let useMemory = false;

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    useMemory = true;
    return;
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      bio TEXT,
      skills TEXT,
      github TEXT,
      linkedin TEXT,
      portfolio TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function saveProfile(profileData, callback) {
  if (useMemory) {
    const newProfile = {
      id: nextId++,
      name: profileData.name,
      bio: profileData.bio,
      skills: profileData.skills,
      github: profileData.github,
      linkedin: profileData.linkedin,
      portfolio: profileData.portfolio,
      avatar: profileData.avatar,
      created_at: new Date().toISOString()
    };
    memoryProfiles.unshift(newProfile);
    return callback(null, newProfile);
  }

  const query = `
    INSERT INTO profiles (name, bio, skills, github, linkedin, portfolio, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    profileData.name,
    profileData.bio,
    profileData.skills,
    profileData.github,
    profileData.linkedin,
    profileData.portfolio,
    profileData.avatar
  ];

  db.run(query, values, function (err) {
    if (err) {
      return callback(err);
    }
    getProfileById(this.lastID, callback);
  });
}

function getAllProfiles(callback) {
  if (useMemory) {
    return callback(null, memoryProfiles);
  }

  const query = 'SELECT * FROM profiles ORDER BY id DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows);
  });
}

function getProfileById(id, callback) {
  if (useMemory) {
    const profile = memoryProfiles.find((item) => item.id === parseInt(id, 10));
    return callback(null, profile);
  }

  const query = 'SELECT * FROM profiles WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
}

module.exports = {
  saveProfile,
  getAllProfiles,
  getProfileById
};
