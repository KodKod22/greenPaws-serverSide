const  dbConnection  = require('../dbConnection.js');
exports.requestController = {
    async addRequest(req,res){
        try{
            const { userID,locationID,description } = req.body;
            const result = await dbConnection.query('INSERT INTO userreguests (userID,locationsid,description,createat) VALUES ($1,$2,$3,NOW())',[userID,locationID,description]);
            res.status(200).json({ message: "request has been added", entry: result.rows[0] });
        }catch(err){
            res.status(500).json({error:'Database error'})
        }
        

    }
}