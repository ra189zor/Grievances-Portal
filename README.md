# 💝 Pookie Portal

A lovely web application designed to foster better communication between couples through a beautiful and intuitive interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-pink.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

## 🌸 Description

Pookie Portal is a heartfelt communication platform designed specifically for couples. It provides a safe, beautiful, and organized space for sharing feelings, concerns, and love messages. The application features real-time notifications, mood tracking, and priority-based messaging to ensure that important feelings are never left unaddressed.

### ✨ Key Features

- 💌 Beautiful form for submitting concerns and feelings
- 🎨 Aesthetic UI with responsive design
- 😊 Mood tracking with emoji support
- 🚨 Priority-based messaging system
- 📱 Real-time notifications (Email, Push, and Telegram)
- 🌙 Dark mode support
- 📱 Mobile-first responsive design

## 🖼️ Visuals

[Screenshots to be added]

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pookie-portal.git
cd pookie-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   - Fill in the required values in `.env`:
     - Gmail settings for email notifications
     - Telegram bot credentials for instant messaging
     - VAPID keys for push notifications
     - Session secret for security
     - Additional optional configurations

   See `.env.example` for detailed descriptions of each variable.

4. Generate VAPID keys (if using push notifications):
   ```bash
   npx web-push generate-vapid-keys
   ```

5. Start the development server:
```bash
npm run dev
```

## 💻 Usage

1. **Login**: Access the portal using your credentials
   - Submitter (Ayeshu): Submit concerns and feelings
   - Viewer (Abdullah): View and respond to messages

2. **Submit a Concern**:
   - Click "Submit New Concern"
   - Fill in the title and description
   - Select your current mood
   - Choose the severity level
   - Submit with love! 💝

3. **Notifications**: The viewer will receive:
   - Email notifications
   - Push notifications (if enabled)
   - Telegram messages

## 🤝 Support

For support, please:
- Open an issue on GitHub
- Contact the development team
- Join our community chat

## 🗺️ Roadmap

Future enhancements planned:

- [ ] Voice messages support
- [ ] Photo sharing capabilities
- [ ] Relationship milestone tracking
- [ ] Scheduled date reminders
- [ ] Mood analytics and trends
- [ ] Couple's diary feature

## 👥 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ✨ Authors and Acknowledgment

- **Lead Developer**: Your Name
- Special thanks to all contributors and testers

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

Made with 💝 for spreading love and improving relationships.
