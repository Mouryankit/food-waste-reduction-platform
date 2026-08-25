const fs = require("fs");
const path = require("path");

const logDirectory = path.join(__dirname, "../logs");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logFile = path.join(logDirectory, "app.log");

const GRAFANA_OTLP_URL = process.env.GRAFANA_OTLP_URL;
const GRAFANA_OTLP_TOKEN = process.env.GRAFANA_OTLP_TOKEN;
const GRAFANA_OTLP_USERNAME = process.env.GRAFANA_OTLP_USERNAME;

let authHeader = null;
if (GRAFANA_OTLP_USERNAME && GRAFANA_OTLP_TOKEN) {
    const creds = `${GRAFANA_OTLP_USERNAME.trim()}:${GRAFANA_OTLP_TOKEN.trim()}`;
    authHeader = `Basic ${Buffer.from(creds).toString("base64")}`;
}

const getSeverityNumber = (level) => {
    switch (level) {
        case "ERROR": return 17;
        case "WARN": return 13;
        case "DEBUG": return 5;
        case "INFO":
        default:
            return 9;
    }
};

const sendToGrafana = async (level, message) => {
    if (!GRAFANA_OTLP_URL || !authHeader) {
        return;
    }

    const payload = {
        resourceLogs: [
            {
                resource: {
                    attributes: [
                        {
                            key: "service.name",
                            value: { stringValue: "fwrp-backend" }
                        },
                        {
                            key: "deployment.environment",
                            value: { stringValue: process.env.NODE_ENV || "development" }
                        }
                    ]
                },
                scopeLogs: [
                    {
                        scope: {
                            name: "backend-logger"
                        },
                        logRecords: [
                            {
                                timeUnixNano: String(Date.now() * 1000000),
                                severityText: level,
                                severityNumber: getSeverityNumber(level),
                                body: { stringValue: message },
                                attributes: [
                                    {
                                        key: "log.severity",
                                        value: { stringValue: level }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(GRAFANA_OTLP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Grafana OTLP Error] Failed to send log (status: ${response.status}): ${errText}`);
        }
    } catch (error) {
        console.error("[Grafana OTLP Error] Connection error:", error.message);
    }
};

const writeLog = async (level, message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    // 1. Save locally
    fs.appendFileSync(logFile, logMessage + "\n");

    // 2. Print in terminal
    if (level === "ERROR") {
        console.error(logMessage);
    } else {
        console.log(logMessage);
    }

    // 3. Send to Grafana Cloud asynchronously
    sendToGrafana(level, logMessage);
};

const logger = {
    info: (message) => writeLog("INFO", message),
    error: (message) => writeLog("ERROR", message),
};

module.exports = logger;