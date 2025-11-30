Aether OS

Aether OS is a concept operating system shell built with React, Vite, and Electron. It provides an immersive, console-inspired interface (XMB) alongside a traditional desktop environment, focusing on aesthetics, local AI integration, and user customization.

✨ Features

Dual Mode Interface:

XMB Mode: A gamepad-friendly, horizontal media bar interface for launching apps and games.

Desktop Mode: A productive desktop environment with a Mac-style dock and window management.

System Applications:

Nucleus Files: A functional file explorer with context menus and file manipulation.

Aether AI: Local LLM integration via Ollama for private, offline AI assistance.

User Management: Multi-user support with admin privileges, custom themes, and profile pictures.

Security: Custom pattern-based lock screens for user profiles.

Web Browser: Integrated secure web browser.

Productivity: Includes Text Editor, Calculator, Paint, and System Monitor.

Immersive Visuals:

Dynamic wave backgrounds that react to system state.

Fully responsive animations powered by Framer Motion.

🚀 Getting Started

Prerequisites

Node.js (v16 or higher)

Ollama (Optional, for AI features): Download Ollama and ensure it is running on localhost:11434.

Installation

Clone the repository:

git clone [https://github.com/DeltaEpiales/aether-os.git](https://github.com/DeltaEpiales/aether-os.git)
cd aether-os


Install dependencies:

npm install


Run in Development Mode:
This command starts the React dev server and launches the Electron window.

npm run dev:app


🛠️ Building Executables

To package Aether OS into an executable file (e.g., .exe, .dmg, .AppImage) for distribution:

# Build for your current operating system
npm run dist

# Build specifically for Windows
npm run dist:win

# Build specifically for Mac (requires macOS)
npm run dist:mac

# Build specifically for Linux
npm run dist:linux


The output files will be located in the release/ directory.

🎮 Controls

Key / Action

Function

F1 | Toggle between XMB and Desktop Mode

H  | Toggle Dock / Taskbar visibility

Arrow Keys | Navigate XMB Interface

Enter  | Launch App / Select Item

Backspace  | Go Back / Close App

Right Click  | Open Context Menu

📄 License

MIT License

Copyright (c) 2024 Aether Dev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.