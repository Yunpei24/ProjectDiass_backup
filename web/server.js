const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// Create an instance of Express
const app = express();
const port = 3000; // Define the port for the server

// Middleware to handle CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Configuration of the MySQL database connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'solaire_db'
});

// Connect to the MySQL database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

// Endpoint to get energy data
app.get('/energyData', (req, res) => {
  // SQL query to fetch the data
  const sql = "SELECT Date, Heures, Meteo_Irradience, PR_Total_Compteurs, Ensoleillement, PR_Reference, Nombre_Panneau, Nombre_Onduleur FROM table_test";

  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Send the entire result set as JSON response
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});