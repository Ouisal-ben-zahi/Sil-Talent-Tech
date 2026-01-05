/**
 * Utilitaires de validation et sanitization sécurisés
 * Protection contre XSS, injection SQL, et autres attaques
 */
export class ValidationUtil {
  /**
   * Valide un email avec regex RFC 5322 simplifié
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    // Limiter la longueur pour éviter les attaques DoS
    if (email.length > 254) {
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un numéro de téléphone (format international ou français)
   */
  static isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    // Nettoyer le numéro
    const cleaned = phone.replace(/[\s.-]/g, '');
    
    // Format international ou français
    const phoneRegex = /^(\+33|0)[1-9]\d{8}$/;
    return phoneRegex.test(cleaned) && cleaned.length <= 15; // Limite ITU-T E.164
  }

  /**
   * Sanitize une chaîne de caractères contre XSS
   * Retire tous les tags HTML et encode les caractères spéciaux
   */
  static sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Limiter la longueur pour éviter les attaques DoS
    const maxLength = 10000;
    const truncated = input.length > maxLength ? input.substring(0, maxLength) : input;

    // Retirer tous les tags HTML
    let sanitized = truncated.replace(/<[^>]*>/g, '');
    
    // Encoder les caractères HTML spéciaux
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    // Retirer les caractères de contrôle et les caractères Unicode dangereux
    sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    return sanitized.trim();
  }

  /**
   * Sanitize une chaîne pour l'utilisation dans des requêtes SQL (prévention injection)
   * Note: Supabase utilise des requêtes paramétrées, mais cette fonction ajoute une couche supplémentaire
   */
  static sanitizeForSQL(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Retirer les caractères dangereux pour SQL
    return input
      .replace(/['";\\]/g, '') // Retirer quotes simples, doubles, point-virgule, backslash
      .replace(/--/g, '') // Retirer les commentaires SQL
      .replace(/\/\*/g, '') // Retirer les commentaires SQL multilignes
      .replace(/\*\//g, '')
      .trim();
  }

  /**
   * Valide une URL et vérifie qu'elle utilise un protocole sécurisé
   */
  static isValidUrl(url: string, allowedProtocols: string[] = ['http:', 'https:']): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      
      // Vérifier le protocole
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return false;
      }

      // Vérifier que l'hostname n'est pas une IP privée (protection contre SSRF)
      const hostname = urlObj.hostname;
      if (this.isPrivateIP(hostname)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Vérifie si une adresse IP est privée (protection SSRF)
   */
  private static isPrivateIP(hostname: string): boolean {
    // Vérifier si c'est une IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(hostname)) {
      return false; // Ce n'est pas une IP
    }

    const parts = hostname.split('.').map(Number);
    
    // IPs privées: 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      parts[0] === 0
    );
  }

  /**
   * Valide et sanitize un UUID
   */
  static isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Valide une longueur de chaîne
   */
  static isValidLength(input: string, min: number, max: number): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }
    return input.length >= min && input.length <= max;
  }
}



