import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * Opciones por defecto para cookies seguras
 */
const defaultSecureOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 1 semana por defecto
};

/**
 * Establece una cookie con opciones de seguridad mejoradas
 * 
 * @param name Nombre de la cookie
 * @param value Valor de la cookie
 * @param options Opciones adicionales para la cookie
 */
export function setSecureCookie(
  name: string,
  value: string,
  options: Partial<ResponseCookie> = {}
): void {
  const cookieStore = cookies();
  const cookieOptions = {
    ...defaultSecureOptions,
    ...options,
  };
  
  cookieStore.set(name, value, cookieOptions);
}

/**
 * Obtiene el valor de una cookie
 * 
 * @param name Nombre de la cookie
 * @returns Valor de la cookie o undefined si no existe
 */
export function getCookie(name: string): string | undefined {
  const cookieStore = cookies();
  const cookie = cookieStore.get(name);
  return cookie?.value;
}

/**
 * Elimina una cookie
 * 
 * @param name Nombre de la cookie a eliminar
 */
export function deleteCookie(name: string): void {
  const cookieStore = cookies();
  cookieStore.delete(name);
}

/**
 * Establece una cookie de sesión (expira cuando se cierra el navegador)
 * 
 * @param name Nombre de la cookie
 * @param value Valor de la cookie
 * @param options Opciones adicionales para la cookie
 */
export function setSessionCookie(
  name: string,
  value: string,
  options: Partial<ResponseCookie> = {}
): void {
  setSecureCookie(name, value, {
    ...options,
    maxAge: undefined, // Cookie de sesión
  });
}