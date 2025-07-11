const  dbConnection  = require('../dbConnection.js');
exports.requestController = {
    async addRequest(req,res){
        try{
            const { userId, locationId, description } = req.body;
            const result = await dbConnection.query(
                'INSERT INTO userreguests (userID, locationsid, description, createat) VALUES ($1,$2,$3,NOW())',
                [userId, locationId, description]
            );
            res.status(200).json({ message: "request has been added", entry: result.rows[0] });
        }catch(err){
            res.status(500).json({error:'Database error'})
        }
    },
    async getUserRequest(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId param is missing" });
    }

    const result = await dbConnection.query(`
      SELECT userreguests.requestID, locations.street, userreguests.description,
             userreguests.adminrespons, userreguests.status, userreguests.createat
      FROM userreguests 
      INNER JOIN locations ON userreguests.locationsid = locations.locationsid
      WHERE userreguests.userid = $1`, [userId]);

    if (result.rows.length === 0) {
      return res.status(200).json([]);    
    }

    const formattedRows = result.rows.map(row => ({
      ...row,
      
      createat: new Date(row.createat).toLocaleDateString("he-IL")
    }));

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error("getUserRequest error:", error);
    res.status(500).json({ error: 'Database error' });
  }
},
    async getRequests(req,res){
        try{
            const result = await dbConnection.query(`
                SELECT locations.street,
                userreguests.requestID AS requestId,
                "User".username AS username,
                userreguests.description,
                userreguests.adminrespons,
                userreguests.status,
                userreguests.createat
                FROM userreguests
                INNER JOIN locations ON userreguests.locationsid = locations.locationsid
                INNER JOIN "User" ON userreguests.userid = "User".userid`);            
            const formattedRows = result.rows.map(row => ({...row,
                createat: new Date(row.createat).toISOString().split('T')[0]}));
            res.status(200).json(formattedRows);
        }catch(error){
             console.error("getRequests error:", error);
            res.status(500).json({error:'Database error'});
        }
    },
    async updateRequest(req,res){
         console.log("🔥 Reached updateRequest route");
        try{
            const { requestId , status , adminResponds } = req.body;
            console.log(req.body);
            const fieldsToUpdate =[];
            const values = [];
            let index = 1;
            if (status !== undefined) {
                fieldsToUpdate.push(`status = $${index++}`);
                values.push(status);   
            }
         if (adminResponds !== undefined) {
                fieldsToUpdate.push(`adminRespons = $${index++}`);
                console.log(adminResponds);
                values.push(adminResponds); 
            }
            values.push(requestId);
            console.log(values);
            const query = `UPDATE userReguests SET ${fieldsToUpdate.join(', ')} WHERE requestid = $${index} RETURNING *`;
            const result = await dbConnection.query(query, values);
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "User request not found" });
            }

            res.status(200).json({ message: "User request updated successfully", location: result.rows[0] });
        }catch(error){
            console.error("Update error:", error);
            res.status(500).json({ err: "Server error during update" });
        }
    },
    async deleteRequest(req,res){
     try{
            const { requestId } = req.params;
            const result = await dbConnection.query('DELETE FROM userReguests WHERE requestID = $1', [requestId]); 
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Request not found" });
            }
            res.status(200).json({ message: "Request deleted successfully" });
        }catch(err){
            res.status(500).json({ error: 'Server error' });
        }

    }
}