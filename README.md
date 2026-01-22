# SkillMatch

SkillMatch is an intelligent recruitment platform that leverages **Deterministic Finite Automata (DFA)** to automate the candidate screening process. By processing applicants through a rigorous state machine based on job requirements, it ensures 100% precision in initial filtering before applying advanced ranking algorithms.

## Features

- **Automated Screening**: Applicants are validated against job tags using a custom DFA engine.
- **Smart Ranking**: Qualified candidates are scored and ranked using FNV-1a hashing and Merge Sort.
- **Recruitment Lifecycle**: Track candidates through `Match` -> `Interview` -> `Hired` states with a real-time validation console.
- **Secure Authentication**: Role-based access for Employers and Applicants using Supabase Auth.

## Project Structure

- **`backend/`**: Python-based DFA engine and API logic.
- **`frontend/`**: React + Vite application for the user interface.
- **`docs/`**: SQL schemas and documentation.

## Setup & Installation

### Prerequisites

- Python 3.13+
- Node.js 22+
- Supabase Account

### 1. Environment Configuration

Create a `.env` file in the **project root** containing your Supabase credentials. This will be shared through private finals

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

To seed the database with initial jobs and applicants:

```bash
python seed.py
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

## Usage

1.  **Employer Portal**: Log in to post jobs and view the **SkillMatch Dashboard**.
2.  **Job Matching**: The system automatically screens applicants.
3.  **Validation Console**: Use the dashboard to Invite, Hire, or Reject candidates. All actions are logged immutably.
