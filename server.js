const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Handle all routes by serving index.html (for single-page app)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🔮 Numerology Calculator running on port ${port}`);
  console.log(`📱 Local development: http://localhost:${port}`);
});