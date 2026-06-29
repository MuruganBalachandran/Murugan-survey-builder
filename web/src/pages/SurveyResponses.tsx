// region imports
import { AppLayout } from "@/components/Layout/AppLayout";
import { Loading } from "@/components/common/Loading";
import { QuestionCharts } from "@/components/surveyResponses/QuestionCharts";
import { ResponsesList } from "@/components/surveyResponses/ResponsesList";
import { ResponsesOverTimeChart } from "@/components/surveyResponses/ResponsesOverTimeChart";
import { ResponsesSummary } from "@/components/surveyResponses/ResponsesSummary";
import { ChevronLeftIcon, ChevronRightIcon } from "@/utils/icons";
import { useSurveyResponsesPage } from "@/hooks/useSurveyResponsesPage";
import { SurveyResponsesTabs } from "@/components/surveyResponses/SurveyResponsesTabs";
// endregion

/**
 * SurveyResponsesPage - Displays response analytics and data for a specific survey
 * Shows summary stats, response charts, and individual responses with CSV export
 */
// region component
export const SurveyResponsesPage = () => {
  const {
    navigate,
    currentSurvey,
    isLoading,
    responses,
    loadingResponses,
    exporting,
    currentPage,
    totalResponses,
    activeTab,
    setActiveTab,
    breakdownPage,
    setBreakdownPage,
    responsesPageSize,
    breakdownPageSize,
    responsesTotalPages,
    breakdownTotalPages,
    responsesPageItems,
    breakdownPageItems,
    paginatedQuestions,
    responseRate,
    weekDays,
    loadResponses,
    handleExportCSV,
  } = useSurveyResponsesPage();

  // region render
  return (
    <AppLayout>
      <div className="app-page">
        <div className="app-hero">
          <div className="flex items-start justify-between">
            <div>
              <button
                onClick={() => navigate({ to: "/surveys" })}
                className="mb-4 text-sm font-medium text-violet-100 hover:text-white"
              >
                ← Back to Surveys
              </button>
              {currentSurvey && (
                <>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {currentSurvey.title}
                  </h2>
                  {currentSurvey.description && (
                    <p className="mt-1 text-sm text-violet-100">
                      {currentSurvey.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {isLoading && <Loading text="Loading survey..." />}

        {currentSurvey && !isLoading && (
          <div className="space-y-6">
            {/* Tab navigation */}
            <SurveyResponsesTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <ResponsesSummary
                  totalResponses={totalResponses}
                  totalQuestions={currentSurvey.questions.length}
                  responseRate={responseRate}
                />

                <ResponsesOverTimeChart
                  days={weekDays}
                  subtitle="Submission activity for this survey this week"
                  badge={`${totalResponses} total`}
                />
              </div>
            )}

            {/* Question Breakdown Tab */}
            {activeTab === "breakdown" && (
              <div className="space-y-6">
                <QuestionCharts
                  questions={paginatedQuestions}
                  responses={responses}
                />

                {breakdownTotalPages > 1 && (
                  <div className="flex flex-col gap-4 border-t border-gray-200 pt-5 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {(breakdownPage - 1) * breakdownPageSize + 1}-
                      {Math.min(
                        breakdownPage * breakdownPageSize,
                        currentSurvey.questions.length,
                      )}{" "}
                      of {currentSurvey.questions.length} questions
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setBreakdownPage(Math.max(1, breakdownPage - 1))
                        }
                        disabled={breakdownPage === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        <ChevronLeftIcon />
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        {breakdownPageItems.map((item, index) =>
                          item === "ellipsis" ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="inline-flex h-10 min-w-10 items-center justify-center px-3 text-sm font-semibold text-gray-400"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setBreakdownPage(item)}
                              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors ${
                                item === breakdownPage
                                  ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                              aria-current={
                                item === breakdownPage ? "page" : undefined
                              }
                            >
                              {item}
                            </button>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setBreakdownPage(
                            Math.min(breakdownTotalPages, breakdownPage + 1),
                          )
                        }
                        disabled={breakdownPage === breakdownTotalPages}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Next page"
                      >
                        <ChevronRightIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Responses Tab */}
            {activeTab === "responses" && (
              <div className="space-y-6">
                {loadingResponses && <Loading text="Loading responses..." />}

                {!loadingResponses && (
                  <>
                    <ResponsesList
                      responses={responses}
                      questions={currentSurvey.questions}
                      isEmpty={responses.length === 0}
                      totalCount={totalResponses}
                      onExportCSV={handleExportCSV}
                      isExporting={exporting}
                    />

                    {totalResponses > responsesPageSize && (
                      <div className="flex flex-col gap-4 border-t border-gray-200 pt-5 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-gray-600">
                          Showing {(currentPage - 1) * responsesPageSize + 1}-
                          {Math.min(
                            currentPage * responsesPageSize,
                            totalResponses,
                          )}{" "}
                          of {totalResponses}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              loadResponses(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1 || loadingResponses}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Previous page"
                          >
                            <ChevronLeftIcon />
                          </button>

                          <div className="flex flex-wrap items-center gap-2">
                            {responsesPageItems.map((item, index) =>
                              item === "ellipsis" ? (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="inline-flex h-10 min-w-10 items-center justify-center px-3 text-sm font-semibold text-gray-400"
                                >
                                  ...
                                </span>
                              ) : (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => loadResponses(item)}
                                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors ${
                                    item === currentPage
                                      ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                  }`}
                                  aria-current={
                                    item === currentPage ? "page" : undefined
                                  }
                                  disabled={loadingResponses}
                                >
                                  {item}
                                </button>
                              ),
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              loadResponses(
                                Math.min(responsesTotalPages, currentPage + 1)
                              )
                            }
                            disabled={
                              currentPage === responsesTotalPages ||
                              loadingResponses
                            }
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Next page"
                          >
                            <ChevronRightIcon />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
  // endregion
};
