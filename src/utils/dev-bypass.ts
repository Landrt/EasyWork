'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/utils/actions/admin/actions';
import { DEV_BYPASS_COOKIE_NAME } from '@/utils/dev-bypass-constants';

/**
 * Détermine si le mode bypass développeur est actuellement actif.
 * Priorités :
 * 1. Cookie 'easywork_dev_bypass' (explicitement 'true' ou 'false')
 * 2. Variable d'environnement DEV_BYPASS_ALL === 'true'
 * 3. Si l'utilisateur connecté est Administrateur (email admin ou is_admin = true)
 * 4. Mode développement local (NODE_ENV !== 'production') par défaut 'true' sauf si cookie à 'false'
 */
export async function isDevBypassActive(): Promise<boolean> {
  // 1. Variable d'environnement globale (prioritaire si forcée)
  if (process.env.DEV_BYPASS_ALL === 'true') {
    return true;
  }

  try {
    const cookieStore = await cookies();
    const bypassCookie = cookieStore.get(DEV_BYPASS_COOKIE_NAME)?.value;

    if (bypassCookie === 'true') {
      return true;
    }
    if (bypassCookie === 'false') {
      return false;
    }
  } catch {
    // Si hors contexte de requête (ex: build statique ou script de fond)
  }

  // 2. Vérification du rôle Administrateur
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.isAdmin) {
      return true;
    }
  } catch {
    // Fallback silencieux
  }

  // 3. Environnement de développement local (actif par défaut)
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
}

/**
 * Définit explicitement l'état du mode bypass via cookie de session
 */
export async function setDevBypassMode(enabled: boolean): Promise<{ success: boolean; isDevBypass: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(DEV_BYPASS_COOKIE_NAME, enabled ? 'true' : 'false', {
      path: '/',
      httpOnly: false, // Permet la lecture client si besoin
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 an
    });
  } catch (error) {
    console.warn('[DEV-BYPASS] Impossible d\'écrire le cookie:', error);
  }

  // Révalider les principales pages pour appliquer instantanément les nouveaux quotas
  revalidatePath('/');
  revalidatePath('/subscription');
  revalidatePath('/settings');
  revalidatePath('/resumes');
  revalidatePath('/jobs');
  revalidatePath('/admin');

  return { success: true, isDevBypass: enabled };
}

/**
 * Alterne l'état du mode bypass (ON <-> OFF)
 */
export async function toggleDevBypassMode(): Promise<{ success: boolean; isDevBypass: boolean }> {
  const current = await isDevBypassActive();
  return setDevBypassMode(!current);
}
