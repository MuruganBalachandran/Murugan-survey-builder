// region imports
import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CustomModal } from "@/components/common/CustomModal";
import { AppLayout } from "@/components/Layout/AppLayout";
import { CreateSurveyDrawer } from "@/components/surveys/drawers/CreateSurveyDrawer";
import { EditSurveyDrawer } from "@/components/surveys/drawers/EditSurveyDrawer";
import { SurveysGrid } from "@/components/surveys/grid/SurveysGrid";
import { ShareSurveyModal } from "@/components/surveys/share/ShareSurveyModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useModal } from "@/hooks/useModal";
import { toast } from "@/lib/toast";
import type { Survey } from "@/services/api/surveys";
import {
  addQuestionToSurvey,
  deleteQuestionFromSurvey,
  reorderSurveyQuestions,
  updateQuestionDetails,
} from "@/store/slices/questionSlice";
import {
  clearCurrentSurvey,
  clearError,
  createNewSurvey,
  deleteSurveyById,
  fetchSurveyById,
  fetchUserSurveys,
  updateSurveyDetails,
} from "@/store/slices/surveySlice";
import type { QuestionFormState, SurveyRecord } from "@/types";
import type { Question } from "@/types/survey";
import {
  buildPaginationItems,
  getSurveyUrl,
  normalizeQuestionType,
  readFileAsDataUrl,
} from "@/utils/common/survey";
import {
  DEFAULT_QUESTION_FORM,
  DEFAULT_SURVEY_FORM as defaultSurveyForm,
  SURVEY_PAGE_SIZE,
  SURVEY_TEMPLATES,
} from "@/utils/constants";
import { CalendarIcon, FilterIcon, SortIcon } from "@/utils/icons";
import {
  isMultipleChoiceQuestion,
  isValidQuestionOptions,
  isValidQuestionTitle,
  isValidSurveyDescription,
  isValidSurveyTitle,
} from "@/utils/validations";

// endregion

const defaultQuestionForm: QuestionFormState = DEFAULT_QUESTION_FORM;

// region component
export const SurveysPage = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const modal = useModal();

  const surveys = useAppSelector(
    (state) => state.survey.surveys,
  ) as SurveyRecord[];
  const surveysTotal = useAppSelector((state) => state.survey.surveysTotal);
  const currentSurvey = useAppSelector(
    (state) => state.survey.currentSurvey,
  ) as SurveyRecord | null;
  const isLoading = useAppSelector((state) => state.survey.isLoading);
  const error = useAppSelector((state) => state.survey.error);

  // region state

  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [createSurveyId, setCreateSurveyId] = useState<string | null>(null);
  const [pendingTemplateQuestions, setPendingTemplateQuestions] = useState<
    Omit<QuestionFormState, "id">[]
  >([]);
  const [isQuestionComposerOpen, setIsQuestionComposerOpen] = useState(false);
  const [questionMode, setQuestionMode] = useState<"create" | "edit">("create");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [isSavingSurvey, setIsSavingSurvey] = useState(false);
  const [isPublishingSurvey, setIsPublishingSurvey] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [logoFileName, setLogoFileName] = useState("");
  const [surveyForm, setSurveyForm] = useState(defaultSurveyForm());
  const [surveyErrors, setSurveyErrors] = useState<Record<string, string>>({});
  const [questionForm, setQuestionForm] = useState(defaultQuestionForm);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>(
    {},
  );
  const [surveySearch, setSurveySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [surveyDateRange, setSurveyDateRange] = useState("all");
  const [surveyStatus, setSurveyStatus] = useState("all");
  const [surveySortBy, setSurveySortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(
    null,
  );
  const [surveyToShare, setSurveyToShare] = useState<Pick<
    Survey,
    "title" | "slug"
  > | null>(null);

  const pageSize = SURVEY_PAGE_SIZE;

  // endregion

  // region derived data

  // resolve the survey currently open in either drawer
  const activeSurvey = useMemo(() => {
    const surveyId = selectedSurveyId ?? (isCreateOpen ? createSurveyId : null);
    if (!surveyId) return null;
    if (currentSurvey?.id === surveyId) return currentSurvey;
    return surveys.find((survey) => survey.id === surveyId) ?? null;
  }, [currentSurvey, createSurveyId, isCreateOpen, selectedSurveyId, surveys]);

  const activeQuestions = activeSurvey?.questions ?? [];

  // true when the edit-drawer form differs from the persisted survey
  const hasEditChanges = useMemo(() => {
    if (!activeSurvey) return false;
    return (
      activeSurvey.title !== surveyForm.title.trim() ||
      (activeSurvey.description || "") !== surveyForm.description.trim() ||
      (activeSurvey.primaryColor || "").toLowerCase() !==
        surveyForm.primaryColor.toLowerCase() ||
      (activeSurvey.logoUrl || "") !== surveyForm.logoUrl.trim() ||
      (activeSurvey.endsAt || "") !== (surveyForm.endsAt || "")
    );
  }, [activeSurvey, surveyForm]);

  const totalPages = Math.max(1, Math.ceil(surveysTotal / pageSize));

  // surveys for the current page come directly from the API
  const paginatedSurveys = surveys;

  const pageItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  // endregion

  // region effects

  // debounce search input — wait 400 ms after the user stops typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setDebouncedSearch(surveySearch),
      400,
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [surveySearch]);

  // reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, surveyStatus, surveyDateRange, surveySortBy]);

  // fetch surveys from the API whenever filters, sort, or page change
  useEffect(() => {
    dispatch(
      fetchUserSurveys({
        page: currentPage,
        pageSize,
        search: debouncedSearch,
        status: surveyStatus,
        dateRange: surveyDateRange,
        sort: surveySortBy,
      }),
    );
  }, [
    dispatch,
    currentPage,
    pageSize,
    debouncedSearch,
    surveyStatus,
    surveyDateRange,
    surveySortBy,
  ]);

  // load full survey detail whenever the active drawer changes
  useEffect(() => {
    const surveyIdToLoad =
      selectedSurveyId ?? (isCreateOpen ? createSurveyId : null);
    if (surveyIdToLoad) {
      dispatch(fetchSurveyById(surveyIdToLoad));
    } else {
      dispatch(clearCurrentSurvey());
    }
  }, [createSurveyId, dispatch, isCreateOpen, selectedSurveyId]);

  // sync form fields when active survey changes — only in edit mode to avoid overwriting create defaults
  useEffect(() => {
    if (!currentSurvey || !selectedSurveyId) return;
    setSurveyForm({
      title: currentSurvey.title,
      description: currentSurvey.description || "",
      primaryColor: currentSurvey.primaryColor || "#6366F1",
      logoUrl: currentSurvey.logoUrl || "",
      endsAt: currentSurvey.endsAt || "",
    });
  }, [currentSurvey?.id, currentSurvey?.endsAt, selectedSurveyId]);

  // show toast and clear redux error whenever one is set
  useEffect(() => {
    if (error) {
      const errorMsg = Object.values(error)[0] || "An error occurred";
      toast.error(errorMsg);
      dispatch(clearError());
    }
  }, [dispatch, error]);

  // endregion

  // region helpers

  const refreshData = async (surveyId?: string) => {
    await dispatch(
      fetchUserSurveys({
        page: currentPage,
        pageSize,
        search: debouncedSearch,
        status: surveyStatus,
        dateRange: surveyDateRange,
        sort: surveySortBy,
      }),
    );
    if (surveyId) await dispatch(fetchSurveyById(surveyId));
  };

  // single field updater used by both drawers
  const handleSurveyFormChange = (field: string, value: string) => {
    setSurveyForm((current) => ({ ...current, [field]: value }));
  };

  // endregion

  // region drawer controls

  const closeSurveyDrawer = () => {
    setSelectedSurveyId(null);
    setIsQuestionComposerOpen(false);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setQuestionErrors({});
  };

  const closeCreateWizard = () => {
    setIsCreateOpen(false);
    setCreateStep(0);
    setSelectedSurveyId(null);
    setCreateSurveyId(null);
    setIsQuestionComposerOpen(false);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setQuestionErrors({});
    setLogoFileName("");
    setSurveyForm(defaultSurveyForm());
    setSurveyErrors({});
    setPendingTemplateQuestions([]);
  };

  const openCreateDrawer = () => {
    setSurveyForm(defaultSurveyForm());
    setSurveyErrors({});
    setCreateStep(0);
    setLogoFileName("");
    setSelectedSurveyId(null);
    setCreateSurveyId(null);
    setIsQuestionComposerOpen(false);
    setPendingTemplateQuestions([]);
    setIsCreateOpen(true);
  };

  const openSurveyDrawer = (surveyId: string) => {
    setSelectedSurveyId(surveyId);
    setIsCreateOpen(false);
  };

  const openAddQuestionDrawer = () => {
    setQuestionMode("create");
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setQuestionErrors({});
    setIsQuestionComposerOpen(true);
  };

  // populate question form from existing question data before opening
  const openEditQuestionDrawer = (question: Question) => {
    setQuestionMode("edit");
    setEditingQuestionId(question.id);
    setQuestionErrors({});
    setQuestionForm({
      type:
        question.uiType === "textarea"
          ? "long_text"
          : question.uiType === "checkbox_group"
            ? "checkbox_group"
            : question.uiType === "select"
              ? "dropdown"
              : question.uiType === "toggle"
                ? "yes_no"
                : question.type === "multiple_choice" ||
                    question.type === "rating"
                  ? question.type
                  : "short_text",
      uiType:
        question.uiType || (question.type === "rating" ? "buttons" : "input"),
      title: question.title,
      description: question.description || "",
      required: question.required,
      options:
        (question.type === "multiple_choice" ||
          question.uiType === "checkbox_group" ||
          question.uiType === "select") &&
        question.options &&
        question.options.length > 0
          ? question.options.map((option) => option)
          : ["", ""],
    });
    setIsQuestionComposerOpen(true);
  };

  const closeComposer = () => {
    setIsQuestionComposerOpen(false);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setQuestionErrors({});
  };

  // endregion

  // region validation

  const validateSurveyForm = () => {
    const nextErrors: Record<string, string> = {};
    const title = surveyForm.title.trim();
    const description = surveyForm.description.trim();

    if (!title) {
      nextErrors.title = "Survey title is required";
    } else if (!isValidSurveyTitle(title)) {
      nextErrors.title = "Survey title must be 3-20 characters";
    }

    if (description && !isValidSurveyDescription(description)) {
      nextErrors.description = "Description must be 5-100 characters";
    }

    setSurveyErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateQuestionForm = () => {
    const nextErrors: Record<string, string> = {};
    const cleanedTitle = questionForm.title.trim();

    if (!cleanedTitle) {
      nextErrors.title = "Question title is required";
    } else if (!isValidQuestionTitle(cleanedTitle)) {
      nextErrors.title = "Question title must be 3-100 characters";
    }

    if (isMultipleChoiceQuestion(questionForm.type)) {
      if (!isValidQuestionOptions(questionForm.options)) {
        const cleaned = questionForm.options
          .map((opt) => opt.trim())
          .filter(Boolean);
        nextErrors.options =
          cleaned.length < 2
            ? "Add at least 2 options"
            : "Options must be unique";
      }
    }

    setQuestionErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // endregion

  // region handlers

  // convert uploaded file to a data URL and store it in the form
  const handleLogoUpload = async (file: File | null) => {
    if (!file) {
      setLogoFileName("");
      setSurveyForm((current) => ({ ...current, logoUrl: "" }));
      return;
    }
    const nextLogoUrl = await readFileAsDataUrl(file);
    setLogoFileName(file.name);
    setSurveyForm((current) => ({ ...current, logoUrl: nextLogoUrl }));
  };

  // pre-fill form from a template and advance to step 1
  const handleSelectTemplate = (templateId: string) => {
    const template = SURVEY_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setSurveyForm((current) => ({
      ...current,
      title: template.label,
      description: template.description,
      primaryColor: template.primaryColor,
    }));
    setPendingTemplateQuestions(template.questions);
    setCreateStep(1);
  };

  // start blank — just advance to step 1 with default form
  const handleBlankSurvey = () => {
    setPendingTemplateQuestions([]);
    setCreateStep(1);
  };

  // advance the create wizard, creating or updating the survey at step 2
  const handleWizardNext = async () => {
    if (createStep === 1) {
      if (!validateSurveyForm()) return;
      setCreateStep(2);
      return;
    }

    if (createStep === 2) {
      setIsSavingSurvey(true);
      try {
        let surveyIdToRefresh: string | undefined =
          selectedSurveyId ?? undefined;

        if (selectedSurveyId) {
          // editing an existing survey — just update details
          const result = await dispatch(
            updateSurveyDetails({
              id: selectedSurveyId,
              title: surveyForm.title.trim(),
              description: surveyForm.description.trim() || undefined,
              primaryColor: surveyForm.primaryColor,
              logoUrl: surveyForm.logoUrl.trim() || undefined,
              endsAt: surveyForm.endsAt || undefined,
            }),
          );
          if (result.type !== updateSurveyDetails.fulfilled.type)
            throw new Error("Failed to update survey");
        } else {
          // new survey — create with all details in one call
          const createAction = await dispatch(
            createNewSurvey({
              title: surveyForm.title.trim(),
              description: surveyForm.description.trim() || undefined,
              endsAt: surveyForm.endsAt || undefined,
            }),
          );
          const createdSurveyId = (
            createAction.payload as { id?: string } | undefined
          )?.id;
          if (!createdSurveyId) throw new Error("Failed to create survey");

          const updateAction = await dispatch(
            updateSurveyDetails({
              id: createdSurveyId,
              title: surveyForm.title.trim(),
              description: surveyForm.description.trim() || undefined,
              primaryColor: surveyForm.primaryColor,
              logoUrl: surveyForm.logoUrl.trim() || undefined,
            }),
          );
          if (updateAction.type !== updateSurveyDetails.fulfilled.type)
            throw new Error("Failed to save branding");

          surveyIdToRefresh = createdSurveyId;
          setCreateSurveyId(createdSurveyId);

          // seed template questions if user picked a template
          if (pendingTemplateQuestions.length > 0) {
            for (const q of pendingTemplateQuestions) {
              const mapped = normalizeQuestionType(q.type);
              await dispatch(
                addQuestionToSurvey({
                  surveyId: createdSurveyId,
                  type: mapped.type,
                  uiType: mapped.uiType,
                  title: q.title,
                  description: q.description || undefined,
                  required: q.required,
                  options:
                    q.type === "multiple_choice" ||
                    q.type === "checkbox_group" ||
                    q.type === "dropdown"
                      ? q.options.filter(Boolean)
                      : undefined,
                }),
              );
            }
            setPendingTemplateQuestions([]);
          }
        }

        await refreshData(surveyIdToRefresh);
        setCreateSurveyId(surveyIdToRefresh ?? null);
        setCreateStep(3);
      } catch {
        toast.error("Failed to save survey");
      } finally {
        setIsSavingSurvey(false);
      }
      return;
    }

    if (createStep === 3) {
      if (activeQuestions.length === 0) {
        toast.error("Add at least one question before continuing");
        return;
      }
      setCreateStep(4);
    }
  };

  const handleWizardBack = () => {
    setCreateStep((current) => Math.max(0, current - 1) as 0 | 1 | 2 | 3);
  };

  // save edits to an existing survey from the edit drawer
  const handleSaveSurvey = async () => {
    if (!activeSurvey || !validateSurveyForm()) return;
    if (!hasEditChanges) {
      toast.info("No changes detected");
      return;
    }

    setIsSavingSurvey(true);
    try {
      const result = await dispatch(
        updateSurveyDetails({
          id: activeSurvey.id,
          title: surveyForm.title.trim(),
          description: surveyForm.description.trim() || undefined,
          primaryColor: surveyForm.primaryColor,
          logoUrl: surveyForm.logoUrl.trim() || undefined,
          endsAt: surveyForm.endsAt || undefined,
        }),
      );
      if (result.type === updateSurveyDetails.fulfilled.type) {
        await refreshData(activeSurvey.id);
        toast.success("Survey saved");
        closeSurveyDrawer();
      } else {
        toast.error("Failed to save survey");
      }
    } finally {
      setIsSavingSurvey(false);
    }
  };

  // prompt for confirmation before deleting a survey
  const handleSurveyDelete = (survey: SurveyRecord) => {
    modal.openModal({
      title: "Delete Survey",
      description: `Delete "${survey.title}"? This also removes its questions and responses.`,
      variant: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        await dispatch(deleteSurveyById(survey.id));
        if (selectedSurveyId === survey.id) closeSurveyDrawer();
        await refreshData();
        toast.success("Survey deleted");
      },
    });
  };

  // prompt for confirmation before deleting a question
  const handleQuestionDelete = (question: Question) => {
    if (!activeSurvey) return;
    modal.openModal({
      title: "Delete Question",
      description: `Delete "${question.title}"?`,
      variant: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        const result = await dispatch(
          deleteQuestionFromSurvey({
            surveyId: activeSurvey.id,
            questionId: question.id,
          }),
        );
        if (result.type === deleteQuestionFromSurvey.fulfilled.type) {
          await refreshData(activeSurvey.id);
          toast.success("Question deleted");
        } else {
          toast.error("Failed to delete question");
        }
      },
    });
  };

  const handleQuestionDragStart = (questionId: string) => {
    setDraggedQuestionId(questionId);
  };

  const handleQuestionDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // reorder questions after a drag-and-drop operation
  const handleQuestionDrop = async (targetQuestionId: string) => {
    if (
      !activeSurvey ||
      !draggedQuestionId ||
      draggedQuestionId === targetQuestionId
    ) {
      setDraggedQuestionId(null);
      return;
    }

    const questionIds = activeQuestions.map((question) => question.id);
    const draggedIndex = questionIds.findIndex(
      (id) => id === draggedQuestionId,
    );
    const targetIndex = questionIds.findIndex((id) => id === targetQuestionId);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedQuestionId(null);
      return;
    }

    const [movedQuestionId] = questionIds.splice(draggedIndex, 1);
    if (!movedQuestionId) {
      setDraggedQuestionId(null);
      return;
    }

    questionIds.splice(targetIndex, 0, movedQuestionId);

    const result = await dispatch(
      reorderSurveyQuestions({ surveyId: activeSurvey.id, questionIds }),
    );
    if (result.type === reorderSurveyQuestions.fulfilled.type) {
      await refreshData(activeSurvey.id);
      toast.success("Questions reordered");
    } else {
      toast.error("Failed to reorder questions");
    }

    setDraggedQuestionId(null);
  };

  const handleQuestionDragEnd = () => {
    setDraggedQuestionId(null);
  };

  // create or update a question and close the composer on success
  const handleSaveQuestion = async () => {
    if (!activeSurvey || !validateQuestionForm()) return;

    const cleanedOptions = questionForm.options
      .map((option) => option.trim())
      .filter(Boolean);
    const mappedQuestion = normalizeQuestionType(questionForm.type);
    const payload = {
      surveyId: activeSurvey.id,
      type: mappedQuestion.type,
      uiType: mappedQuestion.uiType,
      title: questionForm.title.trim(),
      description: questionForm.description.trim() || undefined,
      required: questionForm.required,
      options:
        questionForm.type === "multiple_choice" ||
        questionForm.type === "checkbox_group" ||
        questionForm.type === "dropdown"
          ? cleanedOptions
          : undefined,
    };

    setIsSavingQuestion(true);
    try {
      const result =
        questionMode === "edit" && editingQuestionId
          ? await dispatch(
              updateQuestionDetails({
                ...payload,
                questionId: editingQuestionId,
              }),
            )
          : await dispatch(addQuestionToSurvey(payload));

      if (
        result.type === updateQuestionDetails.fulfilled.type ||
        result.type === addQuestionToSurvey.fulfilled.type
      ) {
        await refreshData(activeSurvey.id);
        toast.success(
          questionMode === "edit" ? "Question updated" : "Question added",
        );
        // close the full drawer when editing from the edit-survey panel
        if (questionMode === "edit" && selectedSurveyId && !isCreateOpen) {
          closeSurveyDrawer();
        } else {
          closeComposer();
        }
      } else {
        toast.error("Failed to save question");
      }
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleAutoExpire = async (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey || survey.status !== "published") return;
    const result = await dispatch(
      updateSurveyDetails({ id: surveyId, status: "closed" }),
    );
    if (result.type === updateSurveyDetails.fulfilled.type) {
      await refreshData(surveyId);
    }
  };

  const handleManualClose = async (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId) ?? activeSurvey;
    if (!survey || survey.status !== "published") return;
    modal.openModal({
      title: "Close Survey",
      description: `Close "${survey.title}"? Responses will no longer be accepted.`,
      variant: "warning",
      confirmText: "Close survey",
      cancelText: "Cancel",
      onConfirm: async () => {
        const result = await dispatch(
          updateSurveyDetails({ id: survey.id, status: "closed" }),
        );
        if (result.type === updateSurveyDetails.fulfilled.type) {
          await refreshData(survey.id);
          toast.success("Survey closed");
          if (isCreateOpen) closeCreateWizard();
          else closeSurveyDrawer();
        } else {
          toast.error("Failed to close survey");
        }
      },
    });
  };

  // flip survey status to published and close the active drawer
  const handlePublishSurvey = async () => {
    if (!activeSurvey || activeSurvey.status === "published") return;
    if (activeQuestions.length === 0) {
      toast.error("Add at least one question before publishing");
      return;
    }

    setIsPublishingSurvey(true);
    try {
      const result = await dispatch(
        updateSurveyDetails({
          id: activeSurvey.id,
          status: "published",
          publishedAt: activeSurvey.publishedAt || new Date().toISOString(),
          endsAt: surveyForm.endsAt || undefined,
        }),
      );
      if (result.type === updateSurveyDetails.fulfilled.type) {
        await refreshData(activeSurvey.id);
        toast.success("Survey published");
        if (isCreateOpen) {
          closeCreateWizard();
        } else {
          closeSurveyDrawer();
        }
      } else {
        toast.error("Failed to publish survey");
      }
    } finally {
      setIsPublishingSurvey(false);
    }
  };

  // guard against copying a link for an unpublished survey
  const handleCopySurveyLink = async (slug: string) => {
    const survey = surveys.find((item) => item.slug === slug);
    if (!survey || survey.status !== "published") {
      toast.error("Publish the survey before sharing it");
      return;
    }
    try {
      await navigator.clipboard.writeText(getSurveyUrl(slug));
      toast.success("Public link copied");
    } catch {
      toast.error("Unable to copy the public link");
    }
  };

  // open the share modal only for published surveys
  const handleOpenShareModal = (slug: string) => {
    const survey = surveys.find((item) => item.slug === slug);
    if (!survey) return;
    if (survey.status !== "published") {
      toast.error("Publish the survey before sharing it");
      return;
    }
    setSurveyToShare({ title: survey.title, slug: survey.slug });
  };

  const handlePreviewSurvey = (slug: string) => {
    window.open(getSurveyUrl(slug), "_blank", "noopener,noreferrer");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // endregion

  // render child routes (e.g. /surveys/:id/responses) instead of the grid
  if (
    location.pathname !== "/surveys" &&
    location.pathname.startsWith("/surveys/")
  ) {
    return <Outlet />;
  }

  // region render
  return (
    <AppLayout>
      <div className="app-page">
        <div className="app-hero flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-100">
              Survey workspace
            </p>
            <p className="max-w-none text-violet-100">
              Create branded surveys, add questions from a drawer, reorder them,
              and share public links without leaving the page.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="secondary"
              onClick={openCreateDrawer}
              className="bg-white !text-indigo-600 !border-none"
            >
              Create survey
            </Button>
          </div>
        </div>

        <section className="app-panel w-full">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <h2 className="text-xl font-bold text-gray-900">Your surveys</h2>

            {/* filter + sort controls */}
            <div className="grid w-full gap-3 lg:max-w-5xl lg:grid-cols-[minmax(0,1.5fr)_150px_150px_150px]">
              <Input
                value={surveySearch}
                onChange={(event) => setSurveySearch(event.target.value)}
                placeholder="Search surveys"
              />

              <Select
                value={surveyDateRange}
                onChange={(event) => setSurveyDateRange(event.target.value)}
                placeholder="Date range"
                icon={<CalendarIcon />}
                options={[
                  { value: "all", label: "All time" },
                  { value: "7d", label: "Last 7 days" },
                  { value: "30d", label: "Last 30 days" },
                ]}
              />

              <Select
                value={surveyStatus}
                onChange={(event) => setSurveyStatus(event.target.value)}
                placeholder="Status"
                icon={<FilterIcon />}
                options={[
                  { value: "all", label: "All status" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                ]}
              />

              <Select
                value={surveySortBy}
                onChange={(event) => setSurveySortBy(event.target.value)}
                placeholder="Sort by"
                icon={<SortIcon />}
                options={[
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                  { value: "title", label: "Title A to Z" },
                  { value: "responses", label: "Most responses" },
                ]}
              />
            </div>
          </div>

          {isLoading && surveys.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Loading surveys...
            </div>
          ) : paginatedSurveys.length > 0 ? (
            <>
              <div className="mt-6">
                <SurveysGrid
                  surveys={paginatedSurveys}
                  onEdit={openSurveyDrawer}
                  onPreview={handlePreviewSurvey}
                  onShare={handleOpenShareModal}
                  onDelete={(id) => {
                    const survey = paginatedSurveys.find(
                      (item) => item.id === id,
                    );
                    if (survey) handleSurveyDelete(survey);
                  }}
                  onManualClose={handleManualClose}
                  onAutoExpire={handleAutoExpire}
                />
              </div>

              {/* pagination bar */}
              <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, surveysTotal)} of{" "}
                  {surveysTotal}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {pageItems.map((item, index) =>
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
                          onClick={() => handlePageChange(item)}
                          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors ${
                            item === currentPage
                              ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          aria-current={
                            item === currentPage ? "page" : undefined
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
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : surveysTotal > 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No surveys match your filter.
            </div>
          ) : (
            <div className="mt-6 flex min-h-[calc(100vh-20rem)] items-center justify-center rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <button
                type="button"
                onClick={openCreateDrawer}
                className="mx-auto text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700"
              >
                Create new survey
              </button>
            </div>
          )}
        </section>
      </div>

      <CreateSurveyDrawer
        isOpen={isCreateOpen}
        createStep={createStep}
        activeSurvey={activeSurvey}
        activeQuestions={activeQuestions}
        surveyForm={surveyForm}
        surveyErrors={surveyErrors}
        questionForm={questionForm}
        questionErrors={questionErrors}
        questionMode={questionMode}
        isQuestionComposerOpen={isQuestionComposerOpen}
        isSavingSurvey={isSavingSurvey}
        isPublishingSurvey={isPublishingSurvey}
        isSavingQuestion={isSavingQuestion}
        logoFileName={logoFileName}
        draggedQuestionId={draggedQuestionId}
        onClose={closeCreateWizard}
        onWizardNext={handleWizardNext}
        onWizardBack={handleWizardBack}
        onWizardFinish={closeCreateWizard}
        onPublish={handlePublishSurvey}
        onSurveyFormChange={handleSurveyFormChange}
        onSurveyErrorsChange={setSurveyErrors}
        onLogoUpload={handleLogoUpload}
        onAddQuestion={openAddQuestionDrawer}
        onEditQuestion={openEditQuestionDrawer}
        onDeleteQuestion={handleQuestionDelete}
        onQuestionDragStart={handleQuestionDragStart}
        onQuestionDragOver={handleQuestionDragOver}
        onQuestionDrop={handleQuestionDrop}
        onQuestionDragEnd={handleQuestionDragEnd}
        onQuestionFormChange={setQuestionForm}
        onSaveQuestion={handleSaveQuestion}
        onCloseComposer={closeComposer}
        onCopySurveyLink={handleCopySurveyLink}
        onPreviewSurvey={handlePreviewSurvey}
        endsAt={surveyForm.endsAt}
        onEndsAtChange={(value) => handleSurveyFormChange("endsAt", value)}
        onManualClose={() => activeSurvey && handleManualClose(activeSurvey.id)}
        onSelectTemplate={handleSelectTemplate}
        onBlankSurvey={handleBlankSurvey}
      />

      <EditSurveyDrawer
        isOpen={selectedSurveyId !== null}
        activeSurvey={activeSurvey}
        activeQuestions={activeQuestions}
        surveyForm={surveyForm}
        questionForm={questionForm}
        questionErrors={questionErrors}
        questionMode={questionMode}
        isQuestionComposerOpen={isQuestionComposerOpen}
        isSavingSurvey={isSavingSurvey}
        isPublishingSurvey={isPublishingSurvey}
        isSavingQuestion={isSavingQuestion}
        logoFileName={logoFileName}
        draggedQuestionId={draggedQuestionId}
        hasEditChanges={hasEditChanges}
        onClose={closeSurveyDrawer}
        onSave={handleSaveSurvey}
        onPublish={handlePublishSurvey}
        onManualClose={() => activeSurvey && handleManualClose(activeSurvey.id)}
        endsAt={surveyForm.endsAt}
        onEndsAtChange={(value) => handleSurveyFormChange("endsAt", value)}
        onSurveyFormChange={handleSurveyFormChange}
        onLogoUpload={handleLogoUpload}
        onAddQuestion={openAddQuestionDrawer}
        onEditQuestion={openEditQuestionDrawer}
        onDeleteQuestion={handleQuestionDelete}
        onQuestionDragStart={handleQuestionDragStart}
        onQuestionDragOver={handleQuestionDragOver}
        onQuestionDrop={handleQuestionDrop}
        onQuestionDragEnd={handleQuestionDragEnd}
        onQuestionFormChange={setQuestionForm}
        onSaveQuestion={handleSaveQuestion}
        onCloseComposer={closeComposer}
      />

      <ShareSurveyModal
        survey={surveyToShare}
        onClose={() => setSurveyToShare(null)}
        onCopy={handleCopySurveyLink}
      />

      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        description={modal.description}
        variant={modal.variant}
        onClose={modal.closeModal}
        onConfirm={modal.handleConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        isLoading={modal.isLoading}
      />
    </AppLayout>
  );
  // endregion
};
// endregion
