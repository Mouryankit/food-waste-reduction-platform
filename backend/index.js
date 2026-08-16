const app = require("./app.js");
const connectDb = require("./config/db.js");
require('dotenv').config();

connectDb();

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
