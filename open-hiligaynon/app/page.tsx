import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-200">
      
      {/* Optional Announcement Banner */}
      <div className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 text-center">
        🎉 Welcome to Open Hiligaynon! Join us in building the largest open dataset for the Hiligaynon language.
      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-20 w-full max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Open Hiligaynon
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A crowdsourced, open-source engine dedicated to translating, preserving, and sharing the Hiligaynon language with the world. Built by the community, for everyone.
          </p>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20">
          <Link
            href="/sentences"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-white font-medium text-lg transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
          >
            🔍 Browse Database
          </Link>
          
          <Link
            href="/sentences/create"
            className="flex h-14 items-center justify-center gap-2 rounded-full border-2 border-zinc-200 bg-white px-8 text-zinc-900 font-medium text-lg transition-all hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ✍️ Contribute a Translation
          </Link>
        </div>

        {/* Community Pillars Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-zinc-200 dark:border-zinc-800 pt-16">
          
          {/* Pillar 1: Crowdsourced */}
          <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-2xl">
              🌍
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Crowdsourced</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
              Language evolves, and so do we. Anyone can suggest translations, upvote accurate phrases, and help refine the database.
            </p>
          </div>

          {/* Pillar 2: Open API */}
          <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-2xl">
              💻
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Free API</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
              Building a language app? Our entire Hiligaynon engine is accessible via a free, fast REST API for developers.
            </p>
          </div>

          {/* Pillar 3: Open Source */}
          <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-2xl">
              📖
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Open Source</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
              Our code and data belong to the community. View our source code on GitHub, report issues, or submit a pull request.
            </p>
          </div>
          
        </div>

        {/* Mock Community Stats */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 text-center w-full">
          <div>
            <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">1,200+</div>
            <div className="text-sm font-medium text-zinc-500 uppercase tracking-wide mt-1">Translated Sentences</div>
          </div>
          <div className="hidden sm:block w-px bg-zinc-200 dark:bg-zinc-800"></div>
          <div>
            <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">150+</div>
            <div className="text-sm font-medium text-zinc-500 uppercase tracking-wide mt-1">Active Contributors</div>
          </div>
          <div className="hidden sm:block w-px bg-zinc-200 dark:bg-zinc-800"></div>
          <div>
            <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">100%</div>
            <div className="text-sm font-medium text-zinc-500 uppercase tracking-wide mt-1">Free & Open</div>
          </div>
        </div>

      </main>
    </div>
  );
}