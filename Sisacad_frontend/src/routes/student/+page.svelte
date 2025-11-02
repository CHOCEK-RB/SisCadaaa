<script lang="ts">
  import backgroundHome from '$lib/assets/background_home.webp';
  import defaultAvatar from '$lib/assets/default_avatar.webp';
  import type { LayoutData } from '../$types.js';

  export let data: LayoutData;

  $: userProfile = data.profile;

  console.log(userProfile);
  $: avatarUrl = userProfile?.iconURL || defaultAvatar;
</script>

<svelte:head>
  <title>Home - Sisacad</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-8">
  <div
    class="relative w-full h-48 sm:h-64 overflow-hidden rounded-b-lg shadow-md"
  >
    <img
      src={backgroundHome}
      alt="Fondo de bienvenida"
      class="absolute inset-0 w-full h-full object-cover"
    />

    <div
      class="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"
    ></div>

    <div class="absolute bottom-0 left-0 right-0 p-4 flex items-center h-auto">
      <div
        class="absolute bottom-18 left-0 right-0 px-4 md:px-6 lg:px-8 flex items-end transform translate-y-1/2"
      >
        <div class="flex-shrink-0 z-10">
          <img
            src={avatarUrl}
            alt="Avatar del usuario"
            class="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white bg-white shadow-md object-cover"
          />
        </div>

        <div
          class="ml-4 sm:ml-6 lg:ml-8 pb-3 sm:pb-4 text-white text-shadow-sm"
        >
          <h1 class="text-2xl sm:text-3xl font-bold leading-tight">
            ¡Hola, {userProfile?.firstName}!
          </h1>
          <p class="text-base sm:text-lg opacity-90 mt-1">
            Bienvenido al Sistema Académico
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
}
