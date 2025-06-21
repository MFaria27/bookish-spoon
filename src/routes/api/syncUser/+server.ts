// +server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
  const user = await request.json();
  if (!user) { return json({ error: 'Missing required user data' }, { status: 400 }); }

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
  if (error) { return json({ error: error.message }, { status: 500 }); }
  return json({ success: true, user: data });
}