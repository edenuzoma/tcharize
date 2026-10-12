import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;
    const cookieHeader = request.headers.cookie as string | undefined;
    const cookieToken = cookieHeader
      ?.split(";")
      .map((part) => part.trim().split("="))
      .find(([name]) => name === "tcharize_session")?.[1];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : cookieToken ? decodeURIComponent(cookieToken) : undefined;
    if (!token) throw new UnauthorizedException("Sign in to continue.");
    const user = await this.authService.validateToken(token);
    request.user = user;

    return true;
  }
}
