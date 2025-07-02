const  dbConnection  = require('../dbConnection.js');
exports.locationsController = {
    async getLocations(req,res){
        try{
            const result = await dbConnection.query('SELECT * FROM Locations')
            
            res.status(200).json(result.rows);
        }catch(err){
            
            res.status(500).json({error:'Database error'})
        }

    },
    async getLocation(req,res){
        try{
            const result = await dbConnection.query('SELECT * FROM Locations WHERE locationsid = $1',[req.body.id]);
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