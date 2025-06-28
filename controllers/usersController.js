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
                            userType:result.rows[0].usertype
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
    }
}