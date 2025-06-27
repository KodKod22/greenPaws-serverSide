const dbConnection = require('../dbConnection');
module.exports = {
    async checkBottlesCount (req,res,next) {
        try{
            const { bottleCount } = req.body; 
         
            if(bottleCount <= 0){
                return res.status(400).json({err: "bottleCount cant be a negative or zero value"})
            }
            next();
        }catch{
            res.status(500).json({ error: 'Server error in validation middleware BottlesCount' });
        }
    
    },
    async checkUser(req,res,next){
        try{
            const { userID } = req.body;
            const user = await dbConnection.query('SELECT * from "User" where userid = $1',[userID]);
            if(user.rows.length === 0 ){
                return res.status(400).json({err: "user could not be found"})
            }
            next();
        }catch{
            res.status(500).json({ error: 'Server error in validation middleware user' });
        }
    },
    async checkLocationIsActive(req,res,next){
        try{
            const { locationId } = req.body;
            const location = await dbConnection.query("SELECT * from Locations where locationsId = $1 and status = 'active'",[locationId]);
            if (location.rows.length === 0) {
                return res.status(400).json({err: "location is inactive"})
            }
            next();
        }catch{
            res.status(500).json({ error: 'Server error in validation middleware location' });
        }
    },
    async checkLocation(req,res,next){
        try{
            const { locationId } = req.body;
            const location = await dbConnection.query("SELECT * from Locations where locationsId = $1",[locationId]);
            if (location.rows.length === 0) {
                return res.status(400).json({err: "no location in database"})
            }
            next();
        }catch{
            res.status(500).json({ error: 'Server error in validation middleware location' });
        }
    }
}
