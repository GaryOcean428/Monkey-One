import { Auth0ProviderWithConfig } from './Auth0Provider';
import { LoginButton } from './LoginButton';

function App() {
  return (
    <Auth0ProviderWithConfig>
      <div>
        <h1>Auth0 Login Demo</h1>
        <LoginButton />
      </div>
    </Auth0ProviderWithConfig>
  );
}

export default App;
