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
    },
    async getUserRequest(req,res){
        try{
            const { userID } = req.body;
            console.log(userID);
            const result = await dbConnection.query('SELECT locations.street, userreguests.description,userreguests.adminrespons,userreguests.status,userreguests.createat FROM userreguests INNER JOIN locations ON userreguests.locationsid = locations.locationsid WHERE userreguests.userid = $1',[userID]);
            if ( result.rows.length === 0) {
                return res.status(404).json({message:"no request in the data base"});
            }
            const formattedRows = result.rows.map(row => ({...row,
                createat: new Date(row.createat).toISOString().split('T')[0]}));
            res.status(200).json(formattedRows);
        }catch(error){
            res.status(500).json({error:'Database error'});
        } 
    }
}