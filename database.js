const fs = require('fs');
const path = require('path');

const storageFolder = process.env.VERCEL ? '/tmp' : process.cwd();
const storageFile = path.join(storageFolder, 'profiles.json');

let profilesList = [];
let profileCounter = 1;

try {
  if (fs.existsSync(storageFile)) {
    const rawData = fs.readFileSync(storageFile, 'utf8');
    profilesList = JSON.parse(rawData);
    if (profilesList.length > 0) {
      const maxId = Math.max(...profilesList.map((item) => item.id || 0));
      profileCounter = maxId + 1;
    }
  }
} catch (error) {
  profilesList = [];
}

function persistToFile() {
  try {
    fs.writeFileSync(storageFile, JSON.stringify(profilesList, null, 2), 'utf8');
  } catch (error) {
  }
}

function saveProfile(profileData, callback) {
  const newProfile = {
    id: profileCounter++,
    name: profileData.name,
    bio: profileData.bio,
    skills: profileData.skills,
    github: profileData.github,
    linkedin: profileData.linkedin,
    portfolio: profileData.portfolio,
    avatar: profileData.avatar,
    created_at: new Date().toISOString()
  };

  profilesList.unshift(newProfile);
  persistToFile();

  if (callback) {
    callback(null, newProfile);
  }
}

function getAllProfiles(callback) {
  if (callback) {
    callback(null, profilesList);
  }
}

function getProfileById(id, callback) {
  const numericId = parseInt(id, 10);
  const foundProfile = profilesList.find((item) => item.id === numericId);
  if (callback) {
    callback(null, foundProfile || null);
  }
}

module.exports = {
  saveProfile,
  getAllProfiles,
  getProfileById
};
