import type { Session } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

export const currentGroup = writable({name: '', id: ''});
export const session = writable<Session | null>();