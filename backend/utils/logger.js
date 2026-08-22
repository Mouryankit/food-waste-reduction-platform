const fs = require("fs");
const path = require("path");

const logDirectory = path.join(__dirname, "../logs");

// Create logs folder if it doesn't exist
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logFile = path.join(logDirectory, "app.log");

const writeLog = (level, message) => {
    const timestamp = new Date().toISOString();

    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    // Write log to file
    fs.appendFileSync(logFile, logMessage);

    // Also show log in terminal
    if (level === "ERROR") {
        console.error(logMessage.trim());
    } else {
        console.log(logMessage.trim());
    }
};

const logger = {
    info: (message) => writeLog("INFO", message),
    error: (message) => writeLog("ERROR", message),
};

module.exports = logger;