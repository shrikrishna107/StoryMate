// components/AuthForm.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  useSignInWithEmailAndPassword,
  useCreateUserWithEmailAndPassword,
  useSignInWithGoogle,
  useAuthState
} from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase'; // Make sure this path is correct

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  const [signInWithEmailAndPassword, , loadingSignIn, errorSignIn] = useSignInWithEmailAndPassword(auth);
  const [createUserWithEmailAndPassword, , loadingCreate, errorCreate] = useCreateUserWithEmailAndPassword(auth);
  const [signInWithGoogle, , loadingGoogle, errorGoogle] = useSignInWithGoogle(auth);
  const [user, loadingAuth] = useAuthState(auth);

  useEffect(() => {
    if (!loadingAuth && user) {
      router.push('/dashboard');
    }
  }, [user, loadingAuth, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await signInWithEmailAndPassword(email, password);
    } else {
      await createUserWithEmailAndPassword(email, password);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const errorMsg = errorSignIn?.message || errorCreate?.message || errorGoogle?.message;

  // This component's root is the form itself, with all positioning and styling classes.
  // It contains all the logic and state.
  return (
    <form
      aria-label="Login form"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 border border-white/40 rounded-2xl p-8 w-[350px] backdrop-blur-lg shadow-xl"
      onSubmit={handleAuth}
    >
      <h2 className="text-white text-center text-2xl mb-6">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      {errorMsg && <p className="text-red-400 bg-red-500/20 rounded-md p-2 text-center text-sm mb-4">{errorMsg}</p>}
      <div className="mb-4 relative">
        <input
          className="w-full rounded-full border border-white/60 bg-white/10 text-white placeholder-white/70 py-2.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Email ID"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Using an SVG for the icon is better than relying on Font Awesome CSS */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </div>
      <div className="mb-4 relative">
        <input
          className="w-full rounded-full border border-white/60 bg-white/10 text-white placeholder-white/70 py-2.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Password"
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      <div className="flex justify-between items-center mb-6 text-white text-xs">
        <label className="flex items-center space-x-2 select-none cursor-pointer">
          <input
            className="w-3.5 h-3.5 text-purple-500 bg-white/10 border-white/60 rounded focus:ring-purple-500 focus:ring-offset-0"
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
          />
          <span>Remember me</span>
        </label>
        <a className="text-white/80 hover:text-white transition-colors duration-200" href="#">
          Forgot Password?
        </a>
      </div>
      <button
        className="w-full bg-white text-black  rounded-full py-2.5 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
        type="submit"
        disabled={loadingSignIn || loadingCreate}
      >
        {loadingSignIn || loadingCreate ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
      </button>

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-white/30"></div>
        <span className="flex-shrink mx-4 text-white/60 text-xs">OR</span>
        <div className="flex-grow border-t border-white/30"></div>
      </div>

      <button
        aria-label="Login with Google"
        className="w-full flex items-center justify-center space-x-3 border border-white/60 rounded-full py-2.5 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/80 transition-colors duration-200 disabled:opacity-50"
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loadingGoogle}
      >
        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 3.4-2.31 6.22-4.78 8.12l7.61 5.88C44.63 38.24 46.98 32.08 46.98 24.55z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.61-5.88c-2.11 1.41-4.78 2.24-7.97 2.24-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
        <span>{loadingGoogle ? 'Loading...' : 'Login with Google'}</span>
      </button>
      <p className="text-center text-white/80 text-xs mt-6">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          className="font-semibold underline hover:text-white transition-colors duration-200"
          type="button"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;