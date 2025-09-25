# Pizza Shop

A full-stack web application for a pizza ordering system built with React frontend and Node.js/Express backend with MongoDB.

## Features

- **User Authentication**: Secure login and registration system
- **Pizza Management**: Browse, filter, and order pizzas
- **Order Management**: Place orders, view order history, and track orders
- **Admin Panel**: Manage pizzas, users, and view order statistics
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **PDF Generation**: Generate order receipts as PDF

## Tech Stack

### Frontend
- React 19
- Vite (build tool)
- React Router DOM (routing)
- Tailwind CSS (styling)
- Axios (HTTP client)
- js-cookie (cookie management)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- CORS enabled
- Email validation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Seed the database with initial data:
   ```bash
   npm run seedPizzas
   npm run seedUsers
   ```

5. Start the backend server:
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Browse available pizzas on the home page
4. Add pizzas to cart and place orders
5. View your order history in "My Orders"
6. Admin users can access the admin panel to manage pizzas and view statistics

## API Endpoints

### Pizzas
- `GET /v1/pizzas` - Get all pizzas
- `GET /v1/pizzas/filter` - Filter pizzas
- `GET /v1/pizzas/:id` - Get pizza by ID
- `POST /v1/pizzas/add` - Add new pizza (admin)
- `PUT /v1/pizzas/:id` - Update pizza (admin)
- `DELETE /v1/pizzas/:id` - Delete pizza (admin)

### Users
- `GET /v1/users` - Get all users (admin)
- `GET /v1/users/:id` - Get user by ID
- `GET /v1/users/:name` - Get user by name
- `POST /v1/users/add` - Register new user
- `PUT /v1/users/:id` - Update user
- `DELETE /v1/users/:id` - Delete user (admin)

### Orders
- `GET /v1/orders` - Get all orders (admin)
- `GET /v1/orders/:userId` - Get orders by user
- `GET /v1/orders/orderStats` - Get order statistics (admin)
- `GET /v1/orders/userOrderStats/:userId` - Get user order statistics
- `POST /v1/orders/add` - Place new order
- `PUT /v1/orders/:orderId` - Update order
- `DELETE /v1/orders/:orderId` - Cancel order

### Admin
- `GET /v1/admin/stats` - Get admin statistics

## Project Structure

```
pizzashop/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── pizzadb.json
│   │   ├── seedPizzas.js
│   │   ├── seedUser.js
│   │   └── userdb.json
│   ├── controllers/
│   │   ├── orderController.js
│   │   ├── pizzaController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── adminusermodel.js
│   │   ├── ordermodel.js
│   │   ├── pizzamodel.js
│   │   └── usermodel.js
│   ├── routes/
│   │   ├── adminRoute.js
│   │   ├── orderRoute.js
│   │   ├── pizzaRoute.js
│   │   └── userRoute.js
│   ├── app.js
│   └── package.json
├── frontend/
│   ├── components/
│   │   ├── AdminPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MyOrdersPage.jsx
│   │   └── ProtectedRoute.jsx
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx
│   │   ├── main.jsx
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seedPizzas` - Seed database with pizza data
- `npm run seedUsers` - Seed database with user data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

**Akhilesh Ranjan Kumar**
