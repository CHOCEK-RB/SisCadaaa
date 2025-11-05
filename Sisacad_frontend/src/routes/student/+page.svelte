<script lang="ts">
  import backgroundHome from '$lib/assets/background_home.webp';
  import defaultAvatar from '$lib/assets/default_avatar.webp';
  import type { LayoutData } from '../$types.js';

  export let data: LayoutData;

  $: userProfile = data.profile;

  console.log(userProfile);
  $: avatarUrl = userProfile?.iconURL || defaultAvatar;
</script>

<svelte:head></svelte:head>

<div class="min-h-screen bg-gray-50 pb-8">
  <div
    class="relative h-48 w-full overflow-hidden rounded-b-lg shadow-md sm:h-64"
  >
    <img
      src={backgroundHome}
      alt="Fondo de bienvenida"
      class="absolute inset-0 h-full w-full object-cover"
    />

    <div
      class="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"
    ></div>

    <div class="absolute right-0 bottom-0 left-0 flex h-auto items-center p-4">
      <div
        class="absolute right-0 bottom-18 left-0 flex translate-y-1/2 transform items-end px-4 md:px-6 lg:px-8"
      >
        <div class="z-10 flex-shrink-0">
          <img
            src={avatarUrl}
            alt="Avatar del usuario"
            class="h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-md sm:h-28 sm:w-28 lg:h-32 lg:w-32"
          />
        </div>

        <div
          class="ml-4 pb-3 text-white text-shadow-sm sm:ml-6 sm:pb-4 lg:ml-8"
        >
          <h1 class="text-2xl leading-tight font-bold sm:text-3xl">
            ¡Hola, {userProfile?.firstName}!
          </h1>
          <p class="mt-1 text-base opacity-90 sm:text-lg">
            Bienvenido al Sistema Académico
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
}
