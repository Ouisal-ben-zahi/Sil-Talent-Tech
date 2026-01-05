import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Accès non autorisé');
    }

    // Vérifier si l'utilisateur est un admin
    // TODO: Adapter selon votre logique d'authentification admin
    if (user.role && (user.role === 'super_admin' || user.role === 'consultant')) {
      return true;
    }

    throw new ForbiddenException('Accès réservé aux administrateurs');
  }
}



