
# TrustScan: Early Breakout Detection MVP

A secure, blockchain-verified breakout detection system for retail traders.

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- VS Code

### Steps
1. **Download the project files** into a new folder.
2. **Open the folder** in VS Code.
3. **Open the Terminal** in VS Code (`Ctrl + ` ` or `View > Terminal`).
4. **Install Dependencies**:
   ```bash
   npm install
   ```
5. **Start the Dev Server**:
   ```bash
   npm run dev
   ```
6. **Open your browser** to `http://localhost:3000`.

## About the Project
This is a Hackathon MVP. 
- **The "Blockchain"**: Simulated via browser `localStorage` to ensure persistence across refreshes without requiring a real wallet or gas fees for judges.
- **The Logic**: Simple, explainable Price > High and Volume > 1.5x triggers.
- **Security**: Uses simulated cryptographic hashing to prove signal integrity.
