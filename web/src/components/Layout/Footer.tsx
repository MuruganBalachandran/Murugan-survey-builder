import { Link } from '@tanstack/react-router'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-violet-200/60 bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 text-white">
      <div className="grid w-full gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Qorvia" className="h-10 object-contain brightness-0 invert" />
          </div>
          <p className="mt-5 text-sm text-violet-100">
            © {currentYear} Qorvia. All rights reserved.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">
            Quick links
          </p>
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">
            Account
          </p>
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
