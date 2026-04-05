export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

//  Post Types
export type PostVisibility = "public" | "private";

export interface IPost {
  _id: string;
  author: IUser;
  content: string;
  image?: string;
  visibility: PostVisibility;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;

  createdAt: string | Date;
  updatedAt: string | Date;
}

//  Comment Types
export interface IComment {
  _id: string;
  post: string;
  author: IUser;
  content: string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

//  Reply Types
export interface IReply {
  _id: string;
  comment: string;
  author: IUser;
  content: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

//  API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

//  Payload Types
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

export interface CreatePostPayload {
  content: string;
  visibility?: PostVisibility;
  image?: string;
}

export interface UpdatePostPayload {
  content?: string;
  visibility?: PostVisibility;
  image?: string;
}

export type LikeTarget = "Post" | "Comment" | "Reply";

//  JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
