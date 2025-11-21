# 👕 DR-YP - Your Style, Your Store

DR-YP is a modern, mobile-first e-commerce application designed for fashion. It provides a seamless shopping experience for users and a powerful management platform for vendors.

## ✨ Features

### For Customers
-   **Authentication:** Secure user registration and login.
-   **Product Discovery:** Browse and search for products with filters for brand, category, and price.
-   **Personalization:** Onboarding process to capture user style preferences (favorite colors, brands, styles).
-   **Wishlist:** Save favorite items for later.
-   **Shopping Cart:** Add products to a cart for purchase.
-   **Profile Management:** View and manage personal information.

### For Vendors
-   **Product Management:** Create, update, and delete products.
-   **Search & Filter:** Easily find and manage products through a searchable interface.
-   **Store Profile:** Manage store details, including name, description, and contact information.

## 🛠️ Tech Stack

| Category      | Technologies                               |
| ------------- | ------------------------------------------ |
| **Frontend**  | React Native, Expo, Zustand, NativeWind    |
| **Backend**   | Node.js, Express.js                        |
| **Database**  | MongoDB (with Mongoose)                    |
| **API Layer** | REST API                                   |
| **Auth**      | JWT (JSON Web Tokens)                      |

## 📂 Project Structure

The project is a monorepo containing two main directories:

-   `./frontend/`: The React Native/Expo mobile application for customers and vendors.
-   `./backend/`: The Node.js/Express.js server that provides the REST API.

## ⚙️ Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm
-   MongoDB instance (local or cloud-based like MongoDB Atlas)
-   Expo Go app on your mobile device for testing.

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the `backend` directory. Copy the contents of `.env.example` if it exists, or create a new one with the following variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```
4.  **Start the server:**
    ```bash
    npm start
    ```
    The server will typically run on `http://localhost:5000`.

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash

    npm install
    ```
3.  **Create a `.env` file** in the `frontend` directory. You will need to specify the base URL of your backend API.
    ```env
    EXPO_PUBLIC_API_BASE_URL=http://<your_local_ip_address>:5000
    ```
    *Note: Replace `<your_local_ip_address>` with your computer's IP address on the local network (e.g., `192.168.1.10`). Do not use `localhost` as the Expo Go app will not be able to connect to it.*

4.  **Start the Metro bundler:**
    ```bash
    npx expo start
    ```
5.  **Run on your device:**
    -   Scan the QR code displayed in the terminal with the Expo Go app on your iOS or Android device.

---
This project is under active development. New features and improvements are being added regularly.