// app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-temporal';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: 'pending' // 👈 usuario queda en estado pendiente
        // tenant se crea después del pago
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        status: true // 👈 opcional para mostrar en frontend
      }
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
        // tenantId se asignará tras activación
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return NextResponse.json(
      { 
        success: true, 
        user: newUser,
        token 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
