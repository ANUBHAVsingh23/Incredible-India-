# Incredible India — 3D Cultural Explorer

A responsive, browser-based guide to India's regions, heritage, food,
festivals, languages, art, and notable people. This project combines HTML,
CSS, JavaScript, and a Three.js map to create a visually rich digital
exploration of India's diversity.

## Project overview

Incredible India is a static web experience that helps users explore India
through culture, identity, geography, and heritage. It brings together state
information, historical places, food traditions, languages, festivals,
art forms, and influential personalities in one interactive platform.

The website is designed for education, discovery, and storytelling. It gives
visitors a simple way to learn about Indian regions, traditions, and cultural
richness in a modern, engaging format.

## Features

- Interactive 3D map of India with zoom, rotation, search, and state selection
- State and Union Territory directory with detailed regional information
- Festival and cuisine pages with search and filter controls
- Historical places section with location-based directions links
- Languages, art, and personalities sections with rich cultural records
- Responsive layout for desktop, tablet, and mobile screens
- About India and About Project pages with educational context

## Tech stack

- HTML5 for page structure and content
- CSS3 for layout, animations, responsiveness, and visual styling
- JavaScript for dynamic filtering, rendering, navigation, and interactivity
- Three.js for the interactive 3D India map
- JSON data files for structured cultural and regional information

## Run the project locally

The project loads JSON data and ES modules, so it should be opened through a
local web server instead of directly opening `index.html` with `file://`.

1. Install Python 3 if it is not already available.
2. Open a terminal in the project root.
3. Start the local server:

   ```powershell
   python -m http.server 8000
   ```

4. Open <http://localhost:8000> in your browser.
5. Press `Ctrl + C` in the terminal to stop the server when finished.

Note: the 3D map loads Three.js from jsDelivr, so an internet connection is
required for that feature. External links for Google Maps and YouTube will
also open in separate browser tabs.

## Project structure

```text
index.html                 Home page and interactive map layout
pages/                     Topic, about, state-list and state-detail pages
css/                       Shared styling, animations, and responsive layouts
js/                        JavaScript behavior and page interactivity
data/                      JSON records and GeoJSON map data
assets/images/             Image assets for states, places, cuisine, and culture
assets/icons/              Site icons and branding
assets/audio/              Audio assets
assets/videos/             Video assets
README.md                  Project documentation
```

## How the code is organized

- `index.html` handles the landing page and 3D map experience.
- `pages/` contains category pages such as states, festivals, food, heritage,
  languages, personalities, and about pages.
- `css/` includes shared styling and components for the whole site.
- `js/` contains shared scripts like navigation logic, map behavior, filter
  logic, and page-specific rendering.
- `data/` stores structured content such as festival records, cuisines,
  state data, major personalities, and map boundaries.
- `assets/` stores images and other media used throughout the app.

## Main page links

- `index.html` — home and 3D map
- `pages/states.html` — state and Union Territory directory
- `pages/state.html?id=<region-id>` — selected region detail page
- `pages/festivals.html` — festivals
- `pages/food.html` — regional cuisine
- `pages/art-culture.html` — art and culture
- `pages/historical-places.html` — historical places and map directions
- `pages/languages.html` — languages and YouTube search links
- `pages/personalities.html` — notable persons
- `pages/about-india.html` — information about India
- `pages/about-project.html` — project overview

## Questions people often ask about this project

### What is this project about?
It is a digital cultural encyclopedia of India built as a responsive website.
It showcases the nation's diversity through states, festivals, food, traditions,
heritage, art, and people.

### Why is the project called "Incredible India"?
Because the website focuses on the beauty, richness, and variety of India's
culture, geography, and heritage in a modern digital format.

### Is this project only for desktop users?
No. The layout is responsive and works across desktop, tablet, and mobile
screens. Navigation adapts on smaller screens, and the content remains
accessible across devices.

### Can I open the project without a local server?
It is best to run it through a local server. Some scripts use module imports
and fetch JSON files, so opening the site directly from the filesystem can lead
to loading problems.

### Does the site require internet access?
The 3D map and some external links require internet access because they load
Three.js and external resources such as Google Fonts, Google Maps, and YouTube.

### Where is the content stored?
The content is mostly stored in JSON files under the `data/` folder. Pages
read these files and convert them into cards and detail sections dynamically.

### Can I add more states, festivals, or food items?
Yes. You can update the matching JSON file in `data/` and add new entries with
images, titles, summaries, and metadata. The JavaScript pages use these files
to render content automatically.

### What makes the site interactive?
The homepage includes a 3D map, live search, zoom controls, region selection,
keyboard-friendly controls, and dynamic filtering for multiple categories.

### Is the project beginner-friendly?
Yes. The project uses straightforward HTML, CSS, and JavaScript files, and
its structure is easy to understand for learners exploring front-end web
development.

### What is the main goal of the project?
The main goal is to present India's culture and heritage in an inspiring,
accessible, and visually engaging way using modern web technologies.

## Editing content

- Update page records in the matching JSON file under `data/`.
- Keep image paths relative to the page or script that uses them, following the
  existing entries.
- State IDs in `data/states.json` are used in links to
  `pages/state.html?id=<region-id>`.
- For an Art & Culture record to show its video link, provide a `videoUrl`.
- If you add new content, keep the structure consistent with existing objects in
  the JSON files so the scripts can render it correctly.

## Contribution ideas

- Add more states or regional highlights
- Expand festival coverage and traditions
- Improve accessibility and keyboard navigation
- Add animation enhancements or richer interactions
- Refine content accuracy and image metadata

## Final note

This project is a cultural and educational web app designed to celebrate the
diversity of India through interactive browsing. It can be used as a portfolio
piece, a learning project, or a digital showcase of Indian heritage and
traditions.
