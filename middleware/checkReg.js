const dbConnection = require('../dbConnection');

module.exports = {
    async checkBottlesCount(req, res, next) {
        try {
            const { bottle_count } = req.body;

            if (bottle_count <= 0) {
                return res.status(400).json({ err: "bottle_count can't be negative or zero" });
            }

            next();
        } catch {
            res.status(500).json({ error: 'Server error in validation middleware: checkBottlesCount' });
        }
    },

    async checkUser(req, res, next) {
        try {
            const { user_id } = req.body;
            
            const user = await dbConnection.query('SELECT * FROM users WHERE user_id = $1', [user_id]);

            if (user.rows.length === 0) {
                return res.status(400).json({ err: "User could not be found" });
            }

            next();
        } catch {
            res.status(500).json({ error: 'Server error in validation middleware: checkUser' });
        }
    },

    async checkLocationIsActive(req, res, next) {
        try {
            const { location_id } = req.body;
            const location = await dbConnection.query(
                "SELECT * FROM locations WHERE location_id = $1 AND status = 'active'",
                [location_id]
            );

            if (location.rows.length === 0) {
                return res.status(400).json({ err: "Location is inactive" });
            }

            next();
        } catch {
            res.status(500).json({ error: 'Server error in validation middleware: checkLocationIsActive' });
        }
    },

    async checkLocation(req, res, next) {
        try {
            const { location_id } = req.body;
            const location = await dbConnection.query(
                "SELECT * FROM locations WHERE location_id = $1",
                [location_id]
            );

            if (location.rows.length === 0) {
                return res.status(400).json({ err: "No location found in the database" });
            }

            next();
        } catch {
            res.status(500).json({ error: 'Server error in validation middleware: checkLocation' });
        }
    }
};

