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