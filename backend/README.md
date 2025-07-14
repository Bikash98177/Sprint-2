# 🐍 Django Project Setup Guide

This guide helps you set up a virtual environment and run your Django development server.

---

## 📁 Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/your-django-project.git
cd your-django-project (eg app in our case)

🧱 Step 2: Create Virtual Environment

✅ for Windows
-making virual environment 
python -m venv venv
- activating the environment
venv\Scripts\activate

✅ macOS/Linux
-making virual environment 
python3 -m venv venv
- activating the environment
source venv/bin/activate

📦 Step 3: Install Dependencies
pip install -r requirements.txt


🚀 Step 4: Run the Django Development Server
🔹 Apply Migrations
python manage.py migrate
🔹 Run Server
python manage.py runserver
Now open your browser and go to http://localhost:8000


