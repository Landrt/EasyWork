/**
 * Flutterwave v3 API Client
 * Provides payment initiation and transaction verification
 */

export interface FlutterwaveCustomer {
  email: string;
  phonenumber?: string;
  name?: string;
}

export interface FlutterwaveCustomizations {
  title?: string;
  description?: string;
  logo?: string;
}

export interface FlutterwavePaymentPayload {
  tx_ref: string;
  amount: number | string;
  currency: string;
  redirect_url: string;
  customer: FlutterwaveCustomer;
  customizations?: FlutterwaveCustomizations;
  meta?: Record<string, any>;
}

export interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data?: {
    link: string;
  };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: 'successful' | 'failed' | 'cancelled';
    customer: {
      id: number;
      name: string;
      email: string;
      phone_number?: string;
    };
    meta?: Record<string, any>;
  };
}

export class FlutterwaveClient {
  private secretKey: string;
  private baseUrl = 'https://api.flutterwave.com/v3';

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.FLUTTERWAVE_SECRET_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.secretKey && !this.secretKey.includes('mock'));
  }

  /**
   * Initiates a Standard hosted checkout payment session
   */
  async initializePayment(payload: FlutterwavePaymentPayload): Promise<{ link: string; tx_ref: string }> {
    if (!this.isConfigured) {
      // Local development demo fallback
      console.log('⚡ Flutterwave: Running in demo/local mode (no live secret key).');
      const demoReturnUrl = `${payload.redirect_url}?status=successful&tx_ref=${payload.tx_ref}&transaction_id=demo-${Date.now()}`;
      return {
        link: demoReturnUrl,
        tx_ref: payload.tx_ref,
      };
    }

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flutterwave payment initialization error:', errorText);
      throw new Error(`Failed to initialize Flutterwave payment: ${response.statusText}`);
    }

    const json: FlutterwavePaymentResponse = await response.json();
    if (json.status !== 'success' || !json.data?.link) {
      throw new Error(json.message || 'Unable to retrieve Flutterwave payment link');
    }

    return {
      link: json.data.link,
      tx_ref: payload.tx_ref,
    };
  }

  /**
   * Verifies a transaction using Flutterwave Transaction ID
   */
  async verifyTransaction(transactionId: string): Promise<FlutterwaveVerifyResponse['data'] | null> {
    if (transactionId.startsWith('demo-') || !this.isConfigured) {
      // Simulated successful transaction in demo mode
      console.log('⚡ Flutterwave: Verifying demo transaction', transactionId);
      return {
        id: Date.now(),
        tx_ref: `easywork-demo-${Date.now()}`,
        flw_ref: `FLW-DEMO-${Date.now()}`,
        amount: 20,
        currency: 'USD',
        charged_amount: 20,
        status: 'successful',
        customer: {
          id: 1,
          name: 'Demo User',
          email: 'demo@easywork.com',
        },
      };
    }

    const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flutterwave transaction verification error:', errorText);
      throw new Error(`Failed to verify Flutterwave transaction: ${response.statusText}`);
    }

    const json: FlutterwaveVerifyResponse = await response.json();
    if (json.status === 'success' && json.data) {
      return json.data;
    }

    return null;
  }

  /**
   * Initiates a payout transfer via Flutterwave Transfers API
   */
  async initiateTransfer(payload: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration?: string;
    currency?: string;
    reference: string;
    callback_url?: string;
  }): Promise<{ id: number | string; status: string; reference: string }> {
    if (!this.isConfigured || payload.reference.startsWith('demo-')) {
      console.log('⚡ Flutterwave Transfers: Simulating payout in local demo mode', payload);
      return {
        id: `flw-trf-${Date.now()}`,
        status: 'NEW',
        reference: payload.reference,
      };
    }

    const response = await fetch(`${this.baseUrl}/transfers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_bank: payload.account_bank,
        account_number: payload.account_number,
        amount: payload.amount,
        narration: payload.narration || 'EasyWork Partner Commission Payout',
        currency: payload.currency || 'USD',
        reference: payload.reference,
        callback_url: payload.callback_url,
        debit_currency: payload.currency || 'USD',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flutterwave transfer error:', errorText);
      throw new Error(`Échec du transfert Flutterwave: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.status !== 'success' || !json.data) {
      throw new Error(json.message || 'Erreur lors de l\'initiation du virement Flutterwave');
    }

    return {
      id: json.data.id,
      status: json.data.status,
      reference: json.data.reference,
    };
  }
}

export const flutterwave = new FlutterwaveClient();
