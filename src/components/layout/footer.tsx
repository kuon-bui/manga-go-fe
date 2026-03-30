import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary-600 dark:text-primary-400"
            >
              <span>📖</span>
              <span>Manga Go</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Read manga online for free with the best reading experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Browse', 'Genres', 'Latest Updates'].map((link) => (
                <li key={link}>
                  <Link
                    href="/"
                    className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Genres</h3>
            <ul className="space-y-2">
              {['Action', 'Romance', 'Fantasy', 'Comedy'].map((genre) => (
                <li key={genre}>
                  <Link
                    href="/"
                    className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'DMCA', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} Manga Go. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
