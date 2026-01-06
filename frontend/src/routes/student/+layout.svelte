<script lang="ts">
  import {
    currentUser,
    isAuthenticated,
    userRole,
  } from "$lib/store/auth.store";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import { page } from "$app/state";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";

  let { children } = $props();

  if ($userRole !== "student") {
    window.location.href = "/";
  }

  type BreadcrumbSegment = {
    label: string;
    href?: string;
  };

  const translations: Record<string, string> = {
    student: "Estudiante",
    courses: "Cursos",
    grades: "Calificaciones",
    schedule: "Horario",
    enrollment: "Matrícula",
  };

  function generateSegments(pathname: string): BreadcrumbSegment[] {
    const parts = pathname.split("/").filter(Boolean);
    let currentPath = "";
    const newSegments: BreadcrumbSegment[] = [];

    parts.forEach((part, i) => {
      currentPath += `/${part}`;
      const isLast = i === parts.length - 1;
      let label = translations[part] || part;

      if (
        i > 1 &&
        parts[i - 1] === "courses" &&
        page.data.courseDetails?.course?.name
      ) {
        label = page.data.courseDetails.course.name;
      }

      newSegments.push({
        href: isLast ? undefined : currentPath,
        label: label,
      });
    });
    return newSegments;
  }

  const segments = $derived(() => {
    return generateSegments(page.url.pathname);
  });
</script>

{#if $isAuthenticated && $currentUser}
  <Sidebar.Provider style="--sidebar-width: 20rem;">
    <AppSidebar />
    <Sidebar.Inset>
      <header
        class="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <Sidebar.Trigger style=" --spacing: 0.5rem;" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <Breadcrumb.Root>
          <Breadcrumb.List>
            {#each segments() as segment, i (segment.href)}
              <Breadcrumb.Item>
                {#if segment.href}
                  <Breadcrumb.Link href={segment.href} class="text-base"
                    >{segment.label}</Breadcrumb.Link
                  >
                {:else}
                  <Breadcrumb.Page class="text-base"
                    >{segment.label}</Breadcrumb.Page
                  >
                {/if}
              </Breadcrumb.Item>
              {#if i < segments().length - 1}
                <Breadcrumb.Separator>&gt;</Breadcrumb.Separator>
              {/if}
            {/each}
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </header>
      <main class="p-4">
        {@render children?.()}
      </main>
    </Sidebar.Inset>
  </Sidebar.Provider>
{:else}
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
{/if}
