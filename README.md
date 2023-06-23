# Craftify API

Craftify RESTful API which built with NestJS.

## Clone the repository

```bash
$ git clone https://github.com/shehanswivel/crafts-online-store-api
```

## Installation

```bash
$ npm install
```

## Environment variables

Make sure to create .env file in the project root with the variables that included in .env.example file.

```bash
# App running port
PORT=<PORT>

# Database configurations
DB_URI=<MONGO DB CONNECTION STRING>

# JWT configurations
JWT_ACCESS_TOKEN_SECRET=<YOUR SECRET>
JWT_ACCESS_TOKEN_EXPIRED_IN=<TOKEN VALID PERIOD>
JWT_REFRESH_TOKEN_SECRET=<YOUR SECRET>
JWT_REFRESH_TOKEN_EXPIRED_IN=<TOKEN VALID PERIOD>

# Default admin credentials (this default admin account will be created automatically when application starts)
ADMIN_USERNAME=<USERNAME FOR DEFAULT ADMIN ACCOUNT>
ADMIN_PASSWORD=<PASSWORD FOR DEFAULT ADMIN ACCOUNT>

# AWS S3 configurations
CRAFTIFY_AWS_S3_BUCKET=<AWS S3 BUCKET NAME>
CRAFTIFY_AWS_ACCESS_KEY_ID=<AWS ACCESS KEY ID>
CRAFTIFY_AWS_SECRET_ACCESS_KEY=<AWS SECRET ACCESS KEY>
```

## Running the app

```bash
# development
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm test
```

## Project structure

```bash
src/                          # Source folder
  api/                        # Contains all the API modules
    admin/                    # Admin module
    auth/                     # Auth module
      dto/                    # Auth DTO classes
      guards/                 # Auth Guards
      strategies/             # Passport strategies
    orders/                   # Orders module
      dto/                    # Order DTO classes
      schemas/                # Order schemas
    products/                 # Product module
      dto/                    # Product DTO classes
      schemas/                # Product schemas
    stats/                    # Stats module
      interfaces/             # Stats interfaces
    users/                    # User module
      dto/                    # User DTO classes
  common/
    /dto                      # Common DTO classes
    /interfaces               # Common interfaces
    /responses                # Response classes
  constants/                  # Contains all the constants
  middlewares/                # Contains all the custom middlewares
  shared/                     # Shared module
  utils/                      # Contains all the utils
  |-- app.controller.spec.ts
  |-- app.controller.ts
  |-- app.module.ts
  |-- app.service.ts
  |-- main.ts
test/
.env.example
.eslintrc.js
.gitignore
.prettierrc
nest-cli.json
package-lock.json
package.json
README.md
tsconfig.build.json
tsconfig.json
```

## API Endpoints

### Swagger documentation

`GET - /docs` - Swagger documentation

### Auth routes

`POST - api/v1/auth/login` - Login a user

`GET - api/v1/auth/me` - Get current authenticated user

`POST - api/v1/auth/change-password` - Change password

`GET - api/v1/auth/refresh` - Refresh 'Access token' and 'Refresh token'

### Order routes

`POST - api/v1/orders` - Create a new order

`GET - api/v1/orders` - Get all orders

`PATCH - api/v1/orders/:id` - Update order status

`DELETE - api/v1/orders/:id` - Delete order

`GET - api/v1/orders/:id` - Get specific order

### Product routes

`POST - api/v1/products` - Create a new product

`GET - api/v1/products` - Get all products

`PUT - api/v1/products/:id` - Update product

`DELETE - api/v1/products/:id` - Delete product

`GET - api/v1/products/:id` - Get specific product

### Stats routes

`GET - api/v1/stats` - Get analytics

## License

[MIT](LICENSE)
