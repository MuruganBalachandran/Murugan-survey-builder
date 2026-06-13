import { Link } from '@tanstack/react-router'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-violet-200/60 bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 text-white">
      <div className="grid w-full gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <span className="text-lg font-bold">S</span>
            </div>
            <div>
              <p className="font-bold">SurveyBuilder</p>
              <p className="text-sm text-violet-100">Create, share, and collect responses.</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-violet-100">© {currentYear} SurveyBuilder. All rights reserved.</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">Quick links</p>
          <div className="mt-4 grid gap-2">
            <a href="/#features" className="text-sm text-white/90 hover:text-white">
              Features
            </a>
            <a href="/#how-it-works" className="text-sm text-white/90 hover:text-white">
              How it works
            </a>
            <a href="/#faq" className="text-sm text-white/90 hover:text-white">
              FAQ
            </a>
            <Link to="/terms" className="text-sm text-white/90 hover:text-white">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-white/90 hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">Account</p>
          <div className="mt-4 grid gap-2">
            <a href="/login" className="text-sm text-white/90 hover:text-white">
              Sign In
            </a>
            <a href="/signup" className="text-sm text-white/90 hover:text-white">
              Register
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
