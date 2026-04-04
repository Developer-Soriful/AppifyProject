// ─── User Types ────────────────────────────────────────────────────
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthUser extends IUser {
  token: string;
}

// ─── Post Types ────────────────────────────────────────────────────
export type PostVisibility = "public" | "private";

export interface IPost {
  _id: string;
  author: IUser;
  content: string;
  image?: string;
  visibility: PostVisibility;
  likes: string[];       // array of User IDs
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Comment Types ─────────────────────────────────────────────────
export interface IComment {
  _id: string;
  post: string;         // Post ID
  author: IUser;
  content: string;
  likes: string[];       // array of User IDs
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Reply Types ───────────────────────────────────────────────────
export interface IReply {
  _id: string;
  comment: string;      // Comment ID
  author: IUser;
  content: string;
  likes: string[];       // array of User IDs
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Types ────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Auth Payload Types ────────────────────────────────────────────
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── JWT Payload ───────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
