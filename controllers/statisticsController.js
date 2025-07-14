const  dbConnection  = require('../dbConnection.js');
exports.statisticsController = {
    async getLocationStats(req,res){
        try{
            const { locationId } = req.params;
            const resolute = await dbConnection.query(`
                SELECT 
                    locations.street,
                    SUM(recycle_activity.bottle_count) AS total_bottles
                FROM recycle_activity
                INNER JOIN locations ON recycle_activity.location_id = locations.location_id
                WHERE 
                    location_id = $1
                    AND recycle_activity.log_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
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
                    SUM(recycle_activity.bottle_count) AS total_bottles
                FROM recycle_activity
                INNER JOIN locations ON recycle_activity.location_id = locations.location_id
                WHERE 
                    recycle_activity.log_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
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