import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
	const { name, email } = await request.json();
	if (!name || !email) { return json({ error: 'Missing group name or email' }, { status: 400 }); }

	const { data: groupData, error: groupError } = await supabase
		.from('groups')
		.insert({ name: name })
		.select()
		.single();
	if (groupError) { return json({ error: groupError.message }, { status: 500 }); }

	const { data: calendarData, error: calendarError } = await supabase
		.from('calendars')
		.insert({ group_id: groupData.id })
		.select()
		.single();
	if (calendarError) { return json({ error: calendarError.message }, { status: 500 }); }

	const { data: userData, error: userError } = await supabase
		.from('users')
		.select('id')
		.eq('email', email)
		.single();
	if (userError || !userData) { return json({ error: 'User not found' }, { status: 404 }); }

	const { error: memberError } = await supabase
		.from('groupmembers')
		.insert({ user_id: userData.id, group_id: groupData.id });
	if (memberError) { return json({ error: memberError.message }, { status: 500 }); }

	return json({ group: groupData, calendar: calendarData });
}