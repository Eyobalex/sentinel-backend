const Alert = require("../models/Alert");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Resend } = require("resend");

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Helper Functions ---

function fetchMockLogs() {
  const logTypes = [
    {
      type: "INFO",
      message: "User login successful",
      ip: "192.168.1.5",
      method: "POST",
      path: "/login",
    },
    {
      type: "INFO",
      message: "Page view",
      ip: "10.0.0.2",
      method: "GET",
      path: "/home",
    },
    {
      type: "WARN",
      message: "Failed login attempt",
      ip: "45.227.254.10",
      method: "POST",
      path: "/login",
    },
    {
      type: "ERROR",
      message: "SQL Injection attempt detected",
      ip: "185.220.101.43",
      method: "GET",
      path: "/products?id=1 OR 1=1",
    },
    {
      type: "ERROR",
      message: "Brute force detected",
      ip: "91.200.12.5",
      method: "POST",
      path: "/admin",
    },
  ];
  return logTypes[Math.floor(Math.random() * logTypes.length)];
}

async function checkIpReputation(ip) {
  if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "127.0.0.1") {
    return { isPublic: false, abuseConfidenceScore: 0, reports: 0 };
  }
  try {
    const response = await axios.get("https://api.abuseipdb.com/api/v2/check", {
      params: { ipAddress: ip, maxAgeInDays: 90 },
      headers: {
        Key: process.env.ABUSEIPDB_API_KEY,
        Accept: "application/json",
      },
    });
    return { isPublic: true, ...response.data.data };
  } catch (error) {
    console.error("AbuseIPDB Error:", error.message);
    return { error: "Failed to check IP reputation" };
  }
}

async function analyzeWithGemini(log, reputation) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
        You are a Tier 1 Security Analyst. Analyze the following server log and IP reputation data.
        Log Entry: ${JSON.stringify(log)}
        IP Reputation: ${JSON.stringify(reputation)}
        Determine the severity of the threat.
        Return ONLY a JSON object with the following structure (no markdown formatting):
        {
            "severity": "High" | "Medium" | "Low",
            "summary": "Brief explanation of the analysis",
            "recommended_action": "What should the admin do?"
        }
        `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      severity: "Medium",
      summary: "AI Analysis failed.",
      recommended_action: "Check logs manually.",
    };
  }
}

async function sendEmailAlert(alertData) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.ALERT_EMAIL_FROM,
      to: [process.env.ALERT_EMAIL_TO],
      subject: `[Sentinel] High Severity Threat Detected: ${alertData.aiAnalysis.summary}`,
      html: `
        <h1>High Severity Threat Detected!</h1>
        <p><strong>Summary:</strong> ${alertData.aiAnalysis.summary}</p>
        <p><strong>Recommended Action:</strong> ${
          alertData.aiAnalysis.recommended_action
        }</p>
        <hr>
        <h3>Log Details:</h3>
        <pre>${JSON.stringify(alertData.rawLog, null, 2)}</pre>
      `,
    });
    if (error) console.error("Resend Error:", error);
    else console.log("Alert email sent successfully. ID:", data.id);
  } catch (error) {
    console.error("Resend Exception:", error);
  }
}

// --- Service Methods ---

exports.performAudit = async () => {
  console.log("Starting single audit...");
  const log = fetchMockLogs();
  const reputation = await checkIpReputation(log.ip);
  const analysis = await analyzeWithGemini(log, reputation);

  const newAlert = new Alert({
    rawLog: log,
    ipReputation: reputation,
    aiAnalysis: analysis,
  });
  await newAlert.save();

  if (analysis.severity === "High") {
    await sendEmailAlert(newAlert);
  }
  return newAlert;
};

exports.performBatchAudit = async (count = 5) => {
  console.log(`Starting batch audit of ${count} logs...`);
  const results = [];
  for (let i = 0; i < count; i++) {
    // Add small delay to avoid rate limits if necessary, or run in parallel
    // Running sequentially to be safe with API limits for now
    const alert = await exports.performAudit();
    results.push(alert);
  }
  return results;
};

exports.getLatestAlerts = async () => {
  return await Alert.find().sort({ timestamp: -1 }).limit(10);
};

exports.getAlertHistory = async (page, limit, filters) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (filters.severity) {
    query["aiAnalysis.severity"] = filters.severity;
  }

  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
    if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
  }

  const alerts = await Alert.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Alert.countDocuments(query);

  return {
    alerts,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalAlerts: total,
  };
};

exports.getAlertStats = async () => {
  const stats = await Alert.aggregate([
    {
      $group: {
        _id: "$aiAnalysis.severity",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = { High: 0, Medium: 0, Low: 0 };
  stats.forEach((s) => {
    if (result[s._id] !== undefined) {
      result[s._id] = s.count;
    }
  });

  return result;
};

exports.createAlert = async (data) => {
  const newAlert = new Alert(data);
  await newAlert.save();
  return newAlert;
};

exports.updateAlert = async (id, data) => {
  const updatedAlert = await Alert.findByIdAndUpdate(id, data, { new: true });
  if (!updatedAlert) throw new Error("Alert not found");
  return updatedAlert;
};

exports.deleteAlert = async (id) => {
  const alert = await Alert.findByIdAndDelete(id);
  if (!alert) throw new Error("Alert not found");
  return alert;
};
