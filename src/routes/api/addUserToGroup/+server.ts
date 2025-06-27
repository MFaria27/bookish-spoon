import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
	const { email, group_id } = await request.json();
	if (!email || !group_id) { return json({ error: 'Missing email or groupId' }, { status: 400 }); }

	const { data: userData, error: userError } = await supabase
		.from('users')
		.select('id')
		.eq('email', email)
		.single();
	if (userError || !userData) { return json({ error: 'User not found' }, { status: 404 }); }

	const { error: insertError } = await supabase
		.from('groupmembers')
		.insert({ user_id: userData.id, group_id: group_id });
	if (insertError) { return json({ error: insertError.message }, { status: 500 }); }

	return json({ success: true });
}