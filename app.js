const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use Helmet for security headers
app.use(helmet());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS for templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use routes
const routes = require('./routes/index');
app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Globetrotter app is running at http://localhost:${port}`);
});
