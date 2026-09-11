# 🎓 StudyMate AI – SDG 4 AI Learning Tutor

[![UN SDG 4: Quality Education](https://img.shields.io/badge/UN%20SDG-4%3A%20Quality%20Education-c5192d.svg)](https://sdgs.un.org/goals/goal4)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask 3.0+](https://img.shields.io/badge/Flask-3.0%2B-black.svg)](https://flask.palletsprojects.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, adaptive educational chatbot built to support **United Nations Sustainable Development Goal 4 (Quality Education)**. StudyMate AI provides personalized, multi-tiered academic explanations, interactive quizzes with instant grading, adaptive difficulty calibration, and educational mode switching for students worldwide.

---

## 🌍 UN Sustainable Development Goal 4 (SDG 4)

> *"Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all."*

Many students around the globe struggle with access to individualized tutoring, clear pedagogical explanations, or timely feedback. **StudyMate AI** addresses this gap by:
- **Democratizing Tutoring:** Delivering 24/7 personalized academic support regardless of geographic or socioeconomic barriers.
- **Level-Adaptive Explanations:** Tailoring concepts dynamically so beginners are not overwhelmed by jargon, while advanced students remain challenged.
- **Zero-Crash Offline Engine:** Functioning reliably even without external cloud API keys or intermittent connectivity.
- **Active Learning:** Emphasizing Socratic questioning, quizzes, and step-by-step guidance over passive memorization.

---

## 🚀 Key Features

1. **Adaptive Learning Levels**:
   - **Beginner:** Simple language, everyday analogies, step-by-step walkthroughs, zero unexplained jargon.
   - **Intermediate:** Balanced technical rigor, formula breakdowns, code samples, and practical use cases.
   - **Advanced:** Rigorous proofs, edge cases, underlying mechanics, and higher-order implications.

2. **5 Educational Modes**:
   - 💡 **Explain:** Comprehensive concept breakdown.
   - 🔍 **Give Example:** Real-world intuitive analogy or practical code/case study.
   - 📝 **Quiz Me:** Interactive diagnostic questions with instant scoring.
   - 📋 **Summarize:** Crisp key takeaway bullet points.
   - 🎯 **Practice Questions:** 3 curated exercises for active recall.

3. **Interactive Quiz Engine**:
   - Generates questions one at a time.
   - Interactive clickable answer buttons (A, B, C, D) directly inside the chat interface.
   - Instant pedagogical feedback explaining *why* an answer is correct or incorrect.
   - Real-time **Mastery Score** and **Streak Tracker**.

4. **Multi-Subject Coverage**:
   - 📐 Mathematics
   - 💻 Computer Science & Programming
   - 🔬 Empirical Science (Physics, Chemistry, Biology)
   - ✍️ English & Language Arts
   - 🌐 General Academic Topics

5. **Safe Educational Behavior & Guardrails**:
   - Aligned strictly to SDG 4 educational outcomes.
   - Hardened against prompt injection, jailbreaks, and credential leaks.
   - Honest and transparent when uncertain; encourages verified sources.

6. **Full Session History & SQLite Persistence**:
   - Chat history saved automatically in SQLite (`database/database.db`).
   - "Clear Chat" resets history safely with one click.
   - "Export Notes" feature downloads study sessions as Markdown.

7. **Modern, Student-Friendly UI**:
   - Bootstrap 5 responsive layout for mobile, tablet, and desktop.
   - Official UN SDG 4 Red (`#C5192D`) branding.
   - Dark Mode / Light Mode toggle with memory.
   - Speech-to-Text Voice Input via Web Speech API.
   - Markdown rendering with code syntax highlighting.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons, Marked.js, Highlight.js
- **Backend:** Python 3, Flask 3.0, Requests, Python-Dotenv
- **Database:** SQLite3 (Serverless, local, zero-config)
- **AI Engine:** Dual-Provider REST architecture supporting:
  - **Google Gemini API** (`gemini-1.5-flash`)
  - **OpenAI API** (`gpt-4o-mini` or OpenAI-compatible endpoints like Groq / OpenRouter)
  - **Built-in Offline Educational Engine** (guarantees 100% functionality out of the box)

---

## 📁 Project Structure

```text
StudyMate/
│
├── app.py                  # Main Flask backend (REST API, DB logic, LLM caller)
├── requirements.txt        # Python dependencies
├── .env.example            # Template for environment variables
├── .env                    # Local environment secrets (ignored in Git)
├── .gitignore              # Protects .env, database, and cache files
├── test_app.py             # Automated unit & integration tests
├── README.md               # Project documentation
│
├── templates/
│   └── index.html          # Single-Page Bootstrap 5 application
│
├── static/
│   ├── style.css           # Custom CSS, SDG 4 theme, dark mode, animations
│   └── script.js           # Client-side state, chat API calls, quiz logic
│
└── database/
    └── database.db         # SQLite database (auto-generated on launch)
```

---

## ⚡ Quick Start & Installation

### Step 1: Clone or Navigate to the Project

Open your terminal or command prompt:

```bash
cd c:\Agent
```

### Step 2: Install Python Dependencies

Make sure Python 3.10+ and pip are installed:

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables (`.env`) or Use In-App Setup

You have two simple ways to connect your Google API key:

#### Option 1: In-App UI Setup (Easiest)
1. Open the web app at `http://127.0.0.1:5000`.
2. Click the **Google API** button in the top navbar.
3. Paste your key and click **Test & Save Key**. The system verifies it live and saves it automatically!

#### Option 2: Edit `.env` Directly
Open [.env](file:///c:/Agent/.env) in any text editor:
```ini
# Flask Port
PORT=5000
SECRET_KEY=your-secret-key-here

# Google API Key (Recommended & Free tier available)
# Get a key at: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=AIzaSyYourActualKeyHere
# GEMINI_API_KEY is also supported as an alias:
GEMINI_API_KEY=AIzaSyYourActualKeyHere

# Selected Model: gemini-1.5-flash, gemini-2.0-flash, or gemini-1.5-pro
GOOGLE_MODEL=gemini-1.5-flash
```

> **Note on Zero-Config Offline Mode:**
> If you do not have an API key right now, **you can leave the keys blank!** StudyMate AI will automatically run in its local high-quality SDG 4 Educational Engine mode so you can test everything immediately.


### Step 4: Run the Application

Start the Flask server:

```bash
python app.py
```

You should see:
```text
=======================================================
🚀 StudyMate AI – SDG 4 Quality Education Tutor
🌍 Running on: http://127.0.0.1:5000
=======================================================
```

### Step 5: Open in Your Browser

Navigate to:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🔑 How to Get and Configure AI API Keys

### Option 1: Google Gemini API (Recommended)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API Key**.
4. Copy the generated key.
5. Paste it into your `.env` file:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

### Option 2: OpenAI API (or Groq / OpenRouter)
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys).
2. Click **Create new secret key**.
3. Copy the key and paste it into your `.env` file:
   ```env
   OPENAI_API_KEY=sk-...
   ```
4. Restart `python app.py` to reload variables.

---

## 🧪 Testing

### Automated Test Suite
Run the comprehensive test suite verifying the REST API, quiz grading, level switching, and guardrails:

```bash
python test_app.py
```

Expected output:
```text
.......
----------------------------------------------------------------------
Ran 7 tests in 0.25s

OK
```

### Testing the REST API via cURL / PowerShell

You can test the `/chat` endpoint directly from your terminal:

```bash
curl -X POST http://127.0.0.1:5000/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Teach me the basics of linear regression as if I am a beginner, then give me three practice questions.\", \"level\": \"beginner\", \"mode\": \"explain\", \"subject\": \"math\"}"
```

#### Example Response:
```json
{
  "is_quiz": false,
  "level": "beginner",
  "mode": "explain",
  "provider": "offline_engine",
  "response": "### 📊 Linear Regression Explained (Beginner Level)\n\nImagine you want to predict how tall a sunflower grows based on how many hours of sunlight it receives...",
  "session_id": "sess_abc123",
  "stats": {
    "current_level": "beginner",
    "score": 0,
    "streak": 0,
    "total_questions": 0
  },
  "subject": "math"
}
```

---

## 🚀 Deployment Instructions

### Deploy to Render / Railway / Heroku
1. Add a `Procfile` in the root directory:
   ```text
   web: gunicorn app:app
   ```
2. Add `gunicorn` to `requirements.txt`:
   ```bash
   pip install gunicorn
   pip freeze > requirements.txt
   ```
3. Connect your repository to Render / Railway.
4. Set Environment Variables in your cloud dashboard (`GEMINI_API_KEY` or `OPENAI_API_KEY`).
5. Deploy!

---

## 📦 GitHub Upload Instructions

To push this project to your GitHub account:

```bash
# 1. Initialize git repository
git init

# 2. Add files (respects .gitignore so .env and DB are never uploaded)
git add .

# 3. Commit files
git commit -m "feat: complete StudyMate AI SDG 4 educational tutor application"

# 4. Rename branch to main
git branch -M main

# 5. Link remote GitHub repository
git remote add origin https://github.com/your-username/StudyMate-AI.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📜 License & Acknowledgments

- Built for the **Next Gen Chatbot Arena Challenge**.
- In alignment with **UN SDG 4: Quality Education**.
- Open source under the [MIT License](LICENSE).
