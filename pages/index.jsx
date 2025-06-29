import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faCheck } from '@fortawesome/free-solid-svg-icons';

const LandingPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>StoryMate</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* The background color is now set to lavender (#E6E6FA) */}
      <div className="bg-[#E6E6FA] text-gray-700 min-h-screen flex flex-col">
        <header className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto w-full">
          <a href="#" className="flex items-center text-[#7c5afc] font-semibold text-lg gap-2">
            <FontAwesomeIcon icon={faBookOpen} className="h-6 w-6" />
            StoryMate
          </a>
          <button
            className="bg-[#4c51f9] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#3b43c6] transition"
            type="button"
            onClick={() => router.push('/auth')}
          >
            Get Started
          </button>
        </header>

        <main className="flex-grow max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-20">
          <section className="max-w-md md:max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-black leading-tight">
              Create Your Own <br />
              <span className="text-[#7c5afc]">Interactive Adventure</span>
            </h1>
            <p className="mt-4 text-gray-600 text-base max-w-md">
              Embark on a journey where YOU decide the outcome. StoryMate crafts unique stories that evolve based on your choices, creating a personalized adventure every time.
            </p>
            <ul className="mt-6 space-y-3 text-gray-700 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#c7d2fe] text-[#4c51f9]">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                Unlimited stories
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#c7d2fe] text-[#4c51f9]">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                Multiple genres
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#c7d2fe] text-[#4c51f9]">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                Save your progress
              </li>
            </ul>
            <button
              className="mt-8 bg-gradient-to-r from-[#7c5afc] to-[#b86bff] text-white font-semibold text-sm px-6 py-3 rounded-full hover:opacity-90 transition"
              type="button"
              onClick={() => router.push('/auth')}
            >
              Start Your Adventure
            </button>
          </section>

          <section
            className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-sm text-gray-600"
            style={{ minWidth: '320px' }}
          >
            <header className="flex items-center justify-between mb-3">
              <div className="flex space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400 block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
              </div>
              <span className="text-xs text-gray-400 select-none">StoryMate Preview</span>
            </header>
            <p className="mb-4">The ancient door creaks open, revealing two passages...</p>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-[#dbe4ff] text-[#4c51f9] font-semibold rounded-md px-4 py-3 text-left hover:bg-[#c7d2fe] transition"
                type="button"
              >
                Take the left passage with glowing runes
              </button>
              <button
                className="flex-1 bg-[#f3e8ff] text-[#7c5afc] font-semibold rounded-md px-4 py-3 text-left hover:bg-[#e0ccff] transition"
                type="button"
              >
                Follow the right path with strange whispers
              </button>
            </div>
            <p className="mt-3 text-xs italic text-gray-400 select-none">Your choice will shape the story...</p>
          </section>
        </main>

        <footer className="text-center text-gray-500 text-xs py-4 select-none">
          © 2025 StoryMate. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default LandingPage;