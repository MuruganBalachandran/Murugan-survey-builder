// region imports
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import * as XLSX from "xlsx";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toast } from "@/utils/common/toast";
import { fetchSurveyResponses } from "@/store/slices/responseSlice";
import { clearError, fetchSurveyById } from "@/store/slices/surveySlice";
import type { SurveyResponse } from "@/types/survey";
import { buildPaginationItems } from "@/utils/common/survey";
// endregion

export const useSurveyResponsesPage = () => {
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

  return {
    id,
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
  };
};
