const fs = require('fs');
const path = require('path');

const storageFolder = process.env.VERCEL ? '/tmp' : process.cwd();
const storageFile = path.join(storageFolder, 'profiles.json');

const initialProfiles = [
  {
    id: 1,
    email: 'sarah@skynet-research.org',
    name: 'Sarah Connor',
    bio: 'Cybernetics & Cloud Engineer passionate about AI and distributed systems.',
    skills: JSON.stringify(['TypeScript', 'React', 'Python', 'Docker', 'AWS']),
    github: 'https://github.com/sarahconnor',
    linkedin: 'https://linkedin.com/in/sarah-connor-eng',
    portfolio: 'https://sarahconnor.tech',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah&size=256',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    email: 'alex.morgan@devlab.io',
    name: 'Alex Morgan',
    bio: 'Full Stack Developer building clean and accessible web applications.',
    skills: JSON.stringify(['JavaScript', 'Node.js', 'Express', 'CSS', 'Git']),
    github: 'https://github.com/alexmorgan',
    linkedin: 'https://linkedin.com/in/alex-morgan-dev',
    portfolio: 'https://alexmorgan.dev',
    avatar: 'https://api.dicebear.com/7.x/bottts/png?seed=alex&size=256',
    created_at: new Date().toISOString()
  }
];

let profilesList = [...initialProfiles];
let profileCounter = 3;

function loadFromDisk() {
  try {
    if (fs.existsSync(storageFile)) {
      const rawData = fs.readFileSync(storageFile, 'utf8');
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        profilesList = parsed;
        const maxId = Math.max(...profilesList.map((item) => item.id || 0));
        profileCounter = maxId + 1;
      }
    }
  } catch (error) {
  }
}

loadFromDisk();

function persistToFile() {
  try {
    fs.writeFileSync(storageFile, JSON.stringify(profilesList, null, 2), 'utf8');
  } catch (error) {
  }
}

function saveProfile(profileData, callback) {
  loadFromDisk();

  const userEmail = (profileData.email || '').trim().toLowerCase();
  let existingIndex = -1;

  if (userEmail) {
    existingIndex = profilesList.findIndex(
      (item) => (item.email || '').trim().toLowerCase() === userEmail
    );
  }

  let savedProfile;

  if (existingIndex >= 0) {
    savedProfile = {
      ...profilesList[existingIndex],
      name: profileData.name,
      email: userEmail,
      bio: profileData.bio,
      skills: profileData.skills,
      github: profileData.github,
      linkedin: profileData.linkedin,
      portfolio: profileData.portfolio,
      avatar: profileData.avatar,
      updated_at: new Date().toISOString()
    };
    profilesList[existingIndex] = savedProfile;
  } else {
    savedProfile = {
      id: profileCounter++,
      email: userEmail,
      name: profileData.name,
      bio: profileData.bio,
      skills: profileData.skills,
      github: profileData.github,
      linkedin: profileData.linkedin,
      portfolio: profileData.portfolio,
      avatar: profileData.avatar,
      created_at: new Date().toISOString()
    };
    profilesList.unshift(savedProfile);
  }

  persistToFile();

  if (callback) {
    callback(null, savedProfile);
  }
}

function getAllProfiles(callback) {
  loadFromDisk();
  if (callback) {
    callback(null, profilesList);
  }
}

function getProfileById(identifier, callback) {
  loadFromDisk();
  const clean = String(identifier || '').trim().toLowerCase();
  const numericId = parseInt(clean, 10);

  const found = profilesList.find((item) => {
    if (!isNaN(numericId) && item.id === numericId) return true;
    if (item.email && item.email.toLowerCase() === clean) return true;
    return false;
  });

  if (callback) {
    callback(null, found || null);
  }
}

module.exports = {
  saveProfile,
  getAllProfiles,
  getProfileById
};
