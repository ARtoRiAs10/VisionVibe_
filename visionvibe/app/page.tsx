import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { SparkleIcon } from "@/components/icons";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <SparkleIcon className="w-16 h-16 text-purple-500" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Vision Vibe
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Transform empty rooms into stunning decorated spaces using AI. Choose your theme, style, and budget, and watch as our AI creates your perfect interior design.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          {userId ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Create New Design
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-up">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Get Started
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Upload</h3>
            <p className="text-gray-600 dark:text-gray-400">Upload a photo of your empty room</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Customize</h3>
            <p className="text-gray-600 dark:text-gray-400">Choose theme, style, and budget</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Generate</h3>
            <p className="text-gray-600 dark:text-gray-400">Get AI-powered design instantly</p>
          </div>
        </div>
      </div>
    </main>
  );
}
