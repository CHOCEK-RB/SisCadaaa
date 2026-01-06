// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { UserSession } from '$lib/stores/auth.store';

declare global {
  namespace App {
    interface Locals {
      user: UserSession | null;
    }

    interface PageData {
      user?: UserSession | null;
    }

    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
