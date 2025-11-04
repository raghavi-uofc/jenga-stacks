import React from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-zinc-950/70 border-b border-gray-100 dark:border-zinc-800">
        <div className="container-max h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Jenga Stacks" className="h-7 w-7" />
            <span className="font-semibold">Jenga Stacks</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="outline">Sign in</Button></Link>
          </div>
        </div>
      </header>

      <main className="container-max py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Plan and ship faster with AI‑assisted recommendations</h1>
            <p className="opacity-80">Jenga Stacks helps you turn ideas into actionable plans: generate technical recommendations, sequence work, and share clear next steps with your team.</p>
            <div className="flex gap-3">
              <Link to="/login"><Button>Get Started</Button></Link>
              <a href="#how-it-works"><Button variant="outline">Learn more</Button></a>
              <Link to="/login">
                <Button variant="secondary" leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.4 3.6-5.1 3.6-3.1 0-5.7-2.6-5.7-5.7s2.6-5.7 5.7-5.7c1.8 0 3 .7 3.6 1.3l2.5-2.4C16.9 3.8 14.7 3 12 3 6.9 3 2.7 7.2 2.7 12.3S6.9 21.6 12 21.6c6.9 0 9.6-4.8 9.6-7.2 0-.5 0-.8-.1-1.2H12z"/></svg>}>
                  Continue with Google
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm opacity-70">
              <span>Secure • Local dev friendly</span>
              <span>Gemini‑powered</span>
            </div>
          </div>
          <div className="hidden md:block">
            <img src="/hero-illustration.svg" alt="Product preview illustration" className="w-full h-auto rounded-2xl border border-gray-200 dark:border-zinc-800" />
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          <Card title="Describe">
            <p className="text-sm opacity-80">Share your goals, constraints, and context. The more detail you provide, the more specific the plan.</p>
          </Card>
          <Card title="Generate">
            <p className="text-sm opacity-80">Get a phased architecture and delivery plan powered by Google Gemini.</p>
          </Card>
          <Card title="Iterate">
            <p className="text-sm opacity-80">Tweak prompts, refine outputs, and export summaries to share with stakeholders.</p>
          </Card>
        </div>
      </main>
      <footer className="py-6 text-center opacity-70 text-xs">(c) {new Date().getFullYear()} Jenga Stacks - Landing</footer>
    </div>
  );
}
