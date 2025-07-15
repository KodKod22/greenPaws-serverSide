const  dbConnection  = require('../dbConnection.js');
exports.requestController = {
 async addRequest(req, res) {
    try {
            const { user_id, location_id, description } = req.body;

            if (!description) {
                return res.status(400).json({ message: "didn't enter description" });
            }

            const result = await dbConnection.query(
                'INSERT INTO user_reports (user_id, location_id, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
                [user_id, location_id, description]
            );

            res.status(200).json({ message: "request has been added", entry: result.rows[0] });
        } catch (err) {
            console.error("Add request error:", err);
            res.status(500).json({ error: 'Database error' });
        }
    },
    async getUserRequest(req, res) {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ error: " user_id param is missing" });
    }

    const result = await dbConnection.query(`
      SELECT user_reports.report_id, locations.street, user_reports.description,
             user_reports.admin_response, user_reports.status, user_reports.created_at
      FROM user_reports 
      INNER JOIN locations ON user_reports.location_id = locations.location_id
      WHERE user_reports. user_id = $1`, [user_id]);

    if (result.rows.length === 0) {
      return res.status(200).json([]);    
    }

    const formattedRows = result.rows.map(row => ({
      ...row,
      
      created_at: new Date(row.created_at).toLocaleDateString("he-IL")
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
                user_reports.report_id AS report_id,
                users.user_name AS user_name,
                user_reports.description,
                user_reports.admin_response,
                user_reports.status,
                user_reports.created_at
                FROM user_reports
                INNER JOIN locations ON user_reports.location_id = locations.location_id
                INNER JOIN users ON user_reports.user_id = users.user_id`);            
            const formattedRows = result.rows.map(row => ({...row,
                created_at: new Date(row.created_at).toISOString().split('T')[0]}));
            res.status(200).json(formattedRows);
        }catch(error){
             console.error("getRequests error:", error);
            res.status(500).json({error:'Database error'});
        }
    },
    async updateRequest(req,res){
        
        try{
            const { report_id , status , admin_responds } = req.body;
            
            const fieldsToUpdate =[];
            const values = [];
            let index = 1;
            if (status !== undefined) {
                fieldsToUpdate.push(`status = $${index++}`);
                values.push(status);   
            }
         if (admin_responds !== undefined) {
                fieldsToUpdate.push(`admin_response = $${index++}`);
                values.push(admin_responds); 
            }
            values.push(report_id);
            const query = `UPDATE user_reports SET ${fieldsToUpdate.join(', ')} WHERE report_id = $${index} RETURNING *`;
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
            const { report_id } = req.params;
            
            const result = await dbConnection.query('DELETE FROM user_reports WHERE report_id = $1', [report_id]); 
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Request not found" });
            }
            res.status(200).json({ message: "Request deleted successfully" });
        }catch(err){
            res.status(500).json({ error: 'Server error' });
        }

    }
}