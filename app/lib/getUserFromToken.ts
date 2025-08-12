import jwt from 'jsonwebtoken';

interface UserTokenData {
  id: number;
  email: string;
  tenantId: number;
  role: string;
  iat?: number;
  exp?: number;
}

export function getUserToken(request: Request): UserTokenData {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('Authorization header no presente');
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    throw new Error('Token no proporcionado');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserTokenData;
    
    if (!decoded.tenantId) {
      throw new Error('Token no contiene tenantId');
    }

    return decoded;
  } catch (error) {
    console.error('Error al verificar token:', error);
    throw new Error('Token inválido');
  }
}