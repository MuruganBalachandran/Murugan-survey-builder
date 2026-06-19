// region imports
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Loading } from "@/components/common/Loading";
import { QuestionCharts } from "@/components/surveyResponses/QuestionCharts";
import { ResponsesList } from "@/components/surveyResponses/ResponsesList";
import { ResponsesOverTimeChart } from "@/components/surveyResponses/ResponsesOverTimeChart";
import { ResponsesSummary } from "@/components/surveyResponses/ResponsesSummary";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toast } from "@/utils/common/toast";
import { fetchSurveyResponses } from "@/store/slices/responseSlice";
import { clearError, fetchSurveyById } from "@/store/slices/surveySlice";
import type { SurveyResponse } from "@/types/survey";
import { ChevronLeftIcon, ChevronRightIcon } from "@/utils/icons";
import { buildPaginationItems } from "@/utils/common/survey";
// endregion

/**
 * SurveyResponsesPage - Displays response analytics and data for a specific survey
 * Shows summary stats, response charts, and individual responses with CSV export
 */
// region component
export const SurveyResponsesPage = () => {
  // region state
  const { id } = useParams({ from: "/surveys/$id/responses" });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentSurvey, isLoading, error } = useAppSelector(
    (state) => state.survey,
  );
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "analytics" | "breakdown" | "responses"
  >("analytics");
  const [breakdownPage, setBreakdownPage] = useState(1);
  const responsesPageSize = 5;
  const breakdownPageSize = 10;
  // endregion

  // region effects

  // fetch survey metadata and responses on mount
  useEffect(() => {
    dispatch(fetchSurveyById(id));
    loadResponses(1);
  }, [dispatch, id]);

  // show toast and clear redux error whenever one is set
  useEffect(() => {
    if (error) {
      const errorMsg = Object.values(error)[0] || "An error occurred";
      toast.error(errorMsg);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // endregion

  // region derived data

  const responsesTotalPages = Math.max(
    1,
    Math.ceil(totalResponses / responsesPageSize),
  );
  const breakdownTotalPages = currentSurvey
    ? Math.max(1, Math.ceil(currentSurvey.questions.length / breakdownPageSize))
    : 1;

  const responsesPageItems = useMemo(
    () => buildPaginationItems(currentPage, responsesTotalPages),
    [currentPage, responsesTotalPages],
  );

  const breakdownPageItems = useMemo(
    () => buildPaginationItems(breakdownPage, breakdownTotalPages),
    [breakdownPage, breakdownTotalPages],
  );

  const paginatedQuestions = useMemo(() => {
    if (!currentSurvey) return [];
    const start = (breakdownPage - 1) * breakdownPageSize;
    const end = start + breakdownPageSize;
    return currentSurvey.questions.slice(start, end);
  }, [currentSurvey, breakdownPage]);

  // percentage of answer fields that were filled across all responses
  const responseRate = useMemo(() => {
    if (!currentSurvey || responses.length === 0) return 0;
    const totalQuestions = currentSurvey.questions.length;
    if (totalQuestions === 0) return 0;

    const answeredFields = responses.reduce(
      (sum, response) =>
        sum +
        response.answers.filter((answer) => {
          if (Array.isArray(answer.value)) return answer.value.length > 0;
          if (typeof answer.value === "string")
            return answer.value.trim().length > 0;
          return true;
        }).length,
      0,
    );

    const totalFields = responses.length * totalQuestions;
    return Math.round((answeredFields / totalFields) * 100);
  }, [currentSurvey, responses]);

  // build per-day counts for the current Mon–Sun week
  const weekDays = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const next = new Date(date);
      next.setDate(date.getDate() + 1);
      const count = responses.filter((r) => {
        const t = new Date(r.submittedAt);
        return t >= date && t < next;
      }).length;
      return {
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        count,
        isToday: date.toDateString() === now.toDateString(),
      };
    });
  }, [responses]);

  // endregion

  // region handlers

  const loadResponses = async (page = 1) => {
    setLoadingResponses(true);
    try {
      const result = await dispatch(
        fetchSurveyResponses({
          surveyId: id,
          page,
          pageSize: responsesPageSize,
        }),
      );
      if (result.type === fetchSurveyResponses.fulfilled.type) {
        const payload = result.payload as {
          responses: SurveyResponse[];
          total: number;
        };
        setResponses(payload.responses);
        setTotalResponses(payload.total);
        setCurrentPage(page);
      } else {
        toast.error("Failed to load responses");
      }
    } catch {
      toast.error("Failed to load responses");
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleExportCSV = async () => {
    if (!currentSurvey) return;

    setExporting(true);
    try {
      const exportDate = new Date();

      // Fetch ALL responses for export with reasonable page size
      const pageSize = 100;
      const allResponsesResult = await dispatch(
        fetchSurveyResponses({ surveyId: id, page: 1, pageSize }),
      );

      let allResponses: SurveyResponse[] = [];
      if (allResponsesResult.type === fetchSurveyResponses.fulfilled.type) {
        const payload = allResponsesResult.payload as {
          responses: SurveyResponse[];
          total: number;
        };
        allResponses = payload.responses;

        // If there are more responses, fetch additional pages
        if (payload.total > pageSize) {
          const totalPages = Math.ceil(payload.total / pageSize);
          for (let page = 2; page <= totalPages; page++) {
            const pageResult = await dispatch(
              fetchSurveyResponses({ surveyId: id, page, pageSize }),
            );
            if (pageResult.type === fetchSurveyResponses.fulfilled.type) {
              const pagePayload = pageResult.payload as {
                responses: SurveyResponse[];
                total: number;
              };
              allResponses = [...allResponses, ...pagePayload.responses];
            }
          }
        }
      }

      if (allResponses.length === 0) {
        toast.error("No responses to export");
        setExporting(false);
        return;
      }

      // Create workbook with simple table format
      const workbook = XLSX.utils.book_new();

      // Create single sheet with all responses in table format
      const tableRows: any[] = [];

      // Add empty row at the start for spacing
      tableRows.push([]);

      // Header row with padding inside cells
      tableRows.push([
        "  Response ID  ",
        "  Submitted At  ",
        ...currentSurvey.questions.map((q) => `  ${q.title}  `),
      ]);

      // Data rows
      allResponses.forEach((response, idx) => {
        const row = [
          `  ${idx + 1}  `,
          `  ${new Date(response.submittedAt).toLocaleString()}  `,
        ];

        currentSurvey.questions.forEach((question) => {
          const answer = response.answers.find(
            (a) => a.questionId === question.id,
          );
          const value = answer
            ? Array.isArray(answer.value)
              ? answer.value.join("; ")
              : String(answer.value)
            : "";
          row.push(`  ${value}  `);
        });

        tableRows.push(row);
      });

      // Add empty row at the end for spacing
      tableRows.push([]);

      const sheet = XLSX.utils.aoa_to_sheet(tableRows);

      // Style header row (bold, blue background, white text) - it's at index 1 now
      for (let i = 0; i < tableRows[1].length; i++) {
        const cellRef = XLSX.utils.encode_col(i) + "2"; // Row 2 because we added empty row at start
        if (!sheet[cellRef]) continue;
        sheet[cellRef].s = {
          fill: { fgColor: { rgb: "4F46E5" } },
          font: { bold: true, color: { rgb: "FFFFFF" }, size: 11 },
          alignment: { horizontal: "left", vertical: "center" },
        };
      }

      // Alternate row colors for better readability (starting from row 3)
      for (let i = 3; i < tableRows.length; i++) {
        for (let j = 0; j < tableRows[1].length; j++) {
          const cellRef = XLSX.utils.encode_col(j) + i;
          if (!sheet[cellRef]) continue;
          sheet[cellRef].s = {
            ...(i % 2 === 1 && {
              fill: { fgColor: { rgb: "F9FAFB" } },
            }),
            alignment: { horizontal: "left", vertical: "center" },
          };
        }
      }

      // Auto-size columns based on content
      const colWidths = tableRows[1].map((header: string) => {
        const len = String(header).length;
        return Math.max(len + 2, 18);
      });
      sheet["!cols"] = colWidths.map((w: number) => ({ wch: w }));
      sheet["!rows"] = [
        { hpx: 15 }, // Empty row at top
        { hpx: 30 }, // Header row
      ];

      XLSX.utils.book_append_sheet(workbook, sheet, "Responses");

      // Generate filename
      const timestamp = exportDate.toISOString().slice(0, 10);
      const safeTitle = currentSurvey.title
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-")
        .toLowerCase();
      const filename = `survey-responses-${safeTitle}-${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      toast.success(`Exported ${allResponses.length} responses to Excel`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export responses");
    } finally {
      setExporting(false);
    }
  };

  // endregion

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
            <div className="border-b border-gray-200">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "analytics"
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab("breakdown")}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "breakdown"
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Question Breakdown
                </button>
                <button
                  onClick={() => setActiveTab("responses")}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "responses"
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Responses
                </button>
              </div>
            </div>

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
                                Math.min(responsesTotalPages, currentPage + 1),
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
// endregion
