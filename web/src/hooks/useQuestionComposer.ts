// region imports
import { useAppDispatch } from "@/hooks/redux";
import { toast } from "@/utils/common/toast";
import type { SurveyRecord, QuestionFormState } from "@/types";
import type { Question } from "@/types/survey";
import {
  addQuestionToSurvey,
  reorderSurveyQuestions,
  updateQuestionDetails,
} from "@/store/slices/questionSlice";
import {
  DEFAULT_QUESTION_FORM as defaultQuestionForm,
} from "@/utils/constants";
import {
  isMultipleChoiceQuestion,
  isValidQuestionOptions,
  isValidQuestionTitle,
} from "@/utils/validations";
import { normalizeQuestionType } from "@/utils/common/survey";
// endregion

// region types
interface UseQuestionComposerProps {
  dispatch: ReturnType<typeof useAppDispatch>;
  refreshData: (surveyId?: string) => Promise<void>;
  activeSurvey: SurveyRecord | null;
  activeQuestions: Question[];
  selectedSurveyId: string | null;
  closeSurveyDrawer: () => void;
  isCreateOpen: boolean;
  questionForm: QuestionFormState;
  setQuestionForm: React.Dispatch<React.SetStateAction<QuestionFormState>>;
  questionErrors: Record<string, string>;
  setQuestionErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isQuestionComposerOpen: boolean;
  setIsQuestionComposerOpen: (open: boolean) => void;
  questionMode: "create" | "edit";
  setQuestionMode: React.Dispatch<React.SetStateAction<"create" | "edit">>;
  editingQuestionId: string | null;
  setEditingQuestionId: (id: string | null) => void;
  isSavingQuestion: boolean;
  setIsSavingQuestion: (saving: boolean) => void;
  draggedQuestionId: string | null;
  setDraggedQuestionId: (id: string | null) => void;
}
// endregion

// region hook
export const useQuestionComposer = ({
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
}: UseQuestionComposerProps) => {
  const openAddQuestionDrawer = () => {
    setQuestionMode("create");
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setQuestionErrors({});
    setIsQuestionComposerOpen(true);
  };

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
      minLength: String(question.minLength ?? ""),
      maxLength: String(question.maxLength ?? ""),
      visibleIf: question.visibleIf ?? null,
    });
    setIsQuestionComposerOpen(true);
  };

  const closeComposer = () => {
    setIsQuestionComposerOpen(false);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
    setQuestionErrors({});
  };

  const validateQuestionForm = () => {
    const nextErrors: Record<string, string> = {};
    const cleanedTitle = questionForm.title.trim();

    if (!cleanedTitle) {
      nextErrors.title = "Question title is required";
    } else if (!isValidQuestionTitle(cleanedTitle)) {
      nextErrors.title = "Question title must be 3-100 characters";
    }

    if (
      isMultipleChoiceQuestion(questionForm.type) &&
      !isValidQuestionOptions(questionForm.options)
    ) {
      const cleaned = questionForm.options
        .map((opt) => opt.trim())
        .filter(Boolean);
      nextErrors.options =
        cleaned.length < 2
          ? "Add at least 2 options"
          : "Options must be unique";
    }

    setQuestionErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

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
      minLength: questionForm.minLength
        ? Number(questionForm.minLength)
        : undefined,
      maxLength: questionForm.maxLength
        ? Number(questionForm.maxLength)
        : undefined,
      visibleIf: questionForm.visibleIf ?? undefined,
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

  const handleQuestionDragStart = (questionId: string) => {
    setDraggedQuestionId(questionId);
  };

  const handleQuestionDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

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

  return {
    openAddQuestionDrawer,
    openEditQuestionDrawer,
    closeComposer,
    validateQuestionForm,
    handleSaveQuestion,
    handleQuestionDragStart,
    handleQuestionDragOver,
    handleQuestionDrop,
    handleQuestionDragEnd,
  };
};
// endregion
