// region imports
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { submitSurveyResponse } from "@/store/slices/responseSlice";
import { fetchPublicSurvey, clearPublicSurvey } from "@/store/slices/surveySlice";
import type { Answer, Question, SurveyRecord } from "@/types";
import { toast } from "@/utils/common/toast";
// endregion

// region helpers

// resolves the correct input widget for a question, falling back to uiType then type
export const getQuestionUiType = (question: Question) => {
  if (question.uiType) return question.uiType;

  switch (question.type) {
    case "long_text":
      return "textarea";
    case "multiple_choice":
      return "radio";
    case "checkbox_group":
      return "checkbox_group";
    case "dropdown":
      return "select";
    case "rating":
      return "buttons";
    case "yes_no":
      return "toggle";
    case "short_text":
    default:
      return "input";
  }
};

// evaluates a visibleIf rule against the current answers map
export const evaluateVisibleIf = (
  visibleIf:
    | { questionId: string; operator: "equals" | "not_equals"; value: string }
    | undefined,
  answers: Record<string, string | string[] | number>,
): boolean => {
  if (!visibleIf) return true;
  const answer = answers[visibleIf.questionId];
  const answerStr = Array.isArray(answer)
    ? answer.join(", ")
    : String(answer ?? "");
  return visibleIf.operator === "equals"
    ? answerStr === visibleIf.value
    : answerStr !== visibleIf.value;
};

// placeholder for future conditional-logic visibility; always visible for now
export const isQuestionVisible = (_question: Question) => true;

// endregion

export const usePublicSurvey = () => {
  const { slug } = useParams({ from: "/survey/$slug" });
  const dispatch = useAppDispatch();

  const survey = useAppSelector((state) => state.survey.publicSurvey) as SurveyRecord | null;
  const loading = useAppSelector((state) => state.survey.isLoading);
  const submitting = useAppSelector((state) => state.response.isLoading);

  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | number>
  >({});
  const stepInputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  >(null);

  useEffect(() => {
    dispatch(clearPublicSurvey());
    setNotFound(false);
    setSubmitted(false);
    setStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    dispatch(fetchPublicSurvey(slug)).then((result) => {
      if (result.type === fetchPublicSurvey.rejected.type) setNotFound(true);
    });
  }, [slug, dispatch]);

  useEffect(() => {
    if (!started || submitted || loading || !survey?.questions?.length) return;
    const currentQuestion = survey.questions[currentIndex];
    if (!currentQuestion) return;
    const timeout = window.setTimeout(() => {
      stepInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [currentIndex, loading, started, submitted, survey]);

  const brandColor = survey?.primaryColor || "#6366F1";

  const questions = useMemo(
    () =>
      (survey?.questions || []).filter(
        (q) => isQuestionVisible(q) && evaluateVisibleIf(q.visibleIf, answers),
      ),
    [survey, answers],
  );

  const currentQuestion = questions[currentIndex];

  const progress = questions.length
    ? Math.round(
        ((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100,
      )
    : 0;

  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const currentUiType = currentQuestion
    ? getQuestionUiType(currentQuestion)
    : undefined;

  const canGoNext = useMemo(() => {
    if (!currentQuestion) return false;
    if (!currentQuestion.required) return true;

    if (currentUiType === "checkbox_group") {
      return Array.isArray(currentAnswer)
        ? currentAnswer.length > 0
        : Boolean(currentAnswer);
    }

    return typeof currentAnswer === "string"
      ? currentAnswer.trim().length > 0
      : currentAnswer !== undefined;
  }, [currentAnswer, currentQuestion, currentUiType]);

  const handleAnswerChange = (
    questionId: string,
    value: string | string[] | number,
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleStart = () => {
    setStarted(true);
  };

  const handlePrevious = () => {
    setCurrentIndex((current) => Math.max(0, current - 1));
  };

  const handleSubmit = async () => {
    if (!survey) return;

    try {
      const responseAnswers: Answer[] = questions.map((question) => ({
        questionId: question.id,
        value: answers[question.id] || "",
      }));

      const result = await dispatch(
        submitSurveyResponse({ surveyId: survey.id, answers: responseAnswers }),
      );
      if (result.type === submitSurveyResponse.fulfilled.type) {
        setSubmitted(true);
        toast.success("Thank you for your response!");
      } else if (
        (result.payload as any)?.general
          ?.toLowerCase()
          .includes("already submitted")
      ) {
        toast.error("You have already submitted a response to this survey.");
      } else {
        toast.error("Failed to submit response");
      }
    } catch {
      toast.error("Error submitting response");
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    if (currentQuestion.required && !canGoNext) {
      toast.error("Please answer this question");
      return;
    }

    const textAnswer =
      typeof currentAnswer === "string" ? currentAnswer.trim() : "";
    if (
      textAnswer &&
      currentQuestion.minLength &&
      textAnswer.length < currentQuestion.minLength
    ) {
      toast.error(
        `Please enter at least ${currentQuestion.minLength} characters`,
      );
      return;
    }
    if (
      textAnswer &&
      currentQuestion.maxLength &&
      textAnswer.length > currentQuestion.maxLength
    ) {
      toast.error(
        `Please keep your answer under ${currentQuestion.maxLength} characters`,
      );
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((current) => current + 1);
      return;
    }

    await handleSubmit();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement | null;
    if (target?.tagName === "TEXTAREA") return;
    if (started && !submitted) {
      event.preventDefault();
      void handleNext();
    }
  };

  const isClosed =
    survey
      ? survey.status === "closed" ||
        (!!survey.endsAt && new Date(survey.endsAt) < new Date())
      : false;

  return {
    survey,
    loading,
    submitting,
    notFound,
    submitted,
    started,
    currentIndex,
    answers,
    stepInputRef,
    brandColor,
    questions,
    currentQuestion,
    progress,
    currentAnswer,
    currentUiType,
    canGoNext,
    handleAnswerChange,
    handleStart,
    handlePrevious,
    handleNext,
    handleSubmit,
    handleKeyDown,
    isClosed,
  };
};
