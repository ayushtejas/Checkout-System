# Checkout System

A simple yet powerful checkout system that helps you manage products and apply discounts. 

## Tech Stack

We're using:
- **Backend**: Django with Django REST Framework
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: SQLite (easy to set up and use)

## Quick Start with Docker

1. Clone this repo:
```bash
git clone <repository-url>
cd checkout-system
```

2. Start the application:
```bash
docker-compose up --build
```

3. In a new terminal, initialize the database and create a superuser:
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py populate_db
docker-compose exec backend python manage.py createsuperuser
```

4. Open your browser:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## Database Setup

The `populate_db` command creates these sample products:
- Product A: $50.00 (3 for $130.00)
- Product B: $30.00 (2 for $45.00)
- Product C: $20.00
- Product D: $15.00

## How It Works

### Products
- Browse through available products
- See prices and special offers
- Add items to your cart with a single click

### Cart Features
- Add or remove products easily
- Adjust quantities with + and - buttons
- Type product codes (like "AABBC") to add multiple items
- See your total update in real-time
- Clear your cart with one click

### Discounts
- Special offers for buying in bulk
- Automatic discount calculation
- Clear display of how much you're saving


