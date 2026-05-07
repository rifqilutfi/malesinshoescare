# malesin_shoescare API (CleanStride DBMS)

Laravel 12 RESTful API for the malesin_shoescare (Cleanstride DBMS) shoe cleaning service.

## Requirements

-   PHP 8.1+
-   Composer
-   MySQL 5.7+ (or SQLite for testing)
-   [Laragon](https://laragon.org/) (recommended for Windows)

## Quick Start

```bash
# Clone and setup
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API available at `http://localhost:8000/api`

## Environment

```env
DB_CONNECTION=mysql
DB_DATABASE=cleanstride
DB_USERNAME=root
DB_PASSWORD=
```

## API Endpoints

### Public (no auth)

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/api/public/services` | List active services |
| POST   | `/api/public/booking`  | Create booking       |

### Authentication

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| POST   | `/api/login`  | User login       |
| POST   | `/api/logout` | User logout      |
| GET    | `/api/user`   | Get current user |

### Orders (auth required)

| Method | Endpoint                  | Description   |
| ------ | ------------------------- | ------------- |
| GET    | `/api/orders`             | List orders   |
| POST   | `/api/orders`             | Create order  |
| GET    | `/api/orders/{id}`        | Get order     |
| PUT    | `/api/orders/{id}`        | Update order  |
| DELETE | `/api/orders/{id}`        | Delete order  |
| PATCH  | `/api/orders/{id}/status` | Update status |

### Services (auth required)

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| GET    | `/api/services`      | List all services |
| POST   | `/api/services`      | Create service    |
| PUT    | `/api/services/{id}` | Update service    |
| DELETE | `/api/services/{id}` | Delete service    |

### Reports (auth required)

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/api/dashboard/stats` | Dashboard statistics |
| GET    | `/api/transactions`    | List transactions    |

## Test Users

| Email                    | Password | Role     |
| ------------------------ | -------- | -------- |
| admin@cleanstride.com    | password | Admin    |
| kurir@cleanstride.com    | password | Kurir    |
| workshop@cleanstride.com | password | Workshop |

## Frontend

Pair with [malesin-shoescare-website](https://github.com/kayeprojects/malesin-shoescare-website)

## License

Private - malesin_shoescare © 2025
