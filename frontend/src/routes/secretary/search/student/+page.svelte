<script lang="ts">
  import { goto, afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { columns } from "$lib/components/tables/secretary/students/student-columns";
  import DataTable from "$lib/components/tables/secretary/students/data-table.svelte";
  import { SvelteURLSearchParams } from "svelte/reactivity";
  import type { SortingState, VisibilityState } from "@tanstack/table-core";

  let { data } = $props();

  let filterValue = $state("");
  let pageIndex = $state(data.page - 1);
  let pageSize = $state(data.limit);
  let sorting = $state<SortingState>([]);
  let columnVisibility = $state<VisibilityState>({});

  afterNavigate(() => {
    pageIndex = data.page - 1;
    pageSize = data.limit;
    filterValue = page.url.searchParams.get("searchQuery") ?? "";
    const sortBy = page.url.searchParams.get("sortBy");
    const order = page.url.searchParams.get("order");
    if (sortBy && order) {
      sorting = [{ id: sortBy, desc: order === "DESC" }];
    } else {
      sorting = [];
    }
  });

  function updateUrl(searchParams: SvelteURLSearchParams) {
    goto(`?${searchParams.toString()}`, {
      keepFocus: true,
    });
  }

  $effect(() => {
    const searchParams = new SvelteURLSearchParams(page.url.searchParams);
    const currentPage = Number(searchParams.get("page") ?? 1);
    const currentLimit = Number(searchParams.get("limit") ?? 10);

    if (pageIndex + 1 !== currentPage || pageSize !== currentLimit) {
      searchParams.set("page", (pageIndex + 1).toString());
      searchParams.set("limit", pageSize.toString());
      updateUrl(searchParams);
    }
  });

  $effect(() => {
    const query = filterValue;

    const handler = setTimeout(() => {
      const searchParams = new SvelteURLSearchParams(page.url.searchParams);
      const currentQuery = searchParams.get("searchQuery") ?? "";

      if (query !== currentQuery) {
        pageIndex = 0;
        if (query) {
          searchParams.set("searchQuery", query);
        } else {
          searchParams.delete("searchQuery");
        }
        searchParams.set("page", "1");
        updateUrl(searchParams);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  });

  $effect(() => {
    const searchParams = new SvelteURLSearchParams(page.url.searchParams);
    const currentSortBy = searchParams.get("sortBy");
    const currentOrder = searchParams.get("order");

    if (sorting.length > 0) {
      const sort = sorting[0];
      if (
        sort.id !== currentSortBy ||
        (sort.desc ? "DESC" : "ASC") !== currentOrder
      ) {
        searchParams.set("sortBy", sort.id);
        searchParams.set("order", sort.desc ? "DESC" : "ASC");
        updateUrl(searchParams);
      }
    } else {
      if (currentSortBy) {
        searchParams.delete("sortBy");
        searchParams.delete("order");
        updateUrl(searchParams);
      }
    }
  });
</script>

<div class="p-4 md:p-8">
  <h1 class="mb-4 text-2xl font-bold">Gestión de Estudiantes</h1>

  {#if data.error}
    <p class="text-red-500">{data.error}</p>
  {:else}
    <DataTable
      {columns}
      data={data.students}
      bind:filterValue
      bind:pageIndex
      bind:pageSize
      bind:sorting
      bind:columnVisibility
      pageCount={Math.ceil(data.total / pageSize)}
    />
  {/if}
</div>
