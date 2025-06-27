import { writable } from 'svelte/store';

export const currentGroup = writable({name: '', id: ''});