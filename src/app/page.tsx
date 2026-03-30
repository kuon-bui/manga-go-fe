import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CounterExample } from '@/components/examples/counter-example';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Welcome to{' '}
              <span className="text-primary-600 dark:text-primary-400">Manga Go</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Read manga online for free with the best reading experience. Thousands of titles
              available at your fingertips.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg">Start Reading</Button>
              <Button variant="outline" size="lg">
                Browse Library
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">
              Why Choose Manga Go?
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <div className="p-6">
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Huge Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Access thousands of manga titles across all genres.
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-6">
                  <div className="text-3xl mb-3">🌙</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Dark Mode
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Read comfortably at night with our dark mode support.
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-6">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Fast & Responsive
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Optimized for speed on all devices and screen sizes.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Zustand Example Section */}
        <section className="bg-gray-50 dark:bg-gray-900 py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Zustand Store Example
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm">
              Interactive demo showing Zustand state management with devtools & persist middleware
            </p>
            <CounterExample />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
