// region imports
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { QuestionCharts } from "@/components/surveyResponses/QuestionCharts";
import { ResponsesList } from "@/components/surveyResponses/ResponsesList";
import { ResponsesOverTimeChart } from "@/components/surveyResponses/ResponsesOverTimeChart";
import { ResponsesSummary } from "@/components/surveyResponses/ResponsesSummary";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toast } from "@/lib/toast";
import { fetchSurveyResponses } from "@/store/slices/responseSlice";
import { clearError, fetchSurveyById } from "@/store/slices/surveySlice";
import type { SurveyResponse } from "@/types/survey";
import { ExportIcon } from "@/utils/icons";
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
  // endregion

  // region effects

  // fetch survey metadata and responses on mount
  useEffect(() => {
    dispatch(fetchSurveyById(id));
    loadResponses();
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

  const loadResponses = async () => {
    setLoadingResponses(true);
    try {
      const result = await dispatch(fetchSurveyResponses(id));
      if (result.type === fetchSurveyResponses.fulfilled.type) {
        const payload = result.payload as { responses: SurveyResponse[] };
        setResponses(payload.responses);
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
      // build header row from question titles
      const headers = [
        "Response ID",
        "Submitted At",
        ...currentSurvey.questions.map((q) => q.title),
      ];

      // build one row per response, matching answers to question columns
      const rows = responses.map((response) => {
        const row = [
          response.id,
          new Date(response.submittedAt).toLocaleString(),
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
          row.push(value);
        });

        return row;
      });

      // wrap every cell in quotes to handle commas inside values
      const csvContent = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // trigger browser download via a temporary anchor element
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${currentSurvey.title}-responses.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Responses exported successfully");
    } catch {
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">
                Analytics
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Response analytics
              </h1>
              {currentSurvey && (
                <p className="mt-2 text-violet-100">{currentSurvey.title}</p>
              )}
            </div>
            <Button
              onClick={handleExportCSV}
              isLoading={exporting}
              variant="secondary"
              icon={<ExportIcon />}
              disabled={responses.length === 0}
              className="bg-white !text-indigo-600 !border-none"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* loading spinner shown while either survey or responses are fetching */}
        {(isLoading || loadingResponses) && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading responses...</p>
          </div>
        )}

        {currentSurvey && !isLoading && (
          <div className="space-y-6">
            <ResponsesSummary
              totalResponses={responses.length}
              totalQuestions={currentSurvey.questions.length}
              responseRate={responseRate}
            />

            <ResponsesOverTimeChart
              days={weekDays}
              subtitle="Submission activity for this survey this week"
              badge={`${responses.length} total`}
            />

            <QuestionCharts
              questions={currentSurvey.questions}
              responses={responses}
            />

            <ResponsesList
              responses={responses}
              questions={currentSurvey.questions}
              isEmpty={responses.length === 0}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
  // endregion
};
// endregion
