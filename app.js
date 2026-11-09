const express = require('express');
const path = require('node:path');

const app = express();
const projectRoot = __dirname;

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views'));

app.use((request, response, next) => {
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; media-src 'self'; upgrade-insecure-requests"
  );
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(), payment=(), usb=()');

  if (request.secure || request.get('x-forwarded-proto') === 'https') {
    response.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }

  next();
});

app.get('/styles.css', (request, response, next) => {
  response.sendFile(path.join(projectRoot, 'styles.css'), (error) => {
    if (error) next(error);
  });
});

app.get('/script.js', (request, response, next) => {
  response.sendFile(path.join(projectRoot, 'script.js'), (error) => {
    if (error) next(error);
  });
});

app.use('/Photos', express.static(path.join(projectRoot, 'Photos'), {
  dotfiles: 'deny',
  index: false,
  maxAge: '7d',
}));

app.get(['/', '/api'], (request, response) => {
  response.render('index', { year: new Date().getFullYear() });
});

app.use((request, response) => {
  response.status(404).type('text').send('Page not found.');
});

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  console.error(error);
  response.status(500).type('text').send('Something went wrong. Please try again later.');
});

module.exports = app;
