<script lang="ts">
    import { signIn, signOut } from "@auth/sveltekit/client";
    import { browser } from '$app/environment';
    import { page } from "$app/stores";
    // console.log($page.data.session);
    import Calendar from "./calendar.svelte";
</script>

<style>
</style>

<main>
    {#if browser && $page.data.session}
        <h1>Signed in as {$page.data.session.user?.name}</h1>
        <button class="button is-bold" on:click={() => signOut()} >Sign Out</button>
        <Calendar />
    {:else}
        <h1>You are not logged in</h1>
        <button class="button is-bold" on:click={() => signIn("google")} >Sign in with Google</button>
    {/if}
</main>
