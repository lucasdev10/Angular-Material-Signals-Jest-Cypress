/**
 * Modelo de usuário
 */
export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: IUserRole[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Roles/Permissões do usuário
 */
export enum IUserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Manager = 'MANAGER',
  Guest = 'GUEST',
}

/**
 * DTO para login
 */
export interface ILoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * DTO para registro
 */
export interface IRegisterDto {
  email: string;
  password: string;
  name: string;
}

/**
 * Resposta de autenticação
 */
export interface IAuthResponse {
  user: IUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
