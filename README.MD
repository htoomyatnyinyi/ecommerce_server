# E-commerce Backend (TypeScript)

ecommerce-backend/
├── prisma/
│ └── schema.prisma
├── src/
│ ├── controllers/
│ │ ├── userController.ts
│ │ └── productController.ts
│ ├── routes/
│ │ ├── userRoutes.ts
│ │ └── productRoutes.ts
│ ├── config/
│ │ └── database.ts
│ ├── types/
│ │ └── index.ts
│ └── server.ts
├── .env
├── tsconfig.json
├── package.json
└── README.md

## Setup Instructions

1. Install MySQL and create a database named `ecommerce_db`
2. Update `.env` with your MySQL credentials
3. Run `npm install` to install dependencies
4. Run `npx prisma migrate dev` to create database tables
5. Run `npm run build` to compile TypeScript
6. Run `npm start` or `npm run dev` to start the server

## API Endpoints

- Users:
  - POST /api/users - Create a new user
  - GET /api/users - Get all users
- Products:
  - POST /api/products - Create a new product
  - GET /api/products - Get all products
  - GET /api/products/:id - Get product by ID
