# CodeSpring Notes 📝

A modern, efficient note-taking platform built with Next.js 14 and Supabase, designed for students and professionals who need an organized and visually appealing way to manage their notes.

## 🌟 Features

- **📊 Category-Based Organization**: Group notes by customizable categories with pastel color coding
- **📝 Rich Text Editor**: Full-featured editor with formatting options (bold, italic, lists, etc.)
- **🔄 Real-Time Autosave**: Automatic saving after 2 seconds of inactivity
- **🎨 Visual Organization**: Trello-style column view with pastel backgrounds
- **🔍 Smart Filtering**: Sort by date or title, filter by categories
- **📱 Responsive Design**: Seamless experience across all devices
- **🔐 Secure Authentication**: Powered by Clerk for robust user management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **UI Components**: ShadCN UI + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle
- **Authentication**: Clerk
- **Deployment**: Vercel
- **Rich Text**: TipTap/Slate Editor

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Clerk account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VolkisAI/codespring-notes.git
   cd codespring-notes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase and Clerk credentials in `.env.local`

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the app running!

## 📁 Project Structure

```
/app
  /notes                   # Note routes
    page.tsx              # Note Navigation
    [note-id]/
      page.tsx            # Note Details
/db
  /schema                 # Database schemas
  /queries               # Database queries
/actions                 # Server actions
/components             # UI components
  /note-navigation
  /note-details
  /rich-text-editor
  /delete-notes
  /category-management
```

## 🔒 Security Features

- HTML sanitization for XSS prevention
- Row-level security with Supabase policies
- Rate limiting (10 writes/min per user)
- Secure authentication with Clerk

## 🎯 Usage Limits

- Maximum 20 categories per user
- Note content limited to 50,000 characters
- Rate limited to 10 writes/minute

## 🔜 Roadmap

- [ ] Note sharing and collaboration
- [ ] Tags support
- [ ] Full-text search
- [ ] Mobile offline support
- [ ] Version history
- [ ] Real-time collaboration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ShadCN UI for the beautiful components
- Vercel for hosting
- Supabase for the database
- Clerk for authentication

---

Built with ❤️ by VolkisAI
