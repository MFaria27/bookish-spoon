<script lang="ts">
    import { Calendar } from "bits-ui";
    import CaretLeft from "phosphor-svelte/lib/CaretLeft";
    import CaretRight from "phosphor-svelte/lib/CaretRight";
    import Trash from "phosphor-svelte/lib/Trash";
    import { getLocalTimeZone, today, isSameDay, type DateValue, parseDate, CalendarDate } from "@internationalized/date";
    import { onMount } from "svelte";
    import { currentGroup } from "../store";

    let groupName : any;
    let calendarID = ''

	onMount(async () => {
		loadCalendar()
	});

    $effect(() => {
        const newGroup = $currentGroup["name"];
        console.log(`New group loaded: ${newGroup}`)
        loadCalendar();
    });

    let value = $state(today(getLocalTimeZone()));
    const currentDate = today(getLocalTimeZone());
    
    let placeholderEventTitle = $state("");
    let placeholderEventDetails = $state("");
    let placeholderEventDate = $state("");

    let editEventId = $state("");
    let editEventTitle = $state("");
    let editEventDetails = $state("");
    let editEventDate = $state(new CalendarDate(1, 1, 1));
    
    let isModalOpen = $state(false);
    function openModal() { isModalOpen = true; }
    function closeModal() { isModalOpen = false; isDateModalOpen = false; placeholderEventTitle = ''; placeholderEventDetails = ''; placeholderEventDate = ''}

    let isEditModalOpen = $state(false);
    function openEditModal(saved_date : any) { 
        editEventId = saved_date["id"];
        editEventTitle = saved_date["title"];
        editEventDetails = saved_date["details"];
        editEventDate = saved_date["date"];
        isEditModalOpen = true; 
    }
    function closeEditModal() { 
        editEventId = ''; 
        editEventTitle = ''; 
        editEventDetails = ''; 
        editEventDate = new CalendarDate(1, 1, 1)
        saved_dates.forEach((saved_date: { [x: string]: boolean; }) => {
            saved_date["settings_open"] = false
        });
        isEditModalOpen = false; 
        isDateModalOpen = false;
    }

    let formattedSelectedDate : any = $state();
    let selectedDate : any = $state();
    let selectedDateEvents : any[] = $state([]);
    let isDateModalOpen = $state(false);
    function openDateModal(date : DateValue) { 
        placeholderEventDate = dateValueToISO(date);
        let nativeDate = new Date(date.year, date.month-1, date.day);
        formattedSelectedDate = Intl.DateTimeFormat('en-US', {year:'numeric', month:'long', day:"numeric"}).format(nativeDate)
        selectedDateEvents = saved_dates.filter((saved_date: { date: { year: number; month: number; day: number; }; }) =>
            saved_date.date.year === date.year &&
            saved_date.date.month === date.month &&
            saved_date.date.day === date.day
        );
        isDateModalOpen = true; 
    }
    function closeDateModal() {
        isDateModalOpen = false; 
    }

    function dateValueToISO(dateValue : DateValue) {
        const pad = (num : any) => String(num).padStart(2, '0');
        return `${dateValue.year}-${pad(dateValue.month)}-${pad(dateValue.day)}`;
    }

    let saved_dates : any = $state([ ]);

    async function loadCalendar() {
        try {
            currentGroup.subscribe(value => { groupName = value?.name; })
			const res = await fetch(`/api/getCalendarByGroupName?group=${encodeURIComponent(groupName)}`);
			if (!res.ok) throw new Error('Failed to fetch calendar');
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			let calendar = data.calendar;
            calendarID = calendar['id']
            saved_dates = []
            calendar['calendar_events'].forEach((saved_date:any) => {
                saved_dates.push({
                    "id": saved_date["id"],
                    "title": saved_date["event_name"],
                    "details": saved_date["event_details"],
                    "date": parseDate(saved_date["event_date"]),
                    "settings_open" : false
                });
            });
		} catch (err:any) { console.log(err.message || 'Unknown error'); }
    }

    async function addSavedDate() {
        try {
            const res = await fetch('/api/postEvent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    calendar_id: calendarID, 
                    event_name: placeholderEventTitle,
                    event_details: placeholderEventDetails,
                    event_date: placeholderEventDate
                })
            });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.error || 'Failed to post event'); }
            await loadCalendar();
        } catch (err: any) { console.error('Error saving event:', err.message); }

        placeholderEventTitle = "";
        placeholderEventDetails = "";
        placeholderEventDate = "";
        closeModal()
    }

    async function deleteEvent( eventID : any ) {
        try {
            const res = await fetch('/api/deleteEvent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: eventID })
            });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.error || 'Failed to delete event'); }
            await loadCalendar();
        } catch (err: any) { console.error('Error deleting event:', err.message); }
    }

    async function editEvent() {
        try {
            if (editEventDate && typeof editEventDate === 'string'){ editEventDate = parseDate(editEventDate) }
            const res = await fetch('/api/editEvent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    "id": editEventId, 
                    "event_name" : editEventTitle, 
                    "event_details" : editEventDetails, 
                    "event_date" : dateValueToISO(editEventDate)
                }),
            });
            if (!res.ok) throw new Error('Failed to edit event');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
        } catch (err: any) {
            console.error(err.message || 'Unknown error');
        }
        await loadCalendar();
        closeEditModal()
    }

    function isToday(date: DateValue): boolean {
        return isSameDay(date, currentDate);
    }

    function isSaved(date: DateValue): boolean {
        let saved = false;
        saved_dates.forEach((saved_date:any) => {
            if (isSameDay(date, saved_date["date"])) saved = true;
        });
        return saved;
    }
</script>

<main>
    <div class="calendar-wrapper">
        <Calendar.Root class="card has-background-black-ter" weekdayFormat="short" fixedWeeks={true} type="single" style="width: 350px;" bind:value>
            {#snippet children({ months, weekdays })}
                <Calendar.Header class="card-header is-justify-content-space-between is-align-items-center px-4 py-3">
                    <Calendar.PrevButton class="button is-small">
                        <CaretLeft class=""/>
                    </Calendar.PrevButton>
                    <Calendar.Heading class="has-text-weight-semibold is-size-5"/>
                    <Calendar.NextButton class="button is-small">
                        <CaretRight class=""/>
                    </Calendar.NextButton>
                </Calendar.Header>
                <div class="card-content pt-0 is-flex is-justify-content-center is-align-items-center">
                    {#each months as month, i (i)}
                        <Calendar.Grid class="is-fullwidth has-text-centered">
                            <Calendar.GridHead class="">
                                <Calendar.GridRow class="columns is-multiline is-gapless has-text-weight-bold mb-2">
                                    {#each weekdays as day, i (i)}
                                        <Calendar.HeadCell class="column has-text-centered is-size-7">
                                            <div>{day.slice(0, 2)}</div>
                                        </Calendar.HeadCell>
                                    {/each}
                                </Calendar.GridRow>
                            </Calendar.GridHead>
                            <Calendar.GridBody>
                                {#each month.weeks as weekDates, i (i)}
                                    <Calendar.GridRow class="columns is-multiline is-gapless mb-0" style="position:relative">
                                        {#each weekDates as date, i (i)}
                                            {#if isToday(date)}
                                                <Calendar.Cell {date} month={month.value} class="column has-text-centered has-background-primary calendar-cell" onclick={() => openDateModal(date)}>
                                                    <div class="container is-flex is-justify-content-center is-align-items-center dot-cell">
                                                        <span class={`dot ${isSaved(date) ? 'is-visible' : 'is-invisible'} has-background-dark`}></span>
                                                    </div>
                                                    <Calendar.Day class={`is-justify-content-center is-align-items-center is-size-6 date-cell has-text-black-ter ${date.month === month.value.month ? 'has-text-weight-bold' : 'has-text-grey-light'}`}>
                                                        {date.day}
                                                    </Calendar.Day>
                                                </Calendar.Cell>
                                            {:else}
                                                <Calendar.Cell {date} month={month.value} class="column has-text-centered calendar-cell" onclick={() => openDateModal(date)}>
                                                    <div class="container is-flex is-justify-content-center is-align-items-center dot-cell">
                                                        <span class={`dot ${isSaved(date) ? 'is-visible' : 'is-invisible'} has-background-white`}></span>
                                                    </div>
                                                    <Calendar.Day class={`is-justify-content-center is-align-items-center is-size-6 date-cell ${date.month === month.value.month ? 'has-text-weight-bold' : 'has-text-grey-light'}`}>                                               
                                                        {date.day}
                                                    </Calendar.Day>
                                                </Calendar.Cell>
                                            {/if}
                                        {/each}
                                    </Calendar.GridRow>
                                {/each}
                            </Calendar.GridBody>
                        </Calendar.Grid>
                    {/each}
                </div>
                {#if isDateModalOpen}
                    <div class="modal is-active">
                        <button class="modal-background" aria-label="close" onclick={closeDateModal}></button>
                        <div class="modal-card" style="width: 350px;">
                            <header class="modal-card-head p-4">
                                <p class="modal-card-title">{formattedSelectedDate}</p>
                                <button class="button is-small is-primary mr-4" onclick={openModal}>New Event</button>
                                <button class="delete" aria-label="close" onclick={closeDateModal}></button>
                            </header>
                            <section class="modal-card-body {selectedDateEvents.length == 0 ? 'p-0' : 'p-4 pb-6'}">
                                <div class="field">
                                    {#each selectedDateEvents as date, i (i)}
                                        <div class="date container pb-3">
                                            <div class="container is-flex is-justify-content-space-between is-align-items-center px-2">
                                                <h1 class="has-text-weight-semibold is-size-5 pr-2" style="word-break: break-word;">{date["title"]}</h1>
                                                <div class="is-flex is-justify-content-flex-end is-align-items-center pt-1">
                                                    <h1 class="has-text-weight-semibold is-size-6 pr-2 pb-1">{date["date"]}</h1>
                                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                                    <div class="dropdown is-right {date["settings_open"] ? 'is-active' : ''}">
                                                        <div class="dropdown-trigger">
                                                            <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu" onclick={() => {date["settings_open"] = !date["settings_open"]}}>
                                                                <span class="icon">
                                                                    <i class="fas fa-cog"></i>
                                                                </span>
                                                            </button>
                                                        </div>
                                                        <div class="dropdown-menu" id="dropdown-menu" role="menu">
                                                            <div class="dropdown-content">
                                                                <!-- svelte-ignore a11y_missing_attribute -->
                                                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                                <a class="dropdown-item is-flex is-justify-content-center is-align-items-center px-0 py-1" onclick={() => openEditModal(date)}>
                                                                    <span class="icon pr-2">
                                                                        <i class="fas fa-rug"></i>
                                                                    </span>
                                                                    <span class="">Edit</span>
                                                                </a>
                                                                <!-- svelte-ignore a11y_missing_attribute -->
                                                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                                <a class="dropdown-item is-flex is-justify-content-center is-align-items-center px-0 py-1" onclick={() => deleteEvent(date["id"])}>
                                                                    <span class="icon pr-2">
                                                                        <i class="fas fa-trash" style="color: hsl(348, 100%, 61%);"></i>
                                                                    </span>
                                                                    <span class="has-text-danger">Delete</span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="container px-2">{date["details"]}</div>
                                        </div>
                                    {/each}
                                </div>
                            </section>
                            <footer class="modal-card-foot p-4">
                                <div class="buttons">
                                    <button class="button" onclick={closeDateModal}>Close</button>
                                </div>
                            </footer>
                        </div>
                    </div>
                {/if}
                <div class="card-footer" style="display:inline">
                    <div class="container">
                        <div class="container is-flex is-justify-content-space-between is-align-items-center py-2 px-5">
                            <h1 class="has-text-weight-semibold is-size-4 pb-1">Events</h1>
                            <button class="button is-small is-primary" onclick={openModal}>New</button>
                        </div>
                        {#if isModalOpen}
                            <div class="modal is-active">
                                <button class="modal-background" aria-label="close" onclick={closeModal}></button>
                                <div class="modal-card" style="width: 350px;">
                                    <header class="modal-card-head p-4">
                                        <p class="modal-card-title">Create New Event</p>
                                        <button class="delete" aria-label="close" onclick={closeModal}></button>
                                    </header>
                                    <section class="modal-card-body p-4">
                                        <div class="field">
                                            <!-- svelte-ignore a11y_label_has_associated_control -->
                                            <label class="label">Title ({placeholderEventTitle.length}/25)</label>
                                            <div class="control">
                                                <input class="input" type="text" maxlength="25" placeholder="Awesome Day" bind:value={placeholderEventTitle}>
                                            </div>
                                        </div>
                                        <div class="field">
                                            <!-- svelte-ignore a11y_label_has_associated_control -->
                                            <label class="label">Details ({placeholderEventDetails.length}/75)</label>
                                            <div class="control">
                                                <input class="input" type="text" maxlength="75" bind:value={placeholderEventDetails} placeholder="We are eating lots of cheese">
                                            </div>
                                        </div>
                                        <div class="field">
                                            <!-- svelte-ignore a11y_label_has_associated_control -->
                                            <label class="label">Date</label>
                                            <div class="control">
                                                <input class="input" type="date" bind:value={placeholderEventDate}>
                                            </div>
                                        </div>
                                    </section>
                                    <footer class="modal-card-foot p-4">
                                        <div class="buttons">
                                            <button class="button is-success" onclick={addSavedDate}>Save Event</button>
                                            <button class="button" onclick={closeModal}>Cancel</button>
                                        </div>
                                    </footer>
                                </div>
                            </div>
                        {/if}
                    </div>
                    <div class="saved-dates container">
                        {#each saved_dates as saved_date, i (i)}
                            <div class="date container pb-3">
                                <div class="container is-flex is-justify-content-space-between is-align-items-center px-5">
                                    <h1 class="has-text-weight-semibold is-size-5 pr-2" style="word-break: break-word;">{saved_date["title"]}</h1>
                                    <div class="is-flex is-justify-content-flex-end is-align-items-center pt-1">
                                        <h1 class="has-text-weight-semibold is-size-6 pr-2 pb-1">{saved_date["date"]}</h1>
                                        <!-- svelte-ignore a11y_consider_explicit_label -->
                                         <div class="dropdown is-right is-up {saved_date["settings_open"] ? 'is-active' : ''}">
                                            <div class="dropdown-trigger">
                                                <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu" onclick={() => {saved_date["settings_open"] = !saved_date["settings_open"]}}>
                                                    <span class="icon">
                                                        <i class="fas fa-cog"></i>
                                                    </span>
                                                </button>
                                            </div>
                                            <div class="dropdown-menu" id="dropdown-menu" role="menu">
                                                <div class="dropdown-content">
                                                    <!-- svelte-ignore a11y_missing_attribute -->
                                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                    <a class="dropdown-item is-flex is-justify-content-center is-align-items-center px-0 py-1" onclick={() => openEditModal(saved_date)}>
                                                        <span class="icon pr-2">
                                                            <i class="fas fa-rug"></i>
                                                        </span>
                                                        <span class="">Edit</span>
                                                    </a>
                                                    <!-- svelte-ignore a11y_missing_attribute -->
                                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                    <a class="dropdown-item is-flex is-justify-content-center is-align-items-center px-0 py-1" onclick={() => deleteEvent(saved_date["id"])}>
                                                        <span class="icon pr-2">
                                                            <i class="fas fa-trash" style="color: hsl(348, 100%, 61%);"></i>
                                                        </span>
                                                        <span class="has-text-danger">Delete</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="container px-5">{saved_date["details"]}</div>
                            </div>
                        {/each}
                    </div>
                    {#if isEditModalOpen}
                        <div class="modal is-active">
                            <button class="modal-background" aria-label="close" onclick={closeEditModal}></button>
                            <div class="modal-card" style="width: 350px;">
                                <header class="modal-card-head p-4">
                                    <p class="modal-card-title">Edit Event</p>
                                    <button class="delete" aria-label="close" onclick={closeEditModal}></button>
                                </header>
                                <section class="modal-card-body p-4">
                                    <div class="field">
                                        <!-- svelte-ignore a11y_label_has_associated_control -->
                                        <label class="label">Title ({editEventTitle.length}/25)</label>
                                        <div class="control">
                                            <input class="input" type="text" maxlength="25" placeholder="Awesome Day" bind:value={editEventTitle}>
                                        </div>
                                    </div>
                                    <div class="field">
                                        <!-- svelte-ignore a11y_label_has_associated_control -->
                                        <label class="label">Details ({editEventDetails.length}/75)</label>
                                        <div class="control">
                                            <input class="input" type="text" maxlength="75" bind:value={editEventDetails} placeholder="We are eating lots of cheese">
                                        </div>
                                    </div>
                                    <div class="field">
                                        <!-- svelte-ignore a11y_label_has_associated_control -->
                                        <label class="label">Date</label>
                                        <div class="control">
                                            <input class="input" type="date" bind:value={editEventDate}>
                                        </div>
                                    </div>
                                </section>
                                <footer class="modal-card-foot p-4">
                                    <div class="buttons">
                                        <button class="button is-success" onclick={editEvent}>Edit Event</button>
                                        <button class="button" onclick={closeEditModal}>Cancel</button>
                                    </div>
                                </footer>
                            </div>
                        </div>
                    {/if}
                </div>
            {/snippet}
        </Calendar.Root>
    </div>
</main>
