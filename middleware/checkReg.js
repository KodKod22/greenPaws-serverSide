const dbConnection = require('../dbConnection');

module.exports = {
    async checkBottlesCount(req, res, next) {
        try {
            const { bottleCount } = req.body;

            if (bottleCount <= 0) {
                return res.status(400).json({ err: "bottleCount can't be negative or zero" });
            }

            next();
        } catch {
            res.status(500).json({ error: 'Server error in validation middleware: checkBottlesCount' });
        }
    },

    async checkUser(req, res, next) {
        try {
            const { userId } = req.body;
            const user = await dbConnection.query('SELECT * FROM "User" WHERE userId = $1', [userId]);

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
            const { locationId } = req.body;
            const location = await dbConnection.query(
                "SELECT * FROM Locations WHERE locationsId = $1 AND status = 'active'",
                [locationId]
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
            const { locationId } = req.body;
            const location = await dbConnection.query(
                "SELECT * FROM Locations WHERE locationsId = $1",
                [locationId]
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

