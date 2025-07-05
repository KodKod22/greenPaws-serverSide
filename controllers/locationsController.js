const  dbConnection  = require('../dbConnection.js');
exports.locationsController = {
 async getLocations(req, res) {
  try {
    const result = await dbConnection.query(`
      SELECT 
        locations.locationsid,
        cities.cityname,
        locations.street,
        locations.animelfood,
        locations.status,
        locations.foodcapacity,
        locations.landmarks
      FROM locations
      INNER JOIN cities ON locations.cityid = cities.cityid
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
                locations.locationsid,
                locations.street,
                locations.animelfood,
                locations.status,
                locations.foodcapacity,
                locations.landmarks,
                cities.cityname
            FROM locations
            INNER JOIN cities ON locations.cityid = cities.cityid
            WHERE locations.locationsid = $1
        `, [locationId]);
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
            const { locationId ,animalFood , status , foodCapacity } = req.body;
            
            if (!locationId) {
                return res.status(400).json({ error: "locationId is required" });
            }
            const fieldsToUpdate =[];
            const values = [];
            let index = 1;

            if (animalFood !== undefined) {
                fieldsToUpdate.push(`animelfood = $${index++}`);
                values.push(animalFood);
            }
            if (status !== undefined) {
                fieldsToUpdate.push(`status = $${index++}`);
                values.push(status);
            }
            if (foodCapacity !== undefined) {
                fieldsToUpdate.push(`foodcapacity = $${index++}`);
                values.push(foodCapacity);
            }
            values.push(locationId);
            const query = `UPDATE Locations SET ${fieldsToUpdate.join(', ')} WHERE locationsid = $${index} RETURNING *`;

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
            const { city , streetName , animalFood , status } = req.body;
            let cityId;
            const cityIdResult = await dbConnection.query('SELECT cityid from cities WHERE cityname = $1',[city]);

            if (cityIdResult.rows.length > 0) {
                cityId = cityIdResult.rows[0].cityid;
            }else{
                const newCityIdResult = await dbConnection.query('INSERT INTO cities (cityname) VALUES ($1) RETURNING cityid',[city]);
                cityId = newCityIdResult.rows[0].cityid;
            }

            const locationResult = await dbConnection.query('SELECT locationsid from locations WHERE street = $1 AND cityid = $2',[streetName,cityId]);
            if (locationResult.rows.length > 0 ) {
                return res.status(409).json({error: "Location already exists"});
            }

            const encoded = encodeURIComponent(`${streetName} , ${city}`);
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${process.env.API_KEY}`;
            const resolute = await fetch(url);
            const data = await resolute.json();

            const landmarks = data.results[0].geometry.location;
            const landmarksText = `${landmarks.lat},${landmarks.lng}`;
            const insertLocation = await dbConnection.query('INSERT INTO Locations (cityid, street, animelfood, status, landmarks) VALUES ($1, $2, $3, $4, $5) RETURNING locationsid', [cityId, streetName, animalFood, status,landmarksText]);

            const locationId = insertLocation.rows[0].locationsid;

            res.status(200).json({ message: "Location added successfully",locationId,});

        }catch(err){
            console.error("Add location error:", err);
            res.status(500).json({ error: "Server error during addLocation" });
        }
        
    }, async removeLocation(req,res){
        try{
            const { locationId } = req.body;
            await dbConnection.query('DELETE FROM RecycleActivity WHERE locationid = $1', [locationId]);
            await dbConnection.query('DELETE FROM userReguests WHERE locationid = $1', [locationId]);
            const result =  await dbConnection.query('DELETE FROM Locations WHERE locationsid = $1', [locationId]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Location not found" });
            }
            res.status(200).json({ message: "Location deleted successfully" });
        }catch(err){
            res.status(500).json({ error: 'Server error' });
        }

    },
    async addBottles(req,res) {
        try{
            const { userID, locationId, bottleCount } = req.body;   
            const result = await dbConnection.query('INSERT INTO recycleactivity (userid, locationid, bottlecount,logdate) VALUES ($1,$2,$3,NOW())',[userID, locationId, bottleCount]);
            res.status(200).json({ message: "Bottles added", entry: result.rows[0] });
            const REDUCTION_PER_BOTTLE = 2; 
            const reduction = bottleCount * REDUCTION_PER_BOTTLE;

            await dbConnection.query(`UPDATE Locations SET foodcapacity = GREATEST(foodcapacity - $1, 0) WHERE locationsId = $2`, [reduction, locationId]);
        }catch(err){
            res.status(500).json({ error: 'Server error' });
        }
    }
}