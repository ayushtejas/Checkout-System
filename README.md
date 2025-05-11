# Checkout System

Hey! This is a checkout system I built for fun. It handles product pricing, discounts, and all that e-commerce stuff. The UI is pretty clean and it works well on both desktop and mobile.

## What it Does

- Shows products in a nice grid layout
- Updates cart prices in real-time
- Handles those "buy 3 get 1 free" type deals
- Works smoothly on phones and computers
- Easy to deploy with Docker

## Tech Stack

Backend:
- Django + REST framework
- SQLite (can switch to Postgres if you want)

Frontend:
- Next.js
- TypeScript
- Tailwind CSS

## Quick Start

### Docker Way (Recommended)

1. Clone this thing:
```bash
git clone https://github.com/ayushtejas/Checkout-System.git
cd checkout-system
```

2. Start it up:
```bash
docker compose up --build
```

3. In another terminal, create a superuser(Optional):
```bash
docker compose exec backend python manage.py createsuperuser
```
Follow the prompts to create your admin account. You'll need:
- Username
- Email (optional)
- Password (make it strong!)

4. Add some sample data:
```bash
docker compose exec backend python manage.py populate_db
```

5. Open these in your browser:
- http://localhost:3000 (frontend)
- http://localhost:8000/admin (admin panel - use your superuser credentials)

### Manual Setup

#### Backend Stuff

1. Go to the backend folder:
```bash
cd checkout_system
```

2. Set up Python stuff:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. Get the requirements:
```bash
pip install -r requirements.txt
```

4. Set up the database:
```bash
python manage.py migrate
```

5. Create a superuser(optional):
```bash
python manage.py createsuperuser
```
Follow the prompts to create your admin account. You'll need:
- Username
- Email (optional)
- Password (make it strong!)

6. Add sample data:
```bash
python manage.py populate_db
```

7. Run it:
```bash
python manage.py runserver
```

#### Frontend Stuff

1. Go to the frontend folder:
```bash
cd frontend
```

2. Install stuff:
```bash
npm install
```

3. Start it:
```bash
npm run dev
```
