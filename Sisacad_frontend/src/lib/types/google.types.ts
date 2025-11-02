export interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleSignInConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

export interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  type?: 'standard' | 'icon';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

declare global {
  interface Window {
    handleGoogleSignIn?: (response: GoogleCredentialResponse) => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleSignInConfig) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonOptions,
          ) => void;
        };
      };
    };
  }
}
