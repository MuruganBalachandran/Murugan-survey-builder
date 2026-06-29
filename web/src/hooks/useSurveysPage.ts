// region imports
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useModal } from "@/hooks/useModal";
import { toast } from "@/utils/common/toast";
import type { Survey, Question } from "@/types/survey";
import {
  clearCurrentSurvey,
  clearError,
  deleteSurveyById,
  fetchSurveyById,
  fetchUserSurveys,
  updateSurveyDetails,
} from "@/store/slices/surveySlice";
import { deleteQuestionFromSurvey } from "@/store/slices/questionSlice";
import type { QuestionFormState, SurveyRecord } from "@/types";
import {
  buildPaginationItems,
  getSurveyUrl,
} from "@/utils/common/survey";
import {
  DEFAULT_QUESTION_FORM,
  DEFAULT_SURVEY_FORM as defaultSurveyForm,
  SURVEY_PAGE_SIZE,
} from "@/utils/constants";
import { useSurveyWizard } from "@/hooks/useSurveyWizard";
import { useQuestionComposer } from "@/hooks/useQuestionComposer";
// endregion

const defaultQuestionForm: QuestionFormState = DEFAULT_QUESTION_FORM;

export const useSurveysPage = () => {
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
  const [logoFileName, setLogoFileName] = useState("");
  const [surveyForm, setSurveyForm] = useState(defaultSurveyForm());
  const [surveyErrors, setSurveyErrors] = useState<Record<string, string>>({});
  const [pendingTemplateQuestions, setPendingTemplateQuestions] = useState<
    Omit<QuestionFormState, "id">[]
  >([]);
  const [isSavingSurvey, setIsSavingSurvey] = useState(false);
  const [isPublishingSurvey, setIsPublishingSurvey] = useState(false);

  const [isQuestionComposerOpen, setIsQuestionComposerOpen] = useState(false);
  const [questionMode, setQuestionMode] = useState<"create" | "edit">("create");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState(defaultQuestionForm);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});

  const [surveySearch, setSurveySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [surveyDateRange, setSurveyDateRange] = useState("all");
  const [surveyStatus, setSurveyStatus] = useState("all");
  const [surveySortBy, setSurveySortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [surveyToShare, setSurveyToShare] = useState<Pick<
    Survey,
    "title" | "slug"
  > | null>(null);

  const pageSize = SURVEY_PAGE_SIZE;
  // endregion

  // region derived data
  const activeSurvey = useMemo(() => {
    const surveyId = selectedSurveyId ?? (isCreateOpen ? createSurveyId : null);
    if (!surveyId) return null;
    if (currentSurvey?.id === surveyId) return currentSurvey;
    return surveys.find((survey) => survey.id === surveyId) ?? null;
  }, [currentSurvey, createSurveyId, isCreateOpen, selectedSurveyId, surveys]);

  const activeQuestions = activeSurvey?.questions ?? [];

  const hasEditChanges = useMemo(() => {
    if (!activeSurvey) return false;
    return (
      activeSurvey.title !== surveyForm.title.trim() ||
      (activeSurvey.description || "") !== surveyForm.description.trim() ||
      (activeSurvey.primaryColor || "").toLowerCase() !==
        surveyForm.primaryColor.toLowerCase() ||
      (activeSurvey.logoUrl || "") !== surveyForm.logoUrl.trim() ||
      (activeSurvey.endsAt || "") !== (surveyForm.endsAt || "") ||
      String(activeSurvey.maxResponses ?? "") !== surveyForm.maxResponses
    );
  }, [activeSurvey, surveyForm]);

  const totalPages = Math.max(1, Math.ceil(surveysTotal / pageSize));
  const paginatedSurveys = surveys;

  const pageItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );
  // endregion

  // region effects
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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, surveyStatus, surveyDateRange, surveySortBy]);

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

  useEffect(() => {
    const surveyIdToLoad =
      selectedSurveyId ?? (isCreateOpen ? createSurveyId : null);
    if (surveyIdToLoad) {
      dispatch(fetchSurveyById(surveyIdToLoad));
    } else {
      dispatch(clearCurrentSurvey());
    }
  }, [createSurveyId, dispatch, isCreateOpen, selectedSurveyId]);

  useEffect(() => {
    if (!currentSurvey || !selectedSurveyId) return;
    setSurveyForm({
      title: currentSurvey.title,
      description: currentSurvey.description || "",
      primaryColor: currentSurvey.primaryColor || "#6366F1",
      logoUrl: currentSurvey.logoUrl || "",
      endsAt: currentSurvey.endsAt || "",
      maxResponses: String(currentSurvey.maxResponses ?? ""),
    });
  }, [currentSurvey?.id, currentSurvey?.endsAt, selectedSurveyId]);

  useEffect(() => {
    if (error) {
      const errorMsg = Object.values(error)[0] || "An error occurred";
      toast.error(errorMsg);
      dispatch(clearError());
    }
  }, [dispatch, error]);
  // endregion

  // region handlers
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

  const closeSurveyDrawer = () => {
    setSelectedSurveyId(null);
    setIsQuestionComposerOpen(false);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setQuestionErrors({});
  };

  const openSurveyDrawer = (surveyId: string) => {
    setSelectedSurveyId(surveyId);
    setIsCreateOpen(false);
  };

  const wizard = useSurveyWizard({
    dispatch,
    refreshData,
    selectedSurveyId,
    setSelectedSurveyId,
    isCreateOpen,
    setIsCreateOpen,
    createStep,
    setCreateStep,
    createSurveyId,
    setCreateSurveyId,
    logoFileName,
    setLogoFileName,
    surveyForm,
    setSurveyForm,
    surveyErrors,
    setSurveyErrors,
    pendingTemplateQuestions,
    setPendingTemplateQuestions,
    isSavingSurvey,
    setIsSavingSurvey,
    setIsQuestionComposerOpen,
    setEditingQuestionId,
    setQuestionForm,
    setQuestionErrors,
    activeSurvey,
    activeQuestions,
  });

  const composer = useQuestionComposer({
    dispatch,
    refreshData,
    activeSurvey,
    activeQuestions,
    selectedSurveyId,
    closeSurveyDrawer,
    isCreateOpen,
    questionForm,
    setQuestionForm,
    questionErrors,
    setQuestionErrors,
    isQuestionComposerOpen,
    setIsQuestionComposerOpen,
    questionMode,
    setQuestionMode,
    editingQuestionId,
    setEditingQuestionId,
    isSavingQuestion,
    setIsSavingQuestion,
    draggedQuestionId,
    setDraggedQuestionId,
  });

  const handleSaveSurvey = async () => {
    if (!activeSurvey || !wizard.validateSurveyForm()) return;
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
          maxResponses: surveyForm.maxResponses
            ? Number(surveyForm.maxResponses)
            : undefined,
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
          if (isCreateOpen) wizard.closeCreateWizard();
          else closeSurveyDrawer();
        } else {
          toast.error("Failed to close survey");
        }
      },
    });
  };

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
          maxResponses: surveyForm.maxResponses
            ? Number(surveyForm.maxResponses)
            : undefined,
        }),
      );
      if (result.type === updateSurveyDetails.fulfilled.type) {
        await refreshData(activeSurvey.id);
        toast.success("Survey published");
        if (isCreateOpen) {
          wizard.closeCreateWizard();
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

  const handleOpenShareModal = (slug: string) => {
    const survey = surveys.find((item) => item.slug === slug);
    if (!survey) return;
    if (survey.status !== "published") {
      toast.error("Publish the survey before sharing it");
      return;
    }
    setSurveyToShare({ title: survey.title, slug: survey.slug });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // endregion

  return {
    dispatch,
    modal,
    surveys,
    surveysTotal,
    currentSurvey,
    isLoading,
    error,
    selectedSurveyId,
    setSelectedSurveyId,
    isCreateOpen,
    setIsCreateOpen,
    createStep,
    setCreateStep,
    createSurveyId,
    setCreateSurveyId,
    pendingTemplateQuestions,
    setPendingTemplateQuestions,
    isQuestionComposerOpen,
    setIsQuestionComposerOpen,
    questionMode,
    setQuestionMode,
    editingQuestionId,
    setEditingQuestionId,
    isSavingSurvey,
    setIsSavingSurvey,
    isPublishingSurvey,
    setIsPublishingSurvey,
    isSavingQuestion,
    setIsSavingQuestion,
    logoFileName,
    setLogoFileName,
    surveyForm,
    setSurveyForm,
    surveyErrors,
    setSurveyErrors,
    questionForm,
    setQuestionForm,
    questionErrors,
    setQuestionErrors,
    surveySearch,
    setSurveySearch,
    debouncedSearch,
    setDebouncedSearch,
    surveyDateRange,
    setSurveyDateRange,
    surveyStatus,
    setSurveyStatus,
    surveySortBy,
    setSurveySortBy,
    currentPage,
    setCurrentPage,
    draggedQuestionId,
    setDraggedQuestionId,
    surveyToShare,
    setSurveyToShare,
    pageSize,
    activeSurvey,
    activeQuestions,
    hasEditChanges,
    totalPages,
    paginatedSurveys,
    pageItems,
    refreshData,
    handleSurveyFormChange: wizard.handleSurveyFormChange,
    closeSurveyDrawer,
    closeCreateWizard: wizard.closeCreateWizard,
    openCreateDrawer: wizard.openCreateDrawer,
    openSurveyDrawer,
    openAddQuestionDrawer: composer.openAddQuestionDrawer,
    openEditQuestionDrawer: composer.openEditQuestionDrawer,
    closeComposer: composer.closeComposer,
    validateSurveyForm: wizard.validateSurveyForm,
    validateQuestionForm: composer.validateQuestionForm,
    handleLogoUpload: wizard.handleLogoUpload,
    handleDuplicateSurvey: wizard.handleDuplicateSurvey,
    handleSelectTemplate: wizard.handleSelectTemplate,
    handleBlankSurvey: wizard.handleBlankSurvey,
    handleWizardNext: wizard.handleWizardNext,
    handleWizardBack: wizard.handleWizardBack,
    handleSaveSurvey,
    handleSurveyDelete,
    handleQuestionDelete,
    handleQuestionDragStart: composer.handleQuestionDragStart,
    handleQuestionDragOver: composer.handleQuestionDragOver,
    handleQuestionDrop: composer.handleQuestionDrop,
    handleQuestionDragEnd: composer.handleQuestionDragEnd,
    handleSaveQuestion: composer.handleSaveQuestion,
    handleAutoExpire,
    handleManualClose,
    handlePublishSurvey,
    handleCopySurveyLink,
    handleOpenShareModal,
    handlePageChange,
  };
};
