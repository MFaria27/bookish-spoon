import { supabase } from '$lib/supabaseClient';

export async function syncUser(user: any) {
  if (!user) { return { error: 'Missing required user data' }; }

  const { data, error } = await supabase
    .from('users')
    .upsert(
        {
            name: user.user_metadata.full_name,
            email: user.email,
            image: user.user_metadata.avatar_url
        },
        { onConflict: 'email' }
    );
    if (error) { return { error: error.message }; }
    return { success: true, user: data };
}