// pages/auth.tsx
import { NextPage } from 'next';
import Head from 'next/head';
import AuthForm from '../components/AuthForm'; // 1. Import the clean component

const AuthPage: NextPage = () => {
  // 2. All logic, state, and hooks have been removed. This is just for layout.
  return (
    <>
      <Head>
        <title>Login - StoryMate</title>
        <meta name="description" content="Login or Register for StoryMate" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #a594f9, #6c63ff);
        }
      `}</style>

      {/* This is the main container for the page */}
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        {/* This div holds the background image and provides the relative positioning context for the form */}
        <div className="relative w-full max-w-4xl">
          {/* Background Image */}
          <img
            alt="Illustration of purple mountain landscape with birds"
            className="w-full h-auto object-cover rounded-3xl shadow-2xl"
            src="/logbg.png" // Correct path for files in the public folder
            style={{ aspectRatio: '1.5 / 1' }}
          />

          {/* 3. Render the AuthForm component here. It will position itself correctly. */}
          <AuthForm />
        </div>
      </div>
    </>
  );
};

export default AuthPage;