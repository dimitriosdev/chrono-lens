# 📸 Chrono Lens

A modern, intelligent photo album application built with Next.js, featuring smart layout algorithms and intuitive album management.

## ✨ Features

- 🎨 **Smart Layout System** - AI-powered photo arrangement with multiple layout options
- 📱 **Responsive Design** - Seamless experience across desktop and mobile devices
- 🔥 **Firebase Integration** - Real-time data sync and secure authentication
- 🖼️ **Digital Mat Boards** - Professional photo presentation with customizable frames
- 📊 **Image Analysis** - Automatic composition analysis and optimization
- 🎬 **Slideshow Mode** - Automatic photo transitions with customizable timing
- 🔄 **Advanced Image Processing** - HEIC conversion and automatic optimization
- 💾 **Smart Compression** - Intelligent file size reduction while maintaining quality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for backend services)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dimitriosdev/chrono-lens.git
   cd chrono-lens
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- 📖 **[Documentation Index](docs/README.md)** - Complete documentation overview
- 🛠️ **[Development Guide](docs/development/)** - Setup, architecture, and coding standards
- ✨ **[Features](docs/features/)** - Detailed feature documentation and usage
- 🚀 **[Deployment](docs/deployment/)** - Production deployment and CI/CD
- ⚙️ **[Configuration](docs/configuration/)** - Environment and service setup

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage, Hosting)
- **State Management**: React Hooks + Context
- **Image Processing**: Custom algorithms with composition analysis
- **Build Tool**: Next.js built-in bundler
- **Deployment**: Firebase Hosting

## 📁 Project Structure

```
chrono-lens/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── lib/                # Third-party integrations
├── docs/                   # Project documentation
├── public/                 # Static assets
└── tests/                  # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow our [commit conventions](docs/development/COMMIT_CONVENTION.md)
4. Make your changes and add tests
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript checks
npm test           # Run tests
```

## 🐛 Issues & Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/dimitriosdev/chrono-lens/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/dimitriosdev/chrono-lens/discussions)
- 📖 **Documentation**: [Project Docs](docs/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) - The React framework for production
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Backend powered by [Firebase](https://firebase.google.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Version**: 1.6.0 | **Last Updated**: August 26, 2025
