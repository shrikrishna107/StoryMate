// pages/_app.tsx
import type { AppProps } from 'next/app';
import { AuthProvider } from '../components/AuthProvider'; // <-- 1. Import your AuthProvider
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // 2. Wrap the entire application with the AuthProvider
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;