# AppifyProject - Social Media Application

A full-stack social media application built with Next.js, Express, and MongoDB. Features include user authentication, posts, likes, comments, messaging, notifications, and more.

## 📁 Project Structure

```
AppifyProject/
├── apps/
│   ├── client/           # Next.js frontend application
│   └── server/           # Express.js backend API
├── packages/
│   ├── shared/           # Shared TypeScript types/interfaces
│   └── config/           # Shared configuration (ESLint, TSConfig)
├── turbo.json            # Turborepo configuration
└── package.json          # Root workspace configuration
```

## 🚀 Tech Stack

### Frontend (Client)
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Bootstrap 5** - CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Socket.io-client** - Real-time communication

### Backend (Server)
- **Express.js** - Node.js web framework
- **MongoDB + Mongoose** - Database & ODM
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Socket.io** - Real-time messaging
- **CORS** - Cross-origin requests

### Shared
- **Shared Types** - Common interfaces for User, Post, Comment, etc.

## 🎯 Features

### 1. Authentication System
**Files:**
- `@/apps/client/app/login/page.tsx` - Login page
- `@/apps/client/app/register/page.tsx` - Registration page
- `@/apps/client/src/context/AuthContext.tsx` - Auth state management
- `@/apps/server/src/controllers/authController.ts` - Auth backend
- `@/apps/server/src/routes/authRoutes.ts` - Auth routes

**Features:**
- User registration with email
- Login with JWT token
- Password hashing with bcrypt
- Protected routes
- Auto token refresh
- Logout functionality

**API Endpoints:**
```
POST /api/auth/register - Register new user
POST /api/auth/login    - User login
POST /api/auth/logout   - User logout
GET  /api/auth/me       - Get current user
```

### 2. User Management
**Files:**
- `@/apps/client/app/profile/page.tsx` - Own profile
- `@/apps/client/app/profile/[id]/page.tsx` - Other user profiles
- `@/apps/client/app/settings/page.tsx` - User settings
- `@/apps/server/src/controllers/userController.ts` - User backend
- `@/apps/server/src/models/User.ts` - User schema

**Features:**
- View user profiles
- Edit profile information
- Upload profile avatar
- Update bio, education, location
- View user's posts
- View followers/following count

**User Schema Fields:**
```typescript
- firstName, lastName
- email, password (hashed)
- avatar, coverImage
- bio, education, location
- followersCount, followingCount
- savedPosts[] - Bookmarked posts
- hiddenPosts[] - Hidden posts (user-specific)
```

### 3. Posts System
**Files:**
- `@/apps/client/app/feed/page.tsx` - Main feed
- `@/apps/client/src/components/CreatePost.tsx` - Create post form
- `@/apps/client/src/components/PostCard.tsx` - Post display component
- `@/apps/server/src/controllers/postController.ts` - Post backend
- `@/apps/server/src/models/Post.ts` - Post schema

**Features:**
- Create text/image posts
- Edit posts (owner only)
- Delete posts (owner only)
- Like/unlike posts
- Save/bookmark posts
- Share posts
- **Hide/Unhide posts** (Facebook-like feature)
- Infinite scroll pagination

**API Endpoints:**
```
GET    /api/posts          - Get feed posts
GET    /api/posts/:id      - Get single post
POST   /api/posts          - Create post (with image)
PUT    /api/posts/:id      - Update post
DELETE /api/posts/:id      - Delete post
POST   /api/posts/:id/like - Like/unlike post
POST   /api/posts/:id/save - Save/unsave post
POST   /api/posts/:id/share - Share post
POST   /api/posts/:id/hide - Hide/unhide post (user-specific)
GET    /api/posts/saved    - Get saved posts
GET    /api/posts/hidden   - Get hidden posts
```

**Hide/Unhide Feature (Facebook-like):**
- Each user has their own `hiddenPosts` array
- Click **Hide** → Post hidden from your feed only
- Hidden posts show green "Post hidden" UI with Unhide button
- Other users still see the post normally
- Access hidden posts at `/hidden` page

### 4. Comments System
**Files:**
- `@/apps/client/src/components/CommentSection.tsx` - Comments UI
- `@/apps/server/src/controllers/commentController.ts` - Comment backend
- `@/apps/server/src/models/Comment.ts` - Comment schema

**Features:**
- Add comments to posts
- Edit comments (owner only)
- Delete comments (owner only)
- Nested replies
- Like comments

**API Endpoints:**
```
GET    /api/comments/post/:postId - Get post comments
POST   /api/comments/post/:postId - Add comment
PUT    /api/comments/:id          - Edit comment
DELETE /api/comments/:id          - Delete comment
POST   /api/comments/:id/like     - Like/unlike comment
```

### 5. Replies System
**Files:**
- `@/apps/server/src/controllers/replyController.ts` - Reply backend
- `@/apps/server/src/models/Reply.ts` - Reply schema

**Features:**
- Reply to comments
- Edit replies (owner only)
- Delete replies (owner only)

**API Endpoints:**
```
GET    /api/replies/comment/:commentId - Get comment replies
POST   /api/replies/comment/:commentId - Add reply
PUT    /api/replies/:id               - Edit reply
DELETE /api/replies/:id               - Delete reply
```

### 6. Follow System
**Files:**
- `@/apps/client/app/find-friends/page.tsx` - Find friends page
- `@/apps/server/src/controllers/followController.ts` - Follow backend
- `@/apps/server/src/models/Follow.ts` - Follow schema

**Features:**
- Follow/unfollow users
- View followers list
- View following list
- Suggested users to follow
- Follow counts on profiles

**API Endpoints:**
```
POST   /api/follow/:userId - Follow user
DELETE /api/follow/:userId - Unfollow user
GET    /api/follow/followers/:userId - Get followers
GET    /api/follow/following/:userId - Get following
GET    /api/follow/suggestions          - Get suggested users
GET    /api/follow/is-following/:userId - Check if following
```

### 7. Messaging System
**Files:**
- `@/apps/client/app/messages/[id]/page.tsx` - Chat page
- `@/apps/server/src/controllers/messageController.ts` - Message backend
- `@/apps/server/src/models/Message.ts` - Message schema
- `@/apps/server/src/socket/handlers/messageHandler.ts` - Socket handler

**Features:**
- Real-time messaging with Socket.io
- Send text messages
- View conversation history
- Online/offline status
- Message timestamps
- Read receipts

**API Endpoints:**
```
GET  /api/messages/conversations     - Get all conversations
GET  /api/messages/:userId          - Get messages with user
POST /api/messages/:userId          - Send message
```

**Socket Events:**
```
send_message    - Send real-time message
receive_message - Receive real-time message
user_online     - User comes online
user_offline    - User goes offline
```

### 8. Notification System
**Files:**
- `@/apps/server/src/controllers/notificationController.ts` - Notification backend
- `@/apps/server/src/models/Notification.ts` - Notification schema
- `@/apps/server/src/socket/handlers/notificationHandler.ts` - Socket handler

**Features:**
- Real-time notifications via Socket.io
- Notification types:
  - Like on post
  - Comment on post
  - Reply to comment
  - Follow request
  - Share
- Mark notifications as read
- Notification count badge

**API Endpoints:**
```
GET  /api/notifications           - Get user notifications
PUT  /api/notifications/:id/read  - Mark as read
PUT  /api/notifications/read-all  - Mark all as read
GET  /api/notifications/unread-count - Get unread count
```

### 9. Bookmarks (Saved Posts)
**Files:**
- `@/apps/client/app/bookmarks/page.tsx` - Saved posts page
- `@/apps/server/src/controllers/postController.ts` - toggleSavePost function

**Features:**
- Save posts to view later
- Access saved posts at `/bookmarks`
- Unsave posts from bookmarks

**API Endpoints:**
```
POST /api/posts/:id/save - Toggle save/unsave
GET  /api/posts/saved     - Get saved posts
```

### 10. Hidden Posts
**Files:**
- `@/apps/client/app/hidden/page.tsx` - Hidden posts page
- `@/apps/client/src/components/PostCard.tsx` - Hide/Unhide UI
- `@/apps/server/src/controllers/postController.ts` - toggleHidePost function

**Features:**
- Hide posts from feed (personal preference)
- Hidden posts show green banner with Unhide option
- Access all hidden posts at `/hidden`
- Unhide to restore to feed

**API Endpoints:**
```
POST /api/posts/:id/hide - Toggle hide/unhide
GET  /api/posts/hidden   - Get hidden posts
```

### 11. Real-time Features (Socket.io)
**Files:**
- `@/apps/server/src/socket/` - Socket configuration
- `@/apps/server/src/socket/handlers/` - Event handlers

**Implemented Real-time Features:**
1. **Messaging** - Instant message delivery
2. **Notifications** - Live notification updates
3. **Online Status** - Show user online/offline

### 12. Layout Components
**Files:**
- `@/apps/client/app/layout.tsx` - Root layout
- `@/apps/client/src/components/LeftSidebar.tsx` - Left navigation
- `@/apps/client/src/components/RightSidebar.tsx` - Right sidebar
- `@/apps/client/src/components/Navbar.tsx` - Top navigation

**Features:**
- Responsive 3-column layout (Left, Center, Right)
- Navigation sidebar with:
  - Feed
  - Messages
  - Bookmarks
  - Hidden Posts
  - Find Friends
  - Settings
- User profile card in left sidebar
- Suggested friends in right sidebar

### 13. UI/UX Components
**Files:**
- `@/apps/client/src/components/Skeletons.tsx` - Loading skeletons
- `@/apps/client/src/components/ErrorBoundary.tsx` - Error handling

**Features:**
- Loading skeletons for better UX
- Error boundaries for graceful error handling
- Toast notifications for actions
- Responsive design for mobile/tablet/desktop

## 🗄️ Database Schema

### User Model
```typescript
interface IUser {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  education?: string;
  location?: string;
  followersCount: number;
  followingCount: number;
  savedPosts: ObjectId[];  // References to Post
  hiddenPosts: ObjectId[]; // References to Post
  createdAt: Date;
  updatedAt: Date;
}
```

### Post Model
```typescript
interface IPost {
  _id: ObjectId;
  author: ObjectId;     // Reference to User
  content: string;
  image?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment Model
```typescript
interface IComment {
  _id: ObjectId;
  post: ObjectId;       // Reference to Post
  author: ObjectId;     // Reference to User
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Reply Model
```typescript
interface IReply {
  _id: ObjectId;
  comment: ObjectId;    // Reference to Comment
  author: ObjectId;     // Reference to User
  content: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Like Model
```typescript
interface ILike {
  _id: ObjectId;
  user: ObjectId;       // Reference to User
  targetId: ObjectId;   // Reference to Post/Comment
  targetType: "Post" | "Comment";
  createdAt: Date;
}
```

### Follow Model
```typescript
interface IFollow {
  _id: ObjectId;
  follower: ObjectId;   // Reference to User (who follows)
  following: ObjectId; // Reference to User (being followed)
  createdAt: Date;
}
```

### Message Model
```typescript
interface IMessage {
  _id: ObjectId;
  sender: ObjectId;     // Reference to User
  receiver: ObjectId;   // Reference to User
  content: string;
  read: boolean;
  createdAt: Date;
}
```

### Notification Model
```typescript
interface INotification {
  _id: ObjectId;
  recipient: ObjectId;  // Reference to User
  sender: ObjectId;   // Reference to User
  type: "like" | "comment" | "reply" | "follow" | "share";
  message: string;
  targetId?: ObjectId;
  read: boolean;
  createdAt: Date;
}
```

## 🔌 API Routes Summary

### Auth Routes (`/api/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Register new user |
| POST | /login | User login |
| POST | /logout | User logout |
| GET | /me | Get current user |

### User Routes (`/api/users`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get all users |
| GET | /search | Search users |
| GET | /:id | Get user profile |
| PUT | /:id | Update user |
| PUT | /:id/avatar | Update avatar |

### Post Routes (`/api/posts`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get feed posts |
| GET | /saved | Get saved posts |
| GET | /hidden | Get hidden posts |
| POST | / | Create post |
| GET | /:id | Get single post |
| PUT | /:id | Update post |
| DELETE | /:id | Delete post |
| POST | /:id/like | Like/unlike post |
| POST | /:id/save | Save/unsave post |
| POST | /:id/share | Share post |
| POST | /:id/hide | Hide/unhide post |
| PATCH | /:id/visibility | Toggle public/private |

### Comment Routes (`/api/comments`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /post/:postId | Get post comments |
| POST | /post/:postId | Add comment |
| PUT | /:id | Edit comment |
| DELETE | /:id | Delete comment |
| POST | /:id/like | Like/unlike comment |

### Reply Routes (`/api/replies`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /comment/:commentId | Get replies |
| POST | /comment/:commentId | Add reply |
| PUT | /:id | Edit reply |
| DELETE | /:id | Delete reply |

### Follow Routes (`/api/follow`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | /:userId | Follow user |
| DELETE | /:userId | Unfollow user |
| GET | /followers/:userId | Get followers |
| GET | /following/:userId | Get following |
| GET | /suggestions | Get suggested users |
| GET | /is-following/:userId | Check follow status |

### Message Routes (`/api/messages`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /conversations | Get all conversations |
| GET | /:userId | Get messages with user |
| POST | /:userId | Send message |

### Notification Routes (`/api/notifications`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get notifications |
| PUT | /:id/read | Mark as read |
| PUT | /read-all | Mark all as read |
| GET | /unread-count | Get unread count |

### Like Routes (`/api/likes`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /post/:postId | Get post likers |
| GET | /comment/:commentId | Get comment likers |

## 📦 Frontend Pages

| Route | Page | Features |
|-------|------|----------|
| `/` | Home | Redirect to feed or login |
| `/feed` | Feed | Main feed with posts, infinite scroll |
| `/login` | Login | User login form |
| `/register` | Register | User registration form |
| `/profile` | Own Profile | View/edit own profile, posts |
| `/profile/:id` | User Profile | View other user's profile |
| `/bookmarks` | Saved Posts | View saved posts |
| `/hidden` | Hidden Posts | View/manage hidden posts |
| `/messages` | Messages | List of conversations |
| `/messages/:id` | Chat | Individual chat window |
| `/find-friends` | Find Friends | Discover and follow users |
| `/settings` | Settings | Edit profile, change password |

## 🔒 Middleware

### Authentication Middleware
**File:** `@/apps/server/src/middleware/auth.ts`
- Verifies JWT token
- Attaches user to request
- Returns 401 if unauthorized

### Upload Middleware
**File:** `@/apps/server/src/middleware/upload.ts`
- Handles file uploads with Multer
- Stores images in `uploads/` directory
- Generates unique filenames

## 🎨 Frontend Architecture

### Context Providers
**File:** `@/apps/client/src/context/Providers.tsx`
- `AuthContext` - Authentication state
- Toast notifications

### API Client
**File:** `@/apps/client/src/lib/api.ts`
- Axios instance with base URL
- Automatic token attachment
- Error handling

### Socket Client
**File:** `@/apps/client/src/lib/socket.ts`
- Socket.io client configuration
- Real-time event handling

## 🛠️ Shared Package

### Types (`@/packages/shared/src/index.ts`)
Shared TypeScript interfaces:
- `IUser` - User type
- `IPost` - Post type (with isLiked, isSaved, isHidden)
- `IComment` - Comment type
- `IReply` - Reply type
- `ILike` - Like type
- `IFollow` - Follow type
- `IMessage` - Message type
- `INotification` - Notification type
- `PaginatedResponse<T>` - Pagination wrapper

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment variables:**
Create `.env` in `apps/server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appify
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

3. **Run development server:**
```bash
npm run dev
```

### Available Scripts
```bash
npm run dev       # Start both client and server
npm run build     # Build all apps
npm run lint      # Run ESLint
```

## 📸 Screenshots

(Note: Add screenshots of key features)

## 🤝 Contributing

(Note: Add contribution guidelines)

## 📄 License

(Note: Add license information)
