<div align="center">
<img width="1200" height="750" alt="DMC Meeting Planner Banner" src="https://github.com/Shpaq4Fun/meeting-scheduler/blob/main/screenshot.PNG?raw=true" />
</div>

# 🤖 DMC Meeting Planner

An intelligent meeting scheduling application designed specifically for the **Digital Mining Center (DMC)** at Wrocław University of Science and Technology. This tool streamlines the process of finding optimal meeting times by analyzing multiple team members' calendars and finding the best available slots.

<div align="center">

### 🚀 **[Try it Live](https://shpaq4fun.github.io/meeting-scheduler/)** | 📖 **[AI Studio View](https://ai.studio/apps/drive/1-xZuhf942yqPu7A-VBOkITWOlb6Efrt9)**

</div>

## ✨ Key Features

- **🔐 Google Authentication** - Secure sign-in with PWR Google accounts
- **📅 Multi-Calendar Integration** - Fetches and displays events from multiple Google Calendars simultaneously
- **👥 Multi-User Support** - Schedule meetings with multiple DMC team members
- **📊 Visual Calendar** - Interactive weekly calendar view with color-coded users
- **📧 Automated Invitations** - Send calendar invitations directly to selected participants
- **🎨 Modern UI** - Clean, responsive design with dark theme


## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Calendar API**: Google Calendar API (`gapi-script`)
- **Authentication**: Google OAuth 2.0
- **Styling**: Tailwind CSS with custom dark theme
- **Deployment**: GitHub Pages with automated workflows

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **PWR Google Account** for calendar access
- **Gemini API Key** for AI-powered suggestions

### Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/Shpaq4Fun/meeting-scheduler
   cd meeting-scheduler
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local

   # Edit .env.local and add your Gemini API key
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to see the application running locally.

### 🔑 Authentication Setup

1. **Sign in with your PWR Google account** when prompted
2. **Grant calendar permissions** to allow the app to read your calendar data
3. **Verify authentication** - you'll see a green "✅ Authenticated" badge

## 📖 How to Use

### Basic Meeting Scheduling

1. **Select Participants**: Choose team members from the user selection panel
2. **Choose Week**: Navigate to the desired week using calendar controls
3. **Generate Calendar**: Click "Generate Calendar" to fetch all participants' events
4. **Create Meeting**: Select a suggested time slot and create the meeting
5. **Send Invitations**: Send calendar invitations to all selected participants

### Advanced Features

- **Color Coding**: Each user has a unique color for easy event identification
- **Meeting Management**: Delete proposed meetings or cancel existing ones
- **Real-time Updates**: Calendar refreshes automatically when users are added/removed
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🌐 Live Deployment

The application is currently deployed and running at:
**🔗 https://shpaq4fun.github.io/meeting-scheduler/**

This live version includes:
- ✅ Full functionality with Google Calendar integration
- ✅ Real-time calendar synchronization
- ✅ Automated deployment via GitHub Actions

## 🏗️ Project Structure

```
meeting-scheduler/
├── components/           # React components
│   ├── CalendarView.tsx     # Main calendar display
│   ├── UserSelection.tsx    # User picker interface
│   ├── Controls.tsx         # Action buttons
│   ├── CreateMeetingModal.tsx # Meeting creation dialog
│   └── ...                  # Other UI components
├── services/            # API integrations
│   ├── googleCalendarService.ts  # Google Calendar API
│   ├── geminiService.ts         # Gemini AI integration
│   └── googleAuthService.ts     # Authentication
├── types/               # TypeScript definitions
├── constants.ts         # App configuration & user data
├── App.tsx             # Main application component
└── vite.config.ts      # Build configuration
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality

- **TypeScript** for type safety
- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **GitHub Actions** for automated deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is developed for the Department of Machine Construction at Wrocław University of Science and Technology.

## 🆘 Support

For technical issues or questions:
1. Check the browser console for error messages
2. Verify your PWR Google account has calendar permissions
3. Check that all selected users have active calendar integrations

---

<div align="center">
Made with ❤️ for the DMC team at Wrocław University of Science and Technology
</div>
