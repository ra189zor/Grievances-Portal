// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  grievances;
  currentUserId;
  currentGrievanceId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.grievances = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentGrievanceId = 1;
    this.initializeUsers();
  }
  initializeUsers() {
    const ayeshu = {
      id: 1,
      username: "ayeshu",
      password: "babygirl",
      name: "Ayeshu",
      role: "submitter"
    };
    const abdullah = {
      id: 2,
      username: "abdullah",
      password: "abdullah123",
      name: "Abdullah",
      role: "viewer"
    };
    this.users.set(1, ayeshu);
    this.users.set(2, abdullah);
    this.currentUserId = 3;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getAllGrievances() {
    return Array.from(this.grievances.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }
  async getGrievancesByUser(userId) {
    return Array.from(this.grievances.values()).filter((grievance) => grievance.submittedBy === userId).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }
  async createGrievance(insertGrievance) {
    const id = this.currentGrievanceId++;
    const grievance = {
      ...insertGrievance,
      id,
      submittedAt: /* @__PURE__ */ new Date(),
      status: "new"
    };
    this.grievances.set(id, grievance);
    return grievance;
  }
  async updateGrievanceStatus(id, status) {
    const grievance = this.grievances.get(id);
    if (grievance) {
      const updated = { ...grievance, status };
      this.grievances.set(id, updated);
      return updated;
    }
    return void 0;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull()
  // 'submitter' or 'viewer'
});
var grievances = pgTable("grievances", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  mood: text("mood").notNull(),
  severity: text("severity").notNull(),
  // 'low', 'medium', 'high', 'urgent'
  submittedBy: integer("submitted_by").notNull().references(() => users.id),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  status: text("status").notNull().default("new")
  // 'new', 'read', 'resolved'
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true
});
var insertGrievanceSchema = createInsertSchema(grievances).pick({
  title: true,
  description: true,
  mood: true,
  severity: true,
  submittedBy: true
});

// server/routes.ts
import session from "express-session";
import nodemailer from "nodemailer";
var createGmailTransporter = () => {
  const gmailEmail = process.env.GMAIL_EMAIL;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  if (!gmailEmail || !gmailAppPassword) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail,
      pass: gmailAppPassword
    }
  });
};
async function sendGmailNotification(grievance, user) {
  try {
    const transporter = createGmailTransporter();
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    if (!transporter || !recipientEmail) {
      console.log("Gmail credentials not configured, skipping email notification");
      return;
    }
    const severityEmojis = {
      "low": "\u{1F49A}",
      "medium": "\u{1F49B}",
      "high": "\u{1F49C}",
      "urgent": "\u2764\uFE0F"
    };
    const emailSubject = `\u{1F495} New Grievance from ${user.name} - ${severityEmojis[grievance.severity]} ${grievance.severity.toUpperCase()}`;
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FFF0F5 0%, #FFE4E6 100%); padding: 20px; border-radius: 20px;">
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(255, 105, 180, 0.1);">
          <h1 style="color: #8B008B; text-align: center; margin-bottom: 30px; font-size: 24px;">
            \u{1F514} New Message from Pookie Portal
          </h1>
          
          <div style="background: linear-gradient(45deg, rgba(255,182,193,0.1), rgba(255,105,180,0.05)); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255, 182, 193, 0.3);">
            <h2 style="color: #FF69B4; margin: 0 0 15px 0; font-size: 20px;">
              \u{1F48C} ${grievance.title}
            </h2>
            
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
              <div style="background: rgba(255, 105, 180, 0.1); padding: 8px 15px; border-radius: 20px; border: 1px solid rgba(255, 105, 180, 0.3);">
                <strong style="color: #8B008B;">Mood:</strong> 
                <span style="font-size: 18px;">${grievance.mood}</span>
              </div>
              <div style="background: rgba(255, 20, 147, 0.1); padding: 8px 15px; border-radius: 20px; border: 1px solid rgba(255, 20, 147, 0.3);">
                <strong style="color: #8B008B;">Severity:</strong> 
                <span style="font-size: 16px;">${severityEmojis[grievance.severity]} ${grievance.severity.toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div style="background: #FAFAFA; padding: 20px; border-radius: 10px; border-left: 4px solid #FF69B4; margin-bottom: 20px;">
            <h3 style="color: #8B008B; margin: 0 0 10px 0;">Message:</h3>
            <p style="color: #333; line-height: 1.6; margin: 0; font-size: 16px;">
              ${grievance.description}
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, rgba(255, 105, 180, 0.05), rgba(255, 20, 147, 0.05)); border-radius: 10px;">
            <p style="color: #8B008B; margin: 0; font-style: italic;">
              \u{1F495} Sent with love from <strong>${user.name}</strong> via Pookie Portal
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              ${new Date(grievance.submittedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;
    const emailText = `
\u{1F514} New Grievance from ${user.name}

Title: ${grievance.title}
Mood: ${grievance.mood}
Severity: ${severityEmojis[grievance.severity]} ${grievance.severity.toUpperCase()}

Message:
${grievance.description}

\u{1F495} Sent with love from Pookie Portal
${new Date(grievance.submittedAt).toLocaleString()}
    `.trim();
    await transporter.sendMail({
      from: `"Pookie Portal \u{1F495}" <${process.env.GMAIL_EMAIL}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });
    console.log("Gmail notification sent successfully");
  } catch (error) {
    console.error("Gmail notification error:", error);
  }
}
async function sendTelegramNotification(grievance, user) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) {
      console.log("Telegram credentials not configured, skipping notification");
      return;
    }
    const severityEmojis = {
      "low": "\u{1F49A}",
      "medium": "\u{1F49B}",
      "high": "\u{1F49C}",
      "urgent": "\u2764\uFE0F"
    };
    const message = `
\u{1F514} *New Grievance from ${user.name}*

*Title:* ${grievance.title}
*Mood:* ${grievance.mood}
*Severity:* ${severityEmojis[grievance.severity]} ${grievance.severity.toUpperCase()}

*Message:*
${grievance.description}

\u{1F495} _Sent with love from Pookie Portal_
    `.trim();
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });
    if (response.ok) {
      console.log("Telegram notification sent successfully");
    } else {
      console.error("Failed to send Telegram notification:", await response.text());
    }
  } catch (error) {
    console.error("Telegram notification error:", error);
  }
}
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "pookie-portal-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/grievances", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let grievances2;
      if (user.role === "viewer") {
        grievances2 = await storage.getAllGrievances();
      } else {
        grievances2 = await storage.getGrievancesByUser(user.id);
      }
      const grievancesWithUser = await Promise.all(
        grievances2.map(async (grievance) => {
          const submitter = await storage.getUser(grievance.submittedBy);
          return {
            ...grievance,
            submitterName: submitter?.name || "Unknown"
          };
        })
      );
      res.json(grievancesWithUser);
    } catch (error) {
      console.error("Get grievances error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/grievances", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role !== "submitter") {
        return res.status(403).json({ message: "Only Ayeshu can submit grievances" });
      }
      const validatedData = insertGrievanceSchema.parse({
        ...req.body,
        submittedBy: user.id
      });
      const grievance = await storage.createGrievance(validatedData);
      await Promise.all([
        sendTelegramNotification(grievance, user),
        sendGmailNotification(grievance, user)
      ]);
      res.status(201).json(grievance);
    } catch (error) {
      console.error("Create grievance error:", error);
      res.status(500).json({ message: "Failed to create grievance" });
    }
  });
  app2.patch("/api/grievances/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const grievanceId = parseInt(req.params.id);
      const updated = await storage.updateGrievanceStatus(grievanceId, status);
      if (!updated) {
        return res.status(404).json({ message: "Grievance not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Update grievance status error:", error);
      res.status(500).json({ message: "Failed to update grievance" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
