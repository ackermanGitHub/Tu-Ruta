import App from "./app";
import path from "path";
import { pool } from "./db";
import ClientsMap from "./data";
import './ws'

App.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW()");
  res.send(`Hello, World! The time from the DB is ${rows[0].now}`);
});

App.get('/stores', async (req, res) => {
  const { user_id } = req.query;
  try {
    const stores = await pool.query(`SELECT * FROM store WHERE user_id = $1`, [user_id]);
    res.json(stores.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

App.post('/store', async (req, res) => {
  const { user_id, name, address, city, state, zipcode } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO store (user_id, name, address, city, state, zipcode) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, name, address, city, state, zipcode]
    );
    res.json(result.rows[0]);
    console.log(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

App.delete('/store', async (req, res) => {
  const { store_id } = req.body;
  try {
    const result = await pool.query(
      'DELETE FROM store WHERE id = $1',
      [store_id]
    );
    res.json(result.rows[0]);
    console.log(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});



App.get("/api/sender", async (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  res.sendFile(filePath);
});

App.get("/api/reciever", async (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  res.sendFile(filePath);
});

App.get("/api/clients", async (req, res) => {
  res.send({
    clientsMap: {
      size: ClientsMap.size,
      keys: Array.from(ClientsMap.keys()),
    },
    ordersSendersSet: {
      size: ClientsMap.get('ordersSender')?.size,
    },
    ordersRecieversSet: {
      size: ClientsMap.get('ordersReciever')?.size,
    }
  });
});

App.post('/addProfile', async (req, res) => {

  /* 
  CREATE TABLE Profile (
    id INT PRIMARY KEY,
    userId VARCHAR(255),
    marker_id INT,
    phone_number VARCHAR(255),
    email VARCHAR(255),
    userName VARCHAR(255),
    alias VARCHAR(255),
    profile_identifier VARCHAR(255) UNIQUE NOT NULL,
    taxi_category VARCHAR(255),
    userRole VARCHAR(255) DEFAULT 'client',
    licenceNo VARCHAR(255),
    taxi_start FLOAT(2) CHECK (taxi_start >= 1 AND taxi_start <= 5) DEFAULT 5,
    active BOOLEAN DEFAULT false,
    last_location_id INT NOT NULL,
    FOREIGN KEY (last_location_id) REFERENCES Location(id),
    FOREIGN KEY (marker_id) REFERENCES Marker(id)
);
  */
  try {
    const { userId, markerId, phoneNumber, email, userName, alias, profile_identifier, taxi_category, licenceNo, userRole, active, lastLocationId } = req.body;

    // Insert the new profile into the database
    const query = 'INSERT INTO Profile (userId, marker_id, phone_number, email, userName, alias, profile_identifier, taxi_category, userRole, active, last_location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';
    const values = [userId, markerId, phoneNumber, email, userName, alias, profile_identifier, taxi_category, licenceNo, userRole, active, lastLocationId];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]); // Return the inserted profile
  } catch (error) {
    console.error('Error inserting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

})

App.get('/activesTaxis', async (req, res) => {
  try {
    const query = 'SELECT * FROM Profile WHERE userRole = $1 AND active = $2 ORDER BY starts';
    const values = ['taxi', true];
    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});