import { useMemo, useState } from 'react'
import { FAQ_SECTIONS, FAQ_TAB_ORDER } from '@/utils/constants'

const faqSections = FAQ_SECTIONS
const tabOrder = FAQ_TAB_ORDER

export const FaqSection = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabOrder)[number]>('General')

  const activeSection = useMemo(
    () => faqSections.find((section) => section.title === activeTab) || faqSections[0],
    [activeTab],
  )

  return (
    <section id="faq" className="py-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="app-eyebrow">FAQ</p>
        <h2 className="app-title mt-2">Questions people ask before creating a survey</h2>
      </div>

      <div className="mx-auto mt-8 max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
          {tabOrder.map((tab) => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-violet-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-gray-900">{activeSection?.title}</h3>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
              {activeSection?.items.length} questions
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {activeSection?.items.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <summary className="cursor-pointer list-none text-base font-semibold text-gray-900">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}
                    <span className="text-violet-600 transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

