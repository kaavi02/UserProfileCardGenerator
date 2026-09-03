const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function formatName(name) {
  if (!name) return 'Anonymous';
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseSkills(skillsString) {
  if (!skillsString) return [];
  return skillsString
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

function formatUrl(url, platform) {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';

  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }

  if (platform === 'github') {
    return `https://github.com/${trimmedUrl.replace(/^@/, '')}`;
  }

  if (platform === 'linkedin') {
    if (trimmedUrl.includes('linkedin.com')) {
      return `https://${trimmedUrl}`;
    }
    return `https://linkedin.com/in/${trimmedUrl.replace(/^@/, '')}`;
  }

  return `https://${trimmedUrl}`;
}

function generateAvatarUrl(name, style) {
  const seed = encodeURIComponent((name || 'avatar').toLowerCase().trim());
  const chosenStyle = style || 'bottts';

  if (chosenStyle === 'initials') {
    return `https://ui-avatars.com/api/?name=${seed}&background=6366f1&color=ffffff&bold=true&size=256&format=png`;
  }

  return `https://api.dicebear.com/7.x/${chosenStyle}/png?seed=${seed}&size=256`;
}

app.get('/', (req, res) => {
  db.getAllProfiles((err, profiles) => {
    if (err) {
      return res.render('index', { recentProfiles: [] });
    }
    res.render('index', { recentProfiles: profiles ? profiles.slice(0, 3) : [] });
  });
});

app.post('/generate', (req, res) => {
  const rawName = req.body.name || '';
  const rawBio = req.body.bio || '';
  const rawSkills = req.body.skills || '';
  const rawGithub = req.body.github || '';
  const rawLinkedin = req.body.linkedin || '';
  const rawPortfolio = req.body.portfolio || '';
  const avatarStyle = req.body.avatarStyle || 'bottts';
  const customAvatar = req.body.avatarUrl ? req.body.avatarUrl.trim() : '';

  const formattedName = formatName(rawName);
  const cleanBio = rawBio.trim() || 'No bio provided.';
  const skillList = parseSkills(rawSkills);
  const formattedGithub = formatUrl(rawGithub, 'github');
  const formattedLinkedin = formatUrl(rawLinkedin, 'linkedin');
  const formattedPortfolio = formatUrl(rawPortfolio, 'portfolio');
  const avatarUrl = customAvatar || generateAvatarUrl(formattedName, avatarStyle);

  const profileData = {
    name: formattedName,
    bio: cleanBio,
    skills: JSON.stringify(skillList),
    github: formattedGithub,
    linkedin: formattedLinkedin,
    portfolio: formattedPortfolio,
    avatar: avatarUrl
  };

  db.saveProfile(profileData, (err, savedProfile) => {
    if (err) {
      return res.status(500).send('Error saving profile');
    }

    let parsedSkills = [];
    try {
      parsedSkills = JSON.parse(savedProfile.skills);
    } catch (e) {
      parsedSkills = [];
    }

    res.render('card', {
      profile: savedProfile,
      skills: parsedSkills,
      successMessage: 'Profile card created successfully!'
    });
  });
});

app.get('/profile/:id', (req, res) => {
  const profileId = req.params.id;

  db.getProfileById(profileId, (err, profile) => {
    if (err || !profile) {
      return res.status(404).send('Profile not found');
    }

    let parsedSkills = [];
    try {
      parsedSkills = JSON.parse(profile.skills);
    } catch (e) {
      parsedSkills = [];
    }

    res.render('card', {
      profile: profile,
      skills: parsedSkills,
      successMessage: null
    });
  });
});

app.get('/profiles', (req, res) => {
  db.getAllProfiles((err, profiles) => {
    if (err) {
      return res.status(500).send('Error retrieving profiles');
    }

    const formattedProfiles = (profiles || []).map((profile) => {
      let skillsArray = [];
      try {
        skillsArray = JSON.parse(profile.skills);
      } catch (e) {
        skillsArray = [];
      }
      return {
        ...profile,
        parsedSkills: skillsArray
      };
    });

    res.render('profiles', { profiles: formattedProfiles });
  });
});

app.get('/api/profiles', (req, res) => {
  db.getAllProfiles((err, profiles) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(profiles || []);
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

module.exports = app;
