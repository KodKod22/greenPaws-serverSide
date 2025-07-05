const  dbConnection  = require('../dbConnection.js');
const bcrypt = require('bcrypt');
exports.usersController = {
    async getUser(req, res) {
    const { userName , userPassword} = req.body;

    try {
            const result = await dbConnection.query('SELECT * FROM "User" WHERE username = $1',[userName]); 

            if (result.rows.length === 0) {
                console.log("User not found");
                return res.status(404).json({ message: "User not found" });
            }
            const hashUserPassword = result.rows[0].userpassword;
            bcrypt.compare(userPassword,hashUserPassword)
                .then( isMatch => {
                    if (isMatch) {
                        const userInfo = {
                            userId:result.rows[0].userid,
                            userName:result.rows[0].username,
                            userType:result.rows[0].usertype,
                            userImag:result.rows[0].imagtrace 
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
            const { userId } = req.query;
            const resolute = await dbConnection.query(`
                SELECT 
                    locations.street,
                    SUM(RecycleActivity.bottleCount) AS total_bottles
                FROM RecycleActivity
                INNER JOIN locations ON RecycleActivity.locationID = locations.locationsid
                WHERE 
                    userID = $1
                    AND RecycleActivity.logDate >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                GROUP BY locations.street;`,[userId]);
            if (resolute.rows.length === 0) {
               return res.status(404).json({message:"no recycle activity in the data base of the user"});
            }
            res.status(200).json(resolute.rows);
        }catch(error){
            res.status(500).json({error:'Database error'});
        }
    }
}