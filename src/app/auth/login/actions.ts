'use server'

import { createClient, createServiceClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAuthenticatedClient, getServiceClient } from "@/utils/actions/utils/supabase";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface GithubAuthResult extends AuthResult {
  url?: string;
}

// Login
export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/')
  return { success: true }
}

// Signup
export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createServiceClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('name') as string,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`
    }
  }
  const { data: authData, error: signupError } = await supabase.auth.signUp(data);

  if (signupError) {
    // Log detailed error information
    console.error('Signup Error Details:', {
      code: signupError.code,
      message: signupError.message,
      status: signupError.status,
      name: signupError.name
    });
    return { success: false, error: signupError.message }
  }

  // Attribution définitive et éternelle du parrain
  if (authData?.user) {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const refCode = cookieStore.get('easywork_ref')?.value;

      if (refCode) {
        const { data: partner } = await supabase
          .from('affiliates')
          .select('id, user_id, email, is_active, total_signups')
          .ilike('code', refCode.trim())
          .maybeSingle();

        if (partner && partner.is_active !== false) {
          // Bloquer l'auto-affiliation : si même compte ou même email
          const isSelf = 
            (partner.user_id && partner.user_id === authData.user.id) ||
            (partner.email && partner.email.toLowerCase() === data.email.toLowerCase());

          if (!isSelf) {
            await supabase.from('profiles').upsert({
              user_id: authData.user.id,
              email: data.email,
              first_name: (formData.get('name') as string)?.split(' ')[0] || '',
              last_name: (formData.get('name') as string)?.split(' ').slice(1).join(' ') || '',
              referred_by_partner_id: partner.id,
              referred_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            await supabase.from('affiliates').update({
              total_signups: (partner.total_signups || 0) + 1,
            }).eq('id', partner.id);

            console.log(`🤝 Inscription parrainée liée au partenaire ${partner.id} (code: ${refCode})`);
          } else {
            console.warn(`⚠️ Auto-affiliation rejetée pour ${data.email}`);
          }
        }
      }
    } catch (err) {
      console.warn('[AUTH SIGNUP] Notice on partner referral attribution:', err);
    }
  }

  return { success: true }
} 

// Logout 
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
} 

// Password Reset
export async function resetPasswordForEmail(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
} 

// Waitlist Signup
export async function joinWaitlist(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
  };

  try {
    const { error } = await supabase
      .from('mailing-list')
      .insert([data]);

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    console.error('Unexpected error during waitlist signup:', e);
    return { 
      success: false, 
      error: e instanceof Error ? e.message : 'An unexpected error occurred' 
    };
  }
} 

// GitHub Sign In
export async function signInWithGithub(): Promise<GithubAuthResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          next: '/'
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.url) {
      return { success: true, url: data.url };
    }

    return { success: false, error: 'Failed to get OAuth URL' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
} 

// Check if user is authenticated
export async function checkAuth(): Promise<{ 
  authenticated: boolean; 
  user?: { id: string; email?: string } | null 
}> {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Auth check error:', error);
      return { authenticated: false };
    }

    return { 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Unexpected error during auth check:', error);
    return { authenticated: false };
  }
} 

// Get user ID if authenticated
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
} 

// New function to check subscription status
export async function getSubscriptionStatus(): Promise<{
  hasSubscription: boolean;
  plan?: string;
  status?: string;
  error?: string;
}> {
  const supabase = await createClient();
  
  try {
    const userId = await getUserId();
    if (!userId) {
      return { hasSubscription: false, error: 'No authenticated user' };
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('subscription_plan, subscription_status')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return { hasSubscription: false, error: error.message };
    }

    return {
      hasSubscription: !!subscription,
      plan: subscription?.subscription_plan,
      status: subscription?.subscription_status
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { 
      hasSubscription: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 

export async function deleteUserAccount(formData: FormData) {
  'use server'
  
  const confirmation = formData.get('confirm')
  if (confirmation !== 'DELETE') {
    throw new Error('Invalid confirmation text')
  }

  try {
    const { supabase: authClient, user } = await getAuthenticatedClient()
    const { supabase: serviceClient } = await getServiceClient()

    // Delete user from auth
    const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id)
    if (authError) throw new Error(authError.message)

    // Delete user data from profiles table
    const { error: profileError } = await serviceClient
      .from('profiles')
      .delete()
      .eq('user_id', user.id)
    
    if (profileError) throw new Error(profileError.message)

    // Delete user's resumes
    const { error: resumeError } = await serviceClient
      .from('resumes')
      .delete()
      .eq('user_id', user.id)

    if (resumeError) throw new Error(resumeError.message)

    // Sign out after deletion
    await authClient.auth.signOut()
  } catch (error) {
    console.error('Account deletion failed:', error)
    throw error
  }

  redirect('/auth/login')
} 
