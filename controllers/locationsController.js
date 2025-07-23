const  dbConnection  = require('../dbConnection.js');
exports.locationsController = {
 async getLocations(req, res) {
  try {
    const result = await dbConnection.query(`
      SELECT 
        locations.location_id,
        cities.city_name,
        locations.street,
        locations.animal_food,
        locations.status,
        locations.food_capacity,
        locations.landmarks
      FROM locations
      INNER JOIN cities ON locations.city_id = cities.city_id
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("getLocations error:", err);
    res.status(500).json({ error: 'Database error' });
  }
},
    async getLocation(req,res){
        try{
             const { locationId } = req.params;
            const result = await dbConnection.query(`
            SELECT 
                locations.location_id,
                locations.street,
                locations.animal_food,
                locations.status,
                locations.food_capacity,
                locations.landmarks,
                cities.city_name
            FROM locations
            INNER JOIN cities ON locations.city_id = cities.city_id
            WHERE locations.location_id = $1
        `, [locationId]);
            if (result.rows.length === 0) {
               return res.status(404).json({message:"no location in the data base"});
            }
            res.status(200).json(result.rows);
        }catch(err){
            res.status(500).json({error:'Database error'});
        }
    },
    async getLocationByName(req,res){
        try{
            const { city , streetName } = req.query;
            let city_id;
                       const cityIdResult = await dbConnection.query('SELECT city_id FROM cities WHERE LOWER(city_name) = LOWER($1)', [city]);
            if (cityIdResult.rows.length > 0) {
                city_id = cityIdResult.rows[0].city_id;
            }
 

            const result = await dbConnection.query(`SELECT location_id FROM locations WHERE city_id = $1 AND LOWER(street) = LOWER($2)`, [city_id, streetName]);
            if (result.rows.length === 0) {
               return res.status(404).json({message:"no location in the data base"});
            }
            res.status(200).json(result.rows);
        }catch(err){
            res.status(500).json({error:'Database error'});
        }
    },
    async updateLocation(req,res){
        try{
            const { location_id ,animal_food , status , food_capacity } = req.body;
            
            if (!location_id) {
                return res.status(400).json({ error: "locationId is required" });
            }
            const fieldsToUpdate =[];
            const values = [];
            let index = 1;

            if (animal_food !== undefined) {
                fieldsToUpdate.push(`animal_food = $${index++}`);
                values.push(animal_food);
            }
            if (status !== undefined) {
                fieldsToUpdate.push(`status = $${index++}`);
                values.push(status);
            }
            if (food_capacity !== undefined) {
                fieldsToUpdate.push(`food_capacity = $${index++}`);
                values.push(food_capacity);
            }
            values.push(location_id);
            const query = `UPDATE locations SET ${fieldsToUpdate.join(', ')} WHERE location_id = $${index} RETURNING *`;

            const result = await dbConnection.query(query, values);
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Location not found" });
            }

            res.status(200).json({ message: "Location updated successfully", location: result.rows[0] });
        }catch(err){
            console.error("Update error:", err);
            res.status(500).json({ err: "Server error during update" });
        }
        

    },
    async addLocation(req,res){
        try{
            const { city , streetName , animalFood , status } = req.body.newLocation;
            let city_id;
            if (!city || !streetName || !animalFood || !status) {
                return res.status(400).json({ error: "undefine arguments" });
            }
            
            const encoded = encodeURIComponent(`${streetName} , ${city}`);
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${process.env.API_KEY}`;
            const resolute = await fetch(url);
            const data = await resolute.json();
            if (data.status !== "OK" || !data.results || data.results.length === 0) {
                return res.status(400).json({ error: "Invalid location or not found" });
            }
            

            const addressComponents = data.results[0].address_components;
            const cityComponent = addressComponents.find(c => c.types.includes("locality"));
            const validCityName = cityComponent ? cityComponent.long_name : null;
            
            if (!validCityName) {
               
                return res.status(400).json({ error: "City not found in map data" });
            }

        
            if (validCityName.toLowerCase() !== city.toLowerCase()) {
                return res.status(400).json({ error: `City name mismatch`});
            }
            
            const cityIdResult = await dbConnection.query('SELECT city_id from cities WHERE city_name = $1',[validCityName]);

            if (cityIdResult.rows.length > 0) {
                city_id = cityIdResult.rows[0].city_id;
            }else{
                const newCityIdResult = await dbConnection.query('INSERT INTO cities (city_name) VALUES ($1) RETURNING city_id',[validCityName]);
                city_id = newCityIdResult.rows[0].city_id;
            }
            const normalizedStreet = streetName.trim().toLowerCase();
            const locationResult = await dbConnection.query(
                'SELECT location_id FROM locations WHERE LOWER(street) = $1 AND city_id = $2',[normalizedStreet, city_id]
            );
            if (locationResult.rows.length > 0 ) {
                return res.status(409).json({ error: "Location already exists" });
            }

            const landmarks = data.results[0].geometry.location;
            const landmarksText = `${landmarks.lat},${landmarks.lng}`;
            const insertLocation = await dbConnection.query(
                'INSERT INTO locations (city_id, street, animal_food, status, landmarks) VALUES ($1, $2, $3, $4, $5) RETURNING location_id',
                [city_id, normalizedStreet, animalFood, status, landmarksText]
            );

            const newLocation_id = insertLocation.rows[0].location_id;

            res.status(200).json({ message: "Location added successfully",newLocation_id,});

        }catch(err){
            console.error("Add location error:", err);
            res.status(500).json({ error: "Server error during addLocation" });
        }
        
    }, async removeLocation(req,res){
        try{
            const { location_id } = req.params;
            await dbConnection.query('DELETE FROM recycle_activity WHERE location_id  = $1', [location_id]);
            await dbConnection.query('DELETE FROM user_reports WHERE location_id  = $1', [location_id]);
            const result =  await dbConnection.query('DELETE FROM locations WHERE location_id  = $1', [location_id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Location not found" });
            }
            res.status(200).json({ message: "Location deleted successfully" });
        }catch(err){
            console.error("Remove location error:", err);
            res.status(500).json({ error: 'Server error' });
        }

    },
    async addBottles(req,res) {
        try{
            const {  user_id,location_id, bottle_count } = req.body;   
            const result = await dbConnection.query('INSERT INTO recycle_activity ( user_id,location_id,bottle_count,log_date) VALUES ($1,$2,$3,NOW())',[user_id,location_id,bottle_count]);
            res.status(200).json({ message: "Bottles added", entry: result.rows[0] });
            const REDUCTION_PER_BOTTLE = 2; 
            const reduction = bottle_count * REDUCTION_PER_BOTTLE;

            await dbConnection.query(`UPDATE locations SET food_capacity = GREATEST(food_capacity - $1, 0) WHERE location_id = $2`, [reduction,location_id]);
        }catch(err){
            res.status(500).json({ error: 'Server error' });
        }
    },
    
}