// utils/rateLimiter.ts
import redis from '@/lib/redis';
import { getRateLimitConfig } from '@/utils/actions/admin/actions';

let cachedLimitConfig: { capacity: number; durationSeconds: number; durationHours: number; isEnabled: boolean } | null = null;
let lastCacheSync = 0;
const CACHE_TTL_MS = 20_000; // 20 secondes de mise en cache mémoire pour haute performance

async function getActiveRateLimit() {
  const now = Date.now();
  if (cachedLimitConfig && now - lastCacheSync < CACHE_TTL_MS) {
    return cachedLimitConfig;
  }

  try {
    const config = await getRateLimitConfig();
    cachedLimitConfig = {
      capacity: config.capacity || 80,
      durationHours: config.durationHours || 5,
      durationSeconds: (config.durationHours || 5) * 3600,
      isEnabled: config.isEnabled !== false,
    };
    lastCacheSync = now;
    return cachedLimitConfig;
  } catch {
    return {
      capacity: 80,
      durationHours: 5,
      durationSeconds: 5 * 3600,
      isEnabled: true,
    };
  }
}

/**
 * Vérifie et met à jour le leaky bucket pour un utilisateur donné selon les quotas admin.
 * 
 * @param userId - L'identifiant unique de l'utilisateur.
 * @param explicitCapacity - Capacité optionnelle pour surcharger la config globale.
 * @param explicitDuration - Durée optionnelle (secondes) pour surcharger la config globale.
 * @throws Une erreur explicite si le seuil d'appels IA est dépassé.
 */
export async function checkRateLimit(
  userId: string,
  explicitCapacity?: number,
  explicitDuration?: number
): Promise<void> {
  // Si Upstash Redis n'est pas configuré, autoriser la requête (mode permissif)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return;
  }

  const activeConfig = await getActiveRateLimit();

  // Si le Rate Limiting est désactivé depuis le dashboard admin
  if (!activeConfig.isEnabled) {
    return;
  }

  const capacity = explicitCapacity ?? activeConfig.capacity;
  const duration = explicitDuration ?? activeConfig.durationSeconds;
  const durationHours = activeConfig.durationHours;

  const LEAK_RATE = capacity / duration; // tokens libérés par seconde
  const redisKey = `rate-limit:pro:${userId}`;
  const now = Date.now() / 1000; // heure actuelle en secondes

  // Récupérer le panier existant dans Redis.
  const bucket = await redis.hgetall(redisKey);
  let tokens: number;
  let last: number;

  if (!bucket || !bucket.tokens || !bucket.last) {
    // Premier appel : initialiser le bucket.
    tokens = 0;
    last = now;
    await redis.expire(redisKey, duration + 3600);
  } else {
    tokens = parseFloat(bucket.tokens as string);
    last = parseFloat(bucket.last as string);
  }

  // Calculer le temps écoulé et vider le bucket en conséquence
  const delta = now - last;
  tokens = Math.max(0, tokens - delta * LEAK_RATE);

  // Ajouter un jeton pour la requête courante
  const newTokens = tokens + 1;

  if (newTokens > capacity) {
    const timeLeft = Math.ceil(((newTokens - capacity) * duration) / capacity);
    throw new Error(
      `Limite de requêtes IA atteinte (${capacity} requêtes par tranche de ${durationHours}h). Réessayez dans ${timeLeft} secondes.`
    );
  }

  // Mettre à jour le bucket dans Redis
  await redis.hset(redisKey, { tokens: newTokens.toString(), last: now.toString() });
  await redis.expire(redisKey, duration + 3600);
}
