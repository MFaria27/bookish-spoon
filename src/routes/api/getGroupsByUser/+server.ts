import { json } from '@sveltejs/kit'
import { supabase } from '$lib/supabaseClient';

export async function GET({ url }) {
    const email = url.searchParams.get('email');
    if (!email) { return json({ error: 'Missing email param' }, { status: 400 }); }

    const { data: userData, error: userError } = await supabase
		.from('users')
		.select('id')
		.eq('email', email)
		.single();
	if (userError || !userData) { return json({ error: 'User not found' }, { status: 404 }); }

    const userId = userData.id;

	const { data: groupMemberData, error: groupMemberError } = await supabase
		.from('groupmembers')
		.select('group_id, groups(name)')
		.eq('user_id', userId);
	if (groupMemberError) { return json({ error: groupMemberError.message }, { status: 500 }); }

	return json({ groups: groupMemberData });
}