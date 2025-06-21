<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from "$app/stores";
    // console.log($page.data.session);
    import Calendar from "./calendar.svelte";
    import Groups from './groups.svelte';

    let groupsLoaded = false;
    function onGroupsMounted(){ groupsLoaded = true }

</script>

<style>
</style>

<main>
    <div class="container is-flex is-flex-direction-column is-justify-content-center is-align-items-center">
        {#if browser && $page.data.session}
            <Groups mounted={onGroupsMounted}/>
            {#if groupsLoaded} <Calendar /> {/if}
        {:else}
            <h1>You are not logged in</h1>
        {/if}
    </div>
</main>
