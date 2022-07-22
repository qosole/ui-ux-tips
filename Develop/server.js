const express = require('express');
const path = require('path');
const { clog } = require('./middleware/clog');
const api = require('./routes/index.js');
const diagnostics = require('./db/diagnostics.json');
const fs = require('fs');

const PORT = process.env.port || 3001;

const app = express();

// Import custom middleware, "cLog"
app.use(clog);

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', api);

app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for feedback page
app.get('/feedback', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/pages/feedback.html'))
);

// GET Route for /api/diagnostics
app.get('/api/diagnostics', (req, res) => {
  res.json(diagnostics);
})

// POST route for /api/diagnostics
app.post('/api/diagnostics', (req, res) => {
  const {time, error_id, errors} = req.body;

  // Verfiying that the request is valid
  if (time && error_id && errors) {
    const newDiagnostic = {
      time,
      error_id,
      errors
    };

    fs.readFile('./db/diagnostics.json', 'utf-8', (err, data) => {
      let existingData = JSON.parse(data);
      existingData.push(newDiagnostic);
      fs.writeFile('./db/diagnostics.json', JSON.stringify(existingData), (err) => {
        err ? console.log(err) : console.log('Data successfully written!');
        res.json(existingData);
      })
    })
  } else {
    res.json('error');
  }
})

// GET Route for wildcard routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/404.html'))
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
