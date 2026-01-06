<script lang="ts">
  import { ChevronRight } from 'lucide-svelte';

  type BreadcrumbSegment = {
    label: string;
    href: string;
  };

  type Props = {
    segments: BreadcrumbSegment[];
  };

  let { segments }: Props = $props();
</script>

<nav aria-label="breadcrumb">
  <ol class="flex items-center space-x-1 text-sm text-muted-foreground">
    {#each segments as segment, i (segment.href)}
      <li>
        {#if i < segments.length - 1}
          <div class="flex items-center">
            <a
              href={segment.href}
              class="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {segment.label}
            </a>
            <ChevronRight class="mx-1 h-4 w-4 flex-shrink-0" />
          </div>
        {:else}
          <span
            aria-current="page"
            class="font-medium text-foreground"
          >
            {segment.label}
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
