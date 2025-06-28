import { supabase } from '$lib/supabaseClient';

export async function syncUser(user: { name: any; email: any; image: any; }) {
  if (!user) { return { error: 'Missing required user data' }; }

  const { data, error } = await supabase
    .from('users')
    .upsert(
        {
            name: user.name,
            email: user.email,
            image: user.image
        },
        { onConflict: 'email' }
    );
    if (error) { return { error: error.message }; }
    return { success: true, user: data };
}