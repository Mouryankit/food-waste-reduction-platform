const app = require("./app.js");
const connectDb = require("./config/db.js");
require('dotenv').config();

// builtin logger
const logger = require("./utils/logger");

// logger.info("========== TEST LOGGER ==========");
// logger.error("========== TEST ERROR ==========");
logger.info("Testing Grafana Loki connection");

connectDb();

logger.info("Backend started");
logger.error("This is a test error");
// *****************

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
