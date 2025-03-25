interface Window {
  PUBLIC_URL: string;
  ENV: {
    VITE_PUBLIC_URL: string;
    [key: string]: string;
  };
}