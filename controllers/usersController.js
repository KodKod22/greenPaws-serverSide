const  dbConnection  = require('../dbConnection.js');
const bcrypt = require('bcrypt');
exports.usersController = {
    async getUser(req, res) {
    const { user_name , user_password} = req.body;
        console.log(user_name);
    try {
            const result = await dbConnection.query('SELECT * FROM users WHERE user_name = $1',[user_name]); 

            if (result.rows.length === 0) {
                console.log("User not found");
                return res.status(404).json({ message: "User not found" });
            }
            const hashUserPassword = result.rows[0].user_password;
            bcrypt.compare(user_password,hashUserPassword)
                .then( isMatch => {
                    if (isMatch) {
                        const userInfo = {
                            user_id:result.rows[0].user_id,
                            user_name:result.rows[0].user_name,
                            user_type:result.rows[0].user_type,
                            image_trace:result.rows[0].image_trace 
                        }
                        res.status(200).json(userInfo);
                    }else {
                        res.status(400).json({message:"Wrong password"})
                    }
                })
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    async getUserRecycleStats(req,res){
        try{
            const { user_id } = req.query;
            
            const resolute = await dbConnection.query(`
                SELECT 
                    locations.street,
                    SUM(recycle_activity.bottle_count) AS total_bottles
                FROM recycle_activity
                INNER JOIN locations ON recycle_activity.location_id = locations.location_id
                WHERE 
                    user_id = $1
                    AND recycle_activity.log_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                GROUP BY locations.street;`,[user_id]);
            if (resolute.rows.length === 0) {
               return res.status(404).json({message:"no recycle activity in the data base of the user"});
            }
            res.status(200).json(resolute.rows);
        }catch(error){
            res.status(500).json({error:'Database error'});
        }
    }
}