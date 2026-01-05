import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  // Override pour ajouter le paramètre prompt à l'URL d'autorisation
  // Cela force Google à toujours afficher la liste des comptes disponibles
  getAuthenticateOptions(context: ExecutionContext): any {
    return {
      // Le paramètre prompt=select_account force Google à afficher
      // la sélection de compte même si un compte est déjà connecté
      prompt: 'select_account',
    };
  }
}

