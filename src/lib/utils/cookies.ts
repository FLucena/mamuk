import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * Opciones por defecto para cookies seguras
 */
const defaultSecureOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: false,
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
export async function setSecureCookie(
  name: string,
  value: string,
  options: Partial<ResponseCookie> = {}
): Promise<void> {
  const cookieStore = await cookies();
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
export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  return cookie?.value;
}

/**
 * Elimina una cookie
 * 
 * @param name Nombre de la cookie a eliminar
 */
export async function deleteCookie(name: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

/**
 * Establece una cookie de sesión (expira cuando se cierra el navegador)
 * 
 * @param name Nombre de la cookie
 * @param value Valor de la cookie
 * @param options Opciones adicionales para la cookie
 */
export async function setSessionCookie(
  name: string,
  value: string,
  options: Partial<ResponseCookie> = {}
): Promise<void> {
  await setSecureCookie(name, value, {
    ...options,
    maxAge: undefined, // Cookie de sesión
  });
}