import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGrievanceSchema } from "@shared/schema";
import session from "express-session";
import nodemailer from "nodemailer";
import webpush from 'web-push';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Create Gmail transporter
const createGmailTransporter = () => {
  const gmailEmail = process.env.GMAIL_EMAIL;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmailEmail || !gmailAppPassword) {
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailEmail,
      pass: gmailAppPassword
    }
  });
};

// Gmail notification function
async function sendGmailNotification(grievance: any, user: any) {
  try {
    const transporter = createGmailTransporter();
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    
    if (!transporter || !recipientEmail) {
      console.log('Gmail credentials not configured, skipping email notification');
      return;
    }

    const severityEmojis: { [key: string]: string } = {
      'low': '💚',
      'medium': '💛', 
      'high': '💜',
      'urgent': '❤️'
    };

    const emailSubject = `💕 New Grievance from ${user.name} - ${severityEmojis[grievance.severity]} ${grievance.severity.toUpperCase()}`;
    
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FFF0F5 0%, #FFE4E6 100%); padding: 20px; border-radius: 20px;">
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(255, 105, 180, 0.1);">
          <h1 style="color: #8B008B; text-align: center; margin-bottom: 30px; font-size: 24px;">
            🔔 New Message from Pookie Portal
          </h1>
          
          <div style="background: linear-gradient(45deg, rgba(255,182,193,0.1), rgba(255,105,180,0.05)); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255, 182, 193, 0.3);">
            <h2 style="color: #FF69B4; margin: 0 0 15px 0; font-size: 20px;">
              💌 ${grievance.title}
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
              💕 Sent with love from <strong>${user.name}</strong> via Pookie Portal
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              ${new Date(grievance.submittedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;

    const emailText = `
🔔 New Grievance from ${user.name}

Title: ${grievance.title}
Mood: ${grievance.mood}
Severity: ${severityEmojis[grievance.severity]} ${grievance.severity.toUpperCase()}

Message:
${grievance.description}

💕 Sent with love from Pookie Portal
${new Date(grievance.submittedAt).toLocaleString()}
    `.trim();

    await transporter.sendMail({
      from: `"Pookie Portal 💕" <${process.env.GMAIL_EMAIL}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    console.log('Gmail notification sent successfully');
  } catch (error) {
    console.error('Gmail notification error:', error);
  }
}

// Telegram notification function
async function sendTelegramNotification(grievance: any, user: any) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.log('Telegram credentials not configured, skipping notification');
      return;
    }

    const severityEmojis: { [key: string]: string } = {
      'low': '💚',
      'medium': '💛', 
      'high': '💜',
      'urgent': '❤️'
    };

    const message = `
🔔 *New Grievance from ${user.name}*

*Title:* ${grievance.title}
*Mood:* ${grievance.mood}
*Severity:* ${severityEmojis[grievance.severity]} ${grievance.severity.toUpperCase()}

*Message:*
${grievance.description}

💕 _Sent with love from Pookie Portal_
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      console.log('Telegram notification sent successfully');
    } else {
      console.error('Failed to send Telegram notification:', await response.text());
    }
  } catch (error) {
    console.error('Telegram notification error:', error);
  }
}

// Push notification setup
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const pushSubscriptions = new Map<number, PushSubscription>();

// Configure web push
webpush.setVapidDetails(
  'mailto:' + process.env.GMAIL_EMAIL,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'pookie-portal-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Get current user
  app.get('/api/auth/me', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get all grievances (for Abdullah)
  app.get('/api/grievances', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let grievances;
      if (user.role === 'viewer') {
        // Abdullah can see all grievances
        grievances = await storage.getAllGrievances();
      } else {
        // Ayeshu can only see her own grievances
        grievances = await storage.getGrievancesByUser(user.id);
      }

      // Include submitter name
      const grievancesWithUser = await Promise.all(
        grievances.map(async (grievance) => {
          const submitter = await storage.getUser(grievance.submittedBy);
          return {
            ...grievance,
            submitterName: submitter?.name || 'Unknown'
          };
        })
      );

      res.json(grievancesWithUser);
    } catch (error) {
      console.error('Get grievances error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create grievance (for Ayeshu only)
  app.post('/api/grievances', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role !== 'submitter') {
        return res.status(403).json({ message: 'Only Ayeshu can submit grievances' });
      }

      const validatedData = insertGrievanceSchema.parse({
        ...req.body,
        submittedBy: user.id
      });

      const grievance = await storage.createGrievance(validatedData);
      
      // Send notifications
      await Promise.all([
        sendTelegramNotification(grievance, user),
        sendGmailNotification(grievance, user),
        (async () => {
          // Find viewer's subscription (Abdullah)
          const viewers = await storage.getUsersByRole('viewer');
          for (const viewer of viewers) {
            const subscription = pushSubscriptions.get(viewer.id);
            if (subscription) {
              try {
                await webpush.sendNotification(subscription, JSON.stringify({
                  title: '💕 New message from Ayeshu',
                  body: `${grievance.title} - Mood: ${grievance.mood}`,
                  data: { grievanceId: grievance.id }
                }));
              } catch (error) {
                console.error('Push notification error:', error);
                // Continue even if push fails
              }
            }
          }
        })()
      ]);

      res.status(201).json(grievance);
    } catch (error) {
      console.error('Create grievance error:', error);
      res.status(500).json({ message: 'Failed to create grievance' });
    }
  });

  // Store push subscription
  app.post('/api/push-subscription', requireAuth, async (req, res) => {
    const subscription = req.body as PushSubscription;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    pushSubscriptions.set(userId, subscription);
    res.status(201).json({ message: 'Subscription added' });
  });

  // Update grievance status
  app.patch('/api/grievances/:id/status', requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const grievanceId = parseInt(req.params.id);
      
      const updated = await storage.updateGrievanceStatus(grievanceId, status);
      if (!updated) {
        return res.status(404).json({ message: 'Grievance not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Update grievance status error:', error);
      res.status(500).json({ message: 'Failed to update grievance' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}