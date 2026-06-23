// region imports
import { Button } from "@/components/ui/Button";
import type { HomeHeroProps } from "@/types";
import { HomeLockIcon } from "@/utils/icons";
// endregion

// region component
export const HomeHero = ({
  isAuthenticated,
  onPrimaryClick,
  onSignInClick,
}: HomeHeroProps) => (
  <section className="grid min-h-[calc(100vh-12rem)] items-center gap-10 rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-2xl shadow-violet-200/70 lg:grid-cols-[1fr_0.95fr] lg:p-10">
    {/* left column — headline, sub-copy, CTAs, locked-feature pills */}
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-violet-50 backdrop-blur">
        Typeform-style survey builder
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Create beautiful surveys in minutes.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-violet-100">
        Share anywhere. Collect responses instantly. A lightweight survey
        builder for creators, teams, and businesses.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          size="lg"
          onClick={onPrimaryClick}
          className="bg-white !text-indigo-600 !border-none"
        >
          Create Your First Survey
        </Button>
        {/* sign-in button only shown to unauthenticated visitors */}
        {!isAuthenticated && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onSignInClick}
            className="bg-white/10 !text-white border border-white/25"
          >
            Sign In
          </Button>
        )}
      </div>

      {/* locked-feature indicators shown as blurred pills */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm text-violet-100">
        {["Dashboard", "Surveys"].map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 blur-[0.2px]"
          >
            {item} <HomeLockIcon />
          </span>
        ))}
      </div>
    </div>

    {/* right column — interactive builder mockup */}
    <div className="hidden lg:block rounded-3xl border border-white/20 bg-white/95 p-4 text-gray-900 shadow-2xl shadow-indigo-950/20">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        {/* mockup top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Qorvia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              ● Live
            </span>
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
              3 surveys
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          {/* builder panel — brand strip + question list */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-600">
                Brand
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-[10px] font-bold text-white">
                  Q
                </div>
                <div className="flex gap-1.5">
                  {["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9"].map(
                    (c) => (
                      <div
                        key={c}
                        className={`h-5 w-5 rounded-full border-2 ${c === "#6366F1" ? "border-violet-600 ring-2 ring-violet-300" : "border-transparent"}`}
                        style={{ background: c }}
                      />
                    ),
                  )}
                </div>
                <span className="ml-auto rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-mono text-gray-600">
                  #6366F1
                </span>
              </div>
            </div>

            {/* sample questions in the builder */}
            {[
              {
                q: "How satisfied are you?",
                type: "Rating",
                icon: "★",
                color: "text-amber-500 bg-amber-50",
              },
              {
                q: "Which features do you use?",
                type: "Multiple choice",
                icon: "◉",
                color: "text-violet-600 bg-violet-50",
              },
              {
                q: "Any other feedback?",
                type: "Long text",
                icon: "¶",
                color: "text-blue-600 bg-blue-50",
              },
            ].map(({ q, type, icon, color }, i) => (
              <div
                key={q}
                className="flex items-start gap-2.5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
              >
                <div className="mt-0.5 cursor-grab select-none text-gray-300">
                  ⠿
                </div>
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${color}`}
                >
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900">
                    Q{i + 1}. {q}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400">{type}</p>
                </div>
                <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gray-500">
                  req
                </span>
              </div>
            ))}

            <button className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-violet-200 py-2.5 text-xs font-semibold text-violet-500 hover:border-violet-400 hover:text-violet-700">
              <span className="text-base leading-none">+</span> Add question
            </button>
          </div>

          {/* live preview panel */}
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Live preview
            </p>
            <div className="mt-2 overflow-hidden rounded-xl bg-white shadow-sm">
              {/* preview header uses the survey primary color */}
              <div className="bg-violet-600 px-4 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-white">
                  Q
                </div>
                <p className="mt-2 text-sm font-bold text-white">
                  Product Survey
                </p>
                <p className="text-[11px] text-violet-200">
                  Share your experience
                </p>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-700">
                  How satisfied are you?
                </p>
                <div className="mt-2 flex justify-between">
                  {["😞", "😐", "🙂", "😊", "😍"].map((e, i) => (
                    <button
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border text-base ${
                        i === 3
                          ? "border-violet-400 bg-violet-100"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-gray-400">
                  <span>Not at all</span>
                  <span>Very much</span>
                </div>
                <button className="mt-3 w-full rounded-xl bg-violet-600 py-2 text-xs font-bold text-white">
                  Continue →
                </button>
              </div>
            </div>

            {/* copyable share link row */}
            <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-violet-100 bg-white px-2.5 py-2">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
              >
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              <span className="flex-1 truncate text-[10px] text-gray-400">
                qorvia.app/s/product-survey
              </span>
              <span className="rounded-md bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                Copy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
// endregion
