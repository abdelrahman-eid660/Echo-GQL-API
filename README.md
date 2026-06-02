# Echo-GQL-API
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/abdelrahman-eid660/Echo-GQL-API.git)

Echo-GQL-API is a robust and scalable backend server for a feature-rich social media application. Built with a modern technology stack, it provides a comprehensive GraphQL API for handling users, posts, stories, real-time chat, notifications, and more.

## ✨ Key Features

*   **GraphQL API**: A single, powerful endpoint for all data operations, providing flexible and efficient data fetching.
*   **Real-time Communication**: WebSocket-based real-time features for chat (one-on-one & group) and live updates using Socket.IO.
*   **Authentication & Authorization**: Secure authentication system with JWT, supporting standard email/password and Google OAuth. Role-based access control (User, Admin, Supervisor).
*   **Social Features**:
    *   User profiles with friends, friend requests, and profile/cover image uploads.
    *   Create, read, update, and delete posts, stories, and comments.
    *   React to various content types (posts, comments, stories, messages).
    *   Tagging and mentioning users in posts and stories.
*   **Media Handling**: Integration with AWS S3 for scalable file storage, including management of pre-signed URLs for secure client-side uploads and downloads.
*   **Push Notifications**: Firebase Admin SDK integration for sending push notifications to clients.
*   **Background Jobs**: Utilizes cron jobs for periodic tasks like expiring old stories and cleaning up associated data.
*   **Security**: Implements rate limiting, security headers with Helmet, and robust validation using Zod.
*   **Data Persistence**: Uses MongoDB with Mongoose for database management and Redis for caching, session management, and real-time data.

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **Language**: TypeScript
*   **Database**: MongoDB, Mongoose
*   **API**: GraphQL
*   **Real-time**: Socket.IO
*   **Caching/Jobs**: Redis, BullMQ
*   **File Storage**: AWS S3
*   **Notifications**: Firebase Admin SDK
*   **Authentication**: JWT, Google Auth Library
*   **Validation**: Zod
*   **Security**: Helmet, express-rate-limit

## 📂 Project Structure

The project is organized into a modular architecture to ensure separation of concerns and maintainability.

```
src/
|
├── DB/
|   ├── models/       # Mongoose data models
|   └── Repository/   # Data access layer (repositories)
|
├── common/           # Shared utilities, enums, interfaces, and services
|   ├── enum/
|   ├── exception/
|   ├── interface/
|   ├── service/      # Core services (Redis, S3, Token, etc.)
|   └── utils/
|
├── config/           # Environment variable configuration
|
├── middleware/       # Express and GraphQL middlewares (auth, error handling)
|
└── modules/          # Feature-based modules
    ├── auth/         # Authentication logic and GraphQL schema
    ├── chat/         # Chat features, real-time events, and GraphQL schema
    ├── comment/      # Comment features and GraphQL schema
    ├── post/         # Post features and GraphQL schema
    ├── story/        # Story features and GraphQL schema
    └── user/         # User management, friends, and profile features

```

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn
*   A running MongoDB instance
*   A running Redis instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/abdelrahman-eid660/Echo-GQL-API.git
    cd Echo-GQL-API/Code
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env.development` file in the `Code` directory.
2.  Populate it with the necessary environment variables. You will need to provide credentials for your database, Redis, AWS, and Firebase services.

    ```env
    # Application
    PORT=7000
    APPLICATION_NAME=Echo

    # Database & Redis
    DB_URI=mongodb://localhost:27017/echo-db
    REDIS_URI=redis://localhost:6379

    # JWT Secrets & Expiration
    USER_TOKEN_SECRET_KEY=your_user_secret
    USER_REFREASH_TOKEN_SECRET_KEY=your_user_refresh_secret
    ADMIN_TOKEN_SECRET_KEY=your_admin_secret
    ADMIN_REFREASH_TOKEN_SECRET_KEY=your_admin_refresh_secret
    SUPERVISER_TOKEN_SECRET_KEY=your_supervisor_secret
    SUPERVISER_REFREASH_TOKEN_SECRET_KEY=your_supervisor_refresh_secret
    ACCESS_EXPIRES_IN=900
    REFREASH_EXPIRES_IN=604800

    # Security & Encryption
    SALT_ROUND=12
    ENCRYPTION_SECRET_KEY=a_32_byte_secret_key_for_encrypt
    IV_LENGTH=16

    # Email Service (for OTP)
    EMAIL_APP=your_gmail_address@gmail.com
    PASSWORD_APP=your_gmail_app_password

    # Google OAuth
    WEB_CLIENT_ID=your_google_web_client_id

    # AWS S3
    AWS_REGION=your_aws_region
    AWS_BUCKET_NAME=your_s3_bucket_name
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    AWS_EXPIRES_IN=3600
    ```
3. Add your Firebase service account key file (`.json`) to the `src/config/` directory and ensure the path in `src/common/service/notification.service.ts` is correct.

### Running the Application

*   **Development Mode:**
    This command will start the server with hot-reloading for both TypeScript compilation and the running Node.js process.
    ```bash
    npm run start:dev
    ```

*   **Production Mode:**
    This command will start the application using `pm2`.
    ```bash
    # First, compile the TypeScript code
    npm run build

    # Then, start with pm2
    npm run start:prod
    ```

## 🔌 API Endpoints

*   **GraphQL Playground**: `http://localhost:7000/api/graphql`
    *   Access the GraphQL API for all data-related queries and mutations. An Apollo Sandbox is available for testing.
*   **REST Endpoints for Media**:
    *   `POST /api/Echo/create-presigned-link`: Generate a pre-signed URL for client-side uploads to S3.
    *   `GET /api/uploads/*`: Serves uploaded assets from S3.
    *   `GET /api/pre-signed/*`: Generates a pre-signed URL for fetching private assets.

## 📡 Real-time Events (Socket.IO)

The real-time gateway handles live interactions, primarily for the chat module.

*   `joinRoom`: Client joins a specific chat room.
*   `sendMessage`: Client sends a message to a room.
*   `typing_status`: Broadcasts when a user is typing.
*   `addParticipants`: Add new members to a group chat.
*   `removeParticipants`: Remove a member from a group chat.
*   `promoteToAdmin`: Promote a group member to an admin.
*   `leaveGroup`: Current user leaves a group chat.