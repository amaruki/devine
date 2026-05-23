export type AuthContext = {
  userId: string;
  role: "user" | "superadmin";
};

export type AuthResult =
  | {
      status: "ok";
      context: AuthContext;
    }
  | {
      status: "error";
      message: string;
    };

export type RegisterUserInput = {
  username: string;
  password: string;
  email?: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export async function registerUser(_input: RegisterUserInput): Promise<AuthResult> {
  return { status: "error", message: "Registration is not implemented yet." };
}

export async function loginUser(_input: LoginInput): Promise<AuthResult> {
  return { status: "error", message: "Login is not implemented yet." };
}

export async function logoutUser(_sessionId: string): Promise<void> {}

export async function requireUser(): Promise<AuthContext> {
  return { userId: "scaffold-user", role: "user" };
}

export async function requireSuperadmin(): Promise<AuthContext> {
  return { userId: "scaffold-superadmin", role: "superadmin" };
}
