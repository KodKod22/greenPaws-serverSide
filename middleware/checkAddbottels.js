const dbConnection = require('../dbConnection');
module.exports = async (req,res,next) => {
    try{
        const { userID, locationId, bottleCount } = req.body; 
        const user = await dbConnection.query('SELECT * from "User" where userid = $1',[userID]);
        if(user.rows.length === 0 ){
            return res.status(400).json({err: "user could not be found"})
        }
        const location = await dbConnection.query("SELECT * from Locations where locationsId = $1 and status = 'active'",[locationId]);
        if (location.rows.length === 0) {
            return res.status(400).json({err: "location is inactive"})
        }
            
        if(bottleCount <= 0){
            return res.status(400).json({err: "bottleCount cant be a negative or zero value"})
        }
        next();
    }catch{
        res.status(500).json({ error: 'Server error in validation middleware' });
    }
    
}