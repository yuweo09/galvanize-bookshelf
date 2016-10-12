'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const token = require('./routes/token');
const tracks = require('./routes/tracks');
const users = require('./routes/users');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
app.use(token);
app.use(tracks);
app.use(users);






app.use((req, res) => {
  res.send('error');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
