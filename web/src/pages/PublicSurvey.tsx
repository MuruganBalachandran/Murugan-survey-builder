// region imports

import { useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/lib/toast";
import { submitResponse } from "@/services/api/responses";
import { getPublicSurvey } from "@/services/api/surveys";
import type { Answer, Question, SurveyWithQuestions } from "@/types/survey";
import { StarRating } from "@/components/ui/StarRating";
import { ArrowLeftIcon, CheckLargeIcon, ProgressIcon } from "@/utils/icons";

// endregion

// region helpers

// resolves the correct input widget for a question, falling back to uiType then type
const getQuestionUiType = (question: Question) => {
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

// placeholder for future conditional-logic visibility; always visible for now
const isQuestionVisible = (_question: Question) => true;

// endregion

// region component
export const PublicSurveyPage = () => {
  const { slug } = useParams({ from: "/survey/$slug" });
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | number>
  >({});
  // ref used to programmatically focus the active question's input after transition
  const stepInputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  >(null);

  // region effects

  // load survey when slug changes
  useEffect(() => {
    loadSurvey();
  }, [slug]);

  // auto-focus the input of the current question after each step change
  useEffect(() => {
    if (!started || submitted || loading || !survey?.questions?.length) return;
    const currentQuestion = survey.questions[currentIndex];
    if (!currentQuestion) return;
    // defer to next tick so the element is mounted before focus
    const timeout = window.setTimeout(() => {
      stepInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [currentIndex, loading, started, submitted, survey]);

  // endregion

  // region functions

  const loadSurvey = async () => {
    setLoading(true);
    try {
      const result = await getPublicSurvey(slug);
      if (result.success && result.data) {
        setSurvey(result.data);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // endregion

  // region derived data

  const brandColor = survey?.primaryColor || "#6366F1";
  // filter out any hidden questions (future conditional logic hook)
  const questions = useMemo(
    () => (survey?.questions || []).filter(isQuestionVisible),
    [survey],
  );
  const currentQuestion = questions[currentIndex];
  // progress as a percentage of completed steps
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

  // whether the respondent may advance to the next question
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

  // endregion

  // region handlers

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

  const handleNext = async () => {
    if (!currentQuestion) return;
    if (currentQuestion.required && !canGoNext) {
      toast.error("Please answer this question");
      return;
    }

    // advance to next question or submit if on the last one
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((current) => current + 1);
      return;
    }

    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!survey) return;

    setSubmitting(true);
    try {
      // map answers state to the API shape
      const responseAnswers: Answer[] = questions.map((question) => ({
        questionId: question.id,
        value: answers[question.id] || "",
      }));

      const result = await submitResponse(survey.id, responseAnswers);
      if (result.success) {
        setSubmitted(true);
        toast.success("Thank you for your response!");
      } else if (result.message?.toLowerCase().includes("already submitted")) {
        toast.error("You have already submitted a response to this survey.");
      } else {
        toast.error("Failed to submit response");
      }
    } catch {
      toast.error("Error submitting response");
    } finally {
      setSubmitting(false);
    }
  };

  // allow Enter key to advance through questions (except inside textareas)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement | null;
    if (target?.tagName === "TEXTAREA") return;
    if (started && !submitted) {
      event.preventDefault();
      void handleNext();
    }
  };

  // endregion

  // region loading / not-found states

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900">Survey not found</h1>
          <p className="mt-2 text-gray-600">
            The survey you're looking for doesn't exist.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            <ArrowLeftIcon />
            Back to home
          </a>
        </div>
      </div>
    );
  }

  if (!survey) return null;

  const isClosed =
    survey.status === "closed" ||
    (!!survey.endsAt && new Date(survey.endsAt) < new Date());

  // endregion

  // region render
  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{ backgroundColor: `${brandColor}10` }}
      onKeyDown={handleKeyDown}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_20px_80px_rgba(17,24,39,0.12)] backdrop-blur-sm sm:p-8">
          {/* thank-you screen shown after successful submission */}
          {submitted ? (
            <div className="py-12 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${brandColor}18`,
                  color: brandColor,
                }}
              >
                <CheckLargeIcon />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Thank you</h2>
              <p className="mt-3 text-gray-600">
                Your response has been recorded successfully.
              </p>
            </div>
          ) : !started ? (
            /* survey cover / intro screen */
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                {survey.logoUrl ? (
                  <img
                    src={survey.logoUrl}
                    alt="Survey logo"
                    className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div
                    className="mx-auto h-16 w-16 rounded-2xl shadow-sm"
                    style={{ backgroundColor: brandColor }}
                  />
                )}
                <div
                  className="mx-auto h-1.5 w-24 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  {survey.title}
                </h1>
                {survey.description && (
                  <p className="mx-auto max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                    {survey.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: brandColor }}
                  />
                  {questions.length} questions
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                  <ProgressIcon />
                  One question at a time
                </span>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStart}
                  disabled={isClosed}
                  style={
                    isClosed
                      ? undefined
                      : {
                          background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                        }
                  }
                >
                  {isClosed ? "Survey closed" : "Start Survey"}
                </Button>
              </div>
              {isClosed && (
                <p className="text-sm font-medium text-red-500">
                  <strong>{survey.title}</strong> is no longer accepting
                  responses.
                </p>
              )}
            </div>
          ) : currentQuestion ? (
            /* single-question step */
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="text-sm font-semibold uppercase tracking-[0.22em]"
                      style={{ color: brandColor }}
                    >
                      Question {currentIndex + 1} of {questions.length}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-gray-900">
                      {currentQuestion.title}
                    </h2>
                    {currentQuestion.description && (
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {currentQuestion.description}
                      </p>
                    )}
                  </div>
                  {/* desktop progress bar */}
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="h-2 w-36 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: brandColor,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* mobile progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 sm:hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: brandColor,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {currentUiType === "input" && (
                  <Input
                    ref={stepInputRef as React.RefObject<HTMLInputElement>}
                    value={String(currentAnswer || "")}
                    onChange={(event) =>
                      handleAnswerChange(currentQuestion.id, event.target.value)
                    }
                    placeholder="Your answer..."
                    autoFocus
                  />
                )}

                {currentUiType === "textarea" && (
                  <Textarea
                    ref={stepInputRef as React.RefObject<HTMLTextAreaElement>}
                    value={String(currentAnswer || "")}
                    onChange={(event) =>
                      handleAnswerChange(currentQuestion.id, event.target.value)
                    }
                    placeholder="Your answer..."
                    rows={6}
                    autoFocus
                  />
                )}

                {currentUiType === "radio" && (
                  <div className="grid gap-3">
                    {currentQuestion.options?.map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                          currentAnswer === option
                            ? "border-violet-500 bg-violet-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          checked={currentAnswer === option}
                          onChange={() =>
                            handleAnswerChange(currentQuestion.id, option)
                          }
                          className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                          autoFocus={option === currentQuestion.options?.[0]}
                        />
                        <span className="text-sm font-medium text-gray-800">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {currentUiType === "checkbox_group" && (
                  <div className="grid gap-3">
                    {currentQuestion.options?.map((option) => {
                      const selected = Array.isArray(currentAnswer)
                        ? currentAnswer.includes(option)
                        : false;
                      return (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                            selected
                              ? "border-violet-500 bg-violet-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => {
                              const current = Array.isArray(currentAnswer)
                                ? currentAnswer
                                : [];
                              // add or remove option from the selected array
                              if (event.target.checked) {
                                handleAnswerChange(currentQuestion.id, [
                                  ...current,
                                  option,
                                ]);
                              } else {
                                handleAnswerChange(
                                  currentQuestion.id,
                                  current.filter((item) => item !== option),
                                );
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {currentUiType === "select" && (
                  <select
                    ref={stepInputRef as React.RefObject<HTMLSelectElement>}
                    value={
                      typeof currentAnswer === "string" ? currentAnswer : ""
                    }
                    onChange={(event) =>
                      handleAnswerChange(currentQuestion.id, event.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    autoFocus
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {currentQuestion.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {/* 1-5 rating stars */}
                {currentUiType === "buttons" && (
                  <StarRating
                    value={typeof currentAnswer === "number" ? currentAnswer : 0}
                    color={brandColor}
                    size={36}
                    interactive
                    onChange={(rating) =>
                      handleAnswerChange(currentQuestion.id, rating)
                    }
                  />
                )}

                {/* yes / no rendered as radio pair */}
                {currentUiType === "toggle" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["Yes", "No"].map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                          currentAnswer === option
                            ? "border-violet-500 bg-violet-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          checked={currentAnswer === option}
                          onChange={() =>
                            handleAnswerChange(currentQuestion.id, option)
                          }
                          className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                          autoFocus={option === "Yes"}
                        />
                        <span className="text-sm font-medium text-gray-800">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="tertiary"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  icon={<ArrowLeftIcon />}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">
                    {currentIndex + 1} / {questions.length}
                  </span>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    isLoading={submitting}
                    disabled={!canGoNext}
                    icon={
                      currentIndex < questions.length - 1 ? undefined : (
                        <CheckLargeIcon />
                      )
                    }
                    style={{
                      background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                    }}
                  >
                    {currentIndex < questions.length - 1 ? "Next" : "Submit"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
  // endregion
};
// endregion
