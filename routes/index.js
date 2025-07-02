const express = require('express');
const router = express.Router();

// GET routes
router.get('/', (req, res) => res.render('index'));
router.get('/destinations', (req, res) => res.render('destinations'));
router.get('/packages', (req, res) => res.render('packages'));
router.get('/contact', (req, res) => res.render('contact'));
router.get('/about', (req, res) => res.render('about'));

// POST route for contact form submission
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Contact Form Submission:', { name, email, message });

  // For now, just send a simple confirmation response
  res.send(`
    <h2>Thank you for contacting us, ${name}!</h2>
    <p>We’ve received your message and will get back to you shortly.</p>
    <a href="/">Return to Home</a>
  `);
});

module.exports = router;
