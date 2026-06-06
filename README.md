# BlushBerry Korean Beauty E-Commerce Platform

This project is developed for **COS30043 Interface Design and Development**. BlushBerry is a full-stack e-commerce web application for Korean skincare and makeup products. It includes customer shopping features, a skincare quiz, account management, checkout, order tracking, and administrator dashboards for product and order management.

## How to Deploy and Run the Web App on a Laptop

Follow these steps to run the application locally.

## 1. Install Required Software

Make sure the laptop has the following installed:

- Node.js version 20.19.0 or above
- npm
- A modern web browser such as Chrome, Edge, or Firefox

Check Node.js and npm:

```sh
node -v
npm -v
```

## 2. Open the Project Folder

Open a terminal or command prompt and go to the project folder:

```sh
cd COS30043-Interface-Design-and-Development
```

If the folder is in a different location, use the correct path to the project folder.

## 3. Install Dependencies

Run:

```sh
npm install
```

This installs all required frontend and backend packages.

## 4. Check the Environment File

The project uses a `.env.local` file in the root folder to connect the frontend, backend, and database.

Make sure `.env.local` exists in the submitted project folder. It should contain values similar to:

```env
MONGODB_URI=provided_database_connection_string
JWT_SECRET=provided_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
API_PORT=5000
```

The database connection is already configured by the developer. The lecturer does not need to create or manage a MongoDB Atlas database.

## 5. Start the Application

Run the frontend and backend together:

```sh
npm run dev:full
```

After it starts successfully, open this link in a browser:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:5000
```

## 6. Build for Production

To create a production build:

```sh
npm run build
```

To run the backend server:

```sh
npm run server
```

The production build will be generated in the `dist` folder.

## Available Scripts

Run frontend only:

```sh
npm run dev
```

Run backend only:

```sh
npm run server:dev
```

Run frontend and backend together:

```sh
npm run dev:full
```

Build the project:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

Run linting:

```sh
npm run lint
```
