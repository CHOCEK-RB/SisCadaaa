import type {
  GoogleCredentialResponse,
  GoogleButtonOptions,
} from '$lib/types/google.types';

export class GoogleAuthManager {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  initialize(callback: (response: GoogleCredentialResponse) => void): void {
    if (!window.google) {
      console.error('Google Identity Services script not loaded yet.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback,
    });
  }

  renderButton(
    containerId: string,
    options: GoogleButtonOptions = {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
    },
  ): boolean {
    const buttonContainer = document.getElementById(containerId);

    if (!buttonContainer) {
      console.error(
        `Google Sign-In button container '${containerId}' not found.`,
      );
      return false;
    }

    if (!window.google) {
      console.error('Google Identity Services not available.');
      return false;
    }

    window.google.accounts.id.renderButton(buttonContainer, options);
    return true;
  }

  setup(
    callback: (response: GoogleCredentialResponse) => void,
    containerId: string = 'google-signin-button',
    buttonOptions?: GoogleButtonOptions,
  ): void {
    this.initialize(callback);
    this.renderButton(containerId, buttonOptions);
  }
}
