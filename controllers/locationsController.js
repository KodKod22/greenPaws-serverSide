const  dbConnection  = require('../dbConnection.js');
exports.locationsController = {
    async getLocations(req,res){
        try{
            const result = await dbConnection.query('SELECT * FROM Locations')
            res.status(200).json(result.rows);
        }catch(err){
            console.error("error fetching locations:",err);
            res.status(500).json({error:'Database error'})
        }

    }
}