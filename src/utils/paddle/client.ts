import crypto from 'crypto';

export type PaddleEnvironment = 'sandbox' | 'production';

export interface PaddleCustomer {
  email: string;
  name?: string;
}

export interface PaddleCreateTransactionOptions {
  priceId: string;
  customer: PaddleCustomer;
  customData?: Record<string, any>;
  returnUrl?: string;
  currency?: string;
}

export interface PaddleTransactionResponse {
  id: string;
  status: string;
  checkoutUrl?: string | null;
  details?: {
    totals?: {
      total: string;
      currencyCode: string;
    };
  };
}

export interface PaddleSubscriptionResponse {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  customerId: string;
  currentBillingPeriod?: {
    startsAt: string;
    endsAt: string;
  } | null;
  nextBilledAt?: string | null;
  items?: Array<{
    price: {
      id: string;
      productId: string;
    };
  }>;
}

export class PaddleClient {
  private apiKey: string;
  private environment: PaddleEnvironment;
  private baseUrl: string;

  constructor(apiKey?: string, environment?: PaddleEnvironment) {
    this.apiKey = apiKey || process.env.PADDLE_API_KEY || '';
    this.environment = 
      environment || 
      (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox');
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.paddle.com' 
      : 'https://sandbox-api.paddle.com';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && !this.apiKey.includes('mock') && !this.apiKey.includes('your_'));
  }

  get clientToken(): string {
    return process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';
  }

  get env(): PaddleEnvironment {
    return this.environment;
  }

  /**
   * Crée une transaction de paiement / abonnement Paddle
   */
  async createTransaction(options: PaddleCreateTransactionOptions): Promise<PaddleTransactionResponse> {
    if (!this.isConfigured) {
      console.info('ℹ️ Paddle: Mode local démo actif (PADDLE_API_KEY non configuré).');
      const mockId = `txn_mock_${Date.now()}`;
      const returnUrl = options.returnUrl || 'http://localhost:3000/subscription/checkout-return';
      const checkoutUrl = `${returnUrl}?_ptxn=${mockId}&plan=${options.customData?.plan || 'sprint'}`;
      return {
        id: mockId,
        status: 'ready',
        checkoutUrl,
        details: {
          totals: {
            total: '22.00',
            currencyCode: options.currency || 'EUR',
          },
        },
      };
    }

    const payload: Record<string, any> = {
      items: [
        {
          price_id: options.priceId,
          quantity: 1,
        },
      ],
      customer: {
        email: options.customer.email,
        name: options.customer.name,
      },
      custom_data: options.customData || {},
    };

    if (options.returnUrl) {
      payload.checkout = {
        return_url: options.returnUrl,
      };
    }

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Paddle API Error:', errorData);
      throw new Error(errorData.error?.detail || `Erreur Paddle API: ${response.statusText}`);
    }

    const json = await response.json();
    const data = json.data;

    return {
      id: data.id,
      status: data.status,
      checkoutUrl: data.checkout?.url || null,
      details: {
        totals: {
          total: data.details?.totals?.total || '0',
          currencyCode: data.details?.totals?.currency_code || 'EUR',
        },
      },
    };
  }

  /**
   * Récupère les détails d'un abonnement
   */
  async getSubscription(subscriptionId: string): Promise<PaddleSubscriptionResponse | null> {
    if (!this.isConfigured || subscriptionId.startsWith('sub_mock')) {
      return {
        id: subscriptionId,
        status: 'active',
        customerId: 'ctm_mock',
        currentBillingPeriod: {
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        },
      };
    }

    const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const sub = json.data;

    return {
      id: sub.id,
      status: sub.status,
      customerId: sub.customer_id,
      currentBillingPeriod: sub.current_billing_period ? {
        startsAt: sub.current_billing_period.starts_at,
        endsAt: sub.current_billing_period.ends_at,
      } : null,
      nextBilledAt: sub.next_billed_at,
    };
  }

  /**
   * Annule un abonnement récurrent
   */
  async cancelSubscription(subscriptionId: string, effectiveFrom: 'next_billing_period' | 'immediately' = 'next_billing_period'): Promise<boolean> {
    if (!this.isConfigured || subscriptionId.startsWith('sub_mock')) {
      console.info(`ℹ️ Paddle Mock: Annulation simulée pour ${subscriptionId}`);
      return true;
    }

    const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        effective_from: effectiveFrom,
      }),
    });

    return response.ok;
  }

  /**
   * Vérifie cryptographiquement la signature d'un webhook Paddle
   * En-tête : paddle-signature: ts=1671552777;h1=0123456789abcdef...
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string | null, secretKey?: string): boolean {
    const secret = secretKey || process.env.PADDLE_WEBHOOK_SECRET_KEY;
    if (!secret || !signatureHeader) {
      return false;
    }

    try {
      const parts = signatureHeader.split(';');
      let ts: string | null = null;
      let h1: string | null = null;

      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key === 'ts') ts = value;
        if (key === 'h1') h1 = value;
      }

      if (!ts || !h1) {
        return false;
      }

      const signedPayload = `${ts}:${rawBody}`;
      const expectedH1 = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(h1, 'hex'), Buffer.from(expectedH1, 'hex'));
    } catch (err) {
      console.error('Erreur vérification webhook Paddle:', err);
      return false;
    }
  }
}

export const paddle = new PaddleClient();
