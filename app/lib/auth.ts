import jwt, { JwtPayload } from 'jsonwebtoken';

// Verificación EN TIEMPO DE EJECUCIÓN de la variable de entorno
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('❌ JWT_SECRET no está definido en las variables de entorno');
  }
  return secret;
};

interface UserToken {
  id: number;
  email: string;
  role: string;
  tenantId: number;
  iat?: number;
  exp?: number;
}

function isUserToken(decoded: any): decoded is UserToken {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    'id' in decoded &&
    'email' in decoded &&
    'role' in decoded &&
    'tenantId' in decoded
  );
}

export function getTokenData(token: string): UserToken {
  if (!token || typeof token !== 'string') {
    throw new Error('Formato de token inválido');
  }

  try {
    const secret = getJwtSecret(); // Esto garantiza que JWT_SECRET no sea undefined
    const decoded = jwt.verify(token, secret);
    
    if (!isUserToken(decoded)) {
      throw new Error('Estructura del token inválida');
    }

    if (!decoded.tenantId) {
      throw new Error('Token no contiene tenantId');
    }

    return decoded;
  } catch (error) {
    console.error('Error en verificación de token:', error);
    throw new Error('Token inválido');
  }
}

export function getUserToken(request: Request): UserToken {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) throw new Error('Authorization header no presente');

  const token = authHeader.split(' ')[1];
  return getTokenData(token);
}