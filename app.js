const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // collect default Node.js metrics

// 🔐 Security headers
app.use(helmet());

// 🚀 Register /metrics BEFORE static or other routes
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// 🧠 Parse form data
app.use(express.urlencoded({ extended: false }));

// 🗂️ Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// 🎨 Templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 📦 Routes
const routes = require('./routes/index');
app.use('/', routes);

// 🎧 Start the app
app.listen(port, () => {
  console.log(`Globetrotter app is running at http://localhost:${port}`);
});
