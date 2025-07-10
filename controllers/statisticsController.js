const  dbConnection  = require('../dbConnection.js');
exports.statisticsController = {
    async getLocationStats(req,res){
        try{
            const { locationId } = req.params;
            const resolute = await dbConnection.query(`
                SELECT 
                    locations.street,
                    SUM(RecycleActivity.bottleCount) AS total_bottles
                FROM RecycleActivity
                INNER JOIN locations ON RecycleActivity.locationID = locations.locationsid
                WHERE 
                    locationsid = $1
                    AND RecycleActivity.logDate >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                GROUP BY locations.street;`,[locationId]);
         if (resolute.rows.length === 0) {
               return res.status(404).json({message:"no recycle activity in the data base of the location"});
            }
            res.status(200).json(resolute.rows);
        }catch(error){
            console.error("getLocationStats error:", error);
            res.status(500).json({error:'Database error'});
        }
    },async getAllLocationsStats(req,res){
          try{
            const resolute = await dbConnection.query(`
                SELECT 
                    locations.street,
                    SUM(RecycleActivity.bottlecount) AS total_bottles
                FROM RecycleActivity
                INNER JOIN locations ON RecycleActivity.locationid = locations.locationsid
                WHERE 
                    RecycleActivity.logdate >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                GROUP BY locations.street;`);
            if (resolute.rows.length === 0) {
               return res.status(404).json({message:"no recycle activity in the data base of all the locations"});
            }
            res.status(200).json(resolute.rows);
        }catch(error){
            res.status(500).json({error:'Database error'});
        }
    }
}