import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from './auth0-config';

export function Auth0ProviderWithConfig({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
    >
      {children}
    </Auth0Provider>
  );
}
