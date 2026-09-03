# User Profile Card Generator

A form-based web application built with Node.js, Express, EJS, and SQLite. Features real-time dynamic preview as users type, server-side processing, customizable avatars, and dynamic profile card rendering with PNG export.

## Features

- Real-time dynamic card preview while filling out the form on the left
- One-click profile card download as PNG image
- Expanded collection of 11 avatar styles (Robots, Friendly, Adventurer, Pixel Art, Fun Emoji, Notionists, Doodles, Minimalist, Thumbs, Initials, and Artistic)
- Dynamic HTML card and avatar preview generation
- Server-side form processing and string manipulation
- Clean input formatting (title-casing, URL validation, skill parsing)
- Database persistence using SQLite with fallback support
- Responsive, modern user interface
- Ready for one-click deployment on Vercel

## Tech Stack

- Node.js
- Express.js
- EJS (Embedded JavaScript templates)
- SQLite3
- HTML5 Canvas / html2canvas
- Vanilla CSS

## Getting Started Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/kaavi02/UserProfileCardGenerator.git
   cd UserProfileCardGenerator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Deploying to Vercel

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com).
3. Click **Add New Project** and import `UserProfileCardGenerator`.
4. Leave the default build settings and click **Deploy**.