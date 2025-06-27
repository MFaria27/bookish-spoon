import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
	const { id, name } = await request.json();
	if (!id || !name) { return json({ error: 'Missing groupId or name' }, { status: 400 }); }
	const { data, error } = await supabase
		.from('groups')
		.update({ name: name })
		.eq('id', id)
		.select()
		.single();
	if (error) { return json({ error: error.message }, { status: 500 }); }

	return json({ group: data });
}