const express = require('express');
const cors = require('cors');
const path = require('path');
const { initTables, insertInitialData } = require('./utils/initDB');
const { insertSeedData } = require('./utils/seedData');

const app = express();
const port = 8425;

app.use(cors());
app.use(express.json());

const db = require('./config/database');

initTables();
insertInitialData();
insertSeedData();

const routes = require('./routes/index');
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});