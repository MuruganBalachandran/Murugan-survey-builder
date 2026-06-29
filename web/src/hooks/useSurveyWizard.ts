// region imports
import { useAppDispatch } from "@/hooks/redux";
import { toast } from "@/utils/common/toast";
import type { SurveyRecord, QuestionFormState } from "@/types";
import type { Question } from "@/types/survey";
import {
  createNewSurvey,
  updateSurveyDetails,
  fetchSurveyById,
} from "@/store/slices/surveySlice";
import { addQuestionToSurvey } from "@/store/slices/questionSlice";
import {
  DEFAULT_SURVEY_FORM as defaultSurveyForm,
  SURVEY_TEMPLATES,
} from "@/utils/constants";
import {
  isValidSurveyTitle,
  isValidSurveyDescription,
  isValidMaxResponses,
} from "@/utils/validations";
import {
  normalizeQuestionType,
  readFileAsDataUrl,
} from "@/utils/common/survey";
// endregion

// region types
interface UseSurveyWizardProps {
  dispatch: ReturnType<typeof useAppDispatch>;
  refreshData: (surveyId?: string) => Promise<void>;
  selectedSurveyId: string | null;
  setSelectedSurveyId: (id: string | null) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  createStep: 0 | 1 | 2 | 3 | 4;
  setCreateStep: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | 4>>;
  createSurveyId: string | null;
  setCreateSurveyId: (id: string | null) => void;
  logoFileName: string;
  setLogoFileName: (name: string) => void;
  surveyForm: any;
  setSurveyForm: React.Dispatch<React.SetStateAction<any>>;
  surveyErrors: Record<string, string>;
  setSurveyErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  pendingTemplateQuestions: Omit<QuestionFormState, "id">[];
  setPendingTemplateQuestions: React.Dispatch<React.SetStateAction<Omit<QuestionFormState, "id">[]>>;
  isSavingSurvey: boolean;
  setIsSavingSurvey: (saving: boolean) => void;
  setIsQuestionComposerOpen: (open: boolean) => void;
  setEditingQuestionId: (id: string | null) => void;
  setQuestionForm: React.Dispatch<React.SetStateAction<QuestionFormState>>;
  setQuestionErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeSurvey: SurveyRecord | null;
  activeQuestions: Question[];
}
// endregion

// region hook
export const useSurveyWizard = ({
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
}: UseSurveyWizardProps) => {
  const handleSurveyFormChange = (field: string, value: string) => {
    setSurveyForm((current: any) => ({ ...current, [field]: value }));
  };

  const closeCreateWizard = () => {
    setIsCreateOpen(false);
    setCreateStep(0);
    setSelectedSurveyId(null);
    setCreateSurveyId(null);
    setIsQuestionComposerOpen(false);
    setEditingQuestionId(null);
    setQuestionForm({
      type: "short_text",
      uiType: "input",
      title: "",
      description: "",
      required: false,
      options: ["", ""],
      minLength: "",
      maxLength: "",
      visibleIf: null,
    });
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

    if (
      surveyForm.maxResponses !== "" &&
      !isValidMaxResponses(surveyForm.maxResponses)
    ) {
      nextErrors.maxResponses = "Response limit must be between 1 and 10,000";
    }

    setSurveyErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) {
      setLogoFileName("");
      setSurveyForm((current: any) => ({ ...current, logoUrl: "" }));
      return;
    }
    const nextLogoUrl = await readFileAsDataUrl(file);
    setLogoFileName(file.name);
    setSurveyForm((current: any) => ({ ...current, logoUrl: nextLogoUrl }));
  };

  const handleDuplicateSurvey = async (surveyId: string) => {
    const result = await dispatch(fetchSurveyById(surveyId));
    if (result.type !== fetchSurveyById.fulfilled.type) {
      toast.error("Failed to load survey for duplication");
      return;
    }
    const source = result.payload as SurveyRecord & { questions?: Question[] };
    setSurveyForm({
      title: `${source.title} (copy)`,
      description: source.description || "",
      primaryColor: source.primaryColor || "#6366F1",
      logoUrl: source.logoUrl || "",
      endsAt: defaultSurveyForm().endsAt,
      maxResponses: "",
    });
    setPendingTemplateQuestions(
      (source.questions ?? []).map((q) => ({
        type: q.type,
        uiType: q.uiType ?? "input",
        title: q.title,
        description: q.description || "",
        required: q.required,
        options: q.options ?? [],
        minLength: "",
        maxLength: "",
        visibleIf: null,
      })),
    );
    setSurveyErrors({});
    setCreateStep(1);
    setLogoFileName("");
    setSelectedSurveyId(null);
    setCreateSurveyId(null);
    setIsQuestionComposerOpen(false);
    setIsCreateOpen(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = SURVEY_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setSurveyForm((current: any) => ({
      ...current,
      title: template.label,
      description: template.description,
      primaryColor: template.primaryColor,
    }));
    setPendingTemplateQuestions(template.questions);
    setCreateStep(1);
  };

  const handleBlankSurvey = () => {
    setPendingTemplateQuestions([]);
    setCreateStep(1);
  };

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

  return {
    handleSurveyFormChange,
    closeCreateWizard,
    openCreateDrawer,
    validateSurveyForm,
    handleLogoUpload,
    handleDuplicateSurvey,
    handleSelectTemplate,
    handleBlankSurvey,
    handleWizardNext,
    handleWizardBack,
  };
};
// endregion
