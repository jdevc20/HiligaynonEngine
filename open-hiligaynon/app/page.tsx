import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-200">
      
      {/* Announcement Banner */}
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

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20">
          
          <Link
            href="/sentences"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-white font-medium text-lg transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5"
          >
            🔍 Browse Database
          </Link>

          <Link
            href="/sentences/create"
            className="flex h-14 items-center justify-center gap-2 rounded-full border-2 border-zinc-200 bg-white px-8 text-zinc-900 font-medium text-lg transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ✍️ Contribute a Translation
          </Link>

        </div>

        {/* Community Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-zinc-200 dark:border-zinc-800 pt-16">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
            <div className="text-2xl mb-3">🌍</div>
            <h3 className="text-xl font-bold">Crowdsourced</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Anyone can contribute translations and improve accuracy through community voting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
            <div className="text-2xl mb-3">💻</div>
            <h3 className="text-xl font-bold">Free API</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Developers can integrate Hiligaynon translations into apps using our open REST API.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
            <div className="text-2xl mb-3">📖</div>
            <h3 className="text-xl font-bold">Open Source</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Transparent, community-driven development on GitHub.
            </p>
          </div>

        </div>

        {/* NLP Ecosystem Section */}
        <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-16 mt-12">
          
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Open Hiligaynon NLP Ecosystem
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-3">
              Expanding into language intelligence, search, speech, and structured knowledge systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Dictionary */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
              <div className="text-2xl mb-3">📘</div>
              <h3 className="font-bold text-lg">Dictionary API</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Word meanings, examples, synonyms, and contextual usage in structured format.
              </p>
              <Link href="/dictionary" className="text-blue-600 text-sm mt-3 inline-block">
                Explore →
              </Link>
            </div>

            {/* NLP Engine */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
              <div className="text-2xl mb-3">🧠</div>
              <h3 className="font-bold text-lg">NLP Engine</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Tokenization, normalization, sentence similarity, and linguistic processing.
              </p>
            </div>

            {/* Semantic Search */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
              <div className="text-2xl mb-3">🔎</div>
              <h3 className="font-bold text-lg">Semantic Search</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Search by meaning instead of keywords using embeddings and AI models.
              </p>
            </div>

            {/* TTS */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
              <div className="text-2xl mb-3">🗣️</div>
              <h3 className="font-bold text-lg">Text-to-Speech</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Learn pronunciation with natural Hiligaynon speech synthesis.
              </p>
            </div>

            {/* Grammar Tool */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
              <div className="text-2xl mb-3">✍️</div>
              <h3 className="font-bold text-lg">Grammar Checker</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Detect and correct grammatical errors in Hiligaynon sentences.
              </p>
            </div>

            {/* Resource Hub */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
              <div className="text-2xl mb-3">📤</div>
              <h3 className="font-bold text-lg">Resource Hub</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Submit books, PDFs, recordings, and references to improve datasets.
              </p>
              <Link href="/resources/submit" className="text-blue-600 text-sm mt-3 inline-block">
                Submit →
              </Link>
            </div>

          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 text-center w-full">
          
          <div>
            <div className="text-4xl font-extrabold">1,200+</div>
            <div className="text-sm text-zinc-500 uppercase mt-1">Sentences</div>
          </div>

          <div className="hidden sm:block w-px bg-zinc-200 dark:bg-zinc-800"></div>

          <div>
            <div className="text-4xl font-extrabold">150+</div>
            <div className="text-sm text-zinc-500 uppercase mt-1">Contributors</div>
          </div>

          <div className="hidden sm:block w-px bg-zinc-200 dark:bg-zinc-800"></div>

          <div>
            <div className="text-4xl font-extrabold">100%</div>
            <div className="text-sm text-zinc-500 uppercase mt-1">Open Source</div>
          </div>

        </div>

      </main>
    </div>
  );
}