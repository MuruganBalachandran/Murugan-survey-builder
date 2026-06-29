// region imports
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/common/Loading";
import { ArrowLeftIcon } from "@/utils/icons";
import { usePublicSurvey } from "@/hooks/usePublicSurvey";
import { PublicSurveyCover } from "@/components/surveys/public/PublicSurveyCover";
import { PublicSurveyQuestionStep } from "@/components/surveys/public/PublicSurveyQuestionStep";
import { PublicSurveyThankYou } from "@/components/surveys/public/PublicSurveyThankYou";
// endregion

/**
 * PublicSurveyPage - Renders a public survey form for anonymous responses
 * Handles single-step or multi-step survey navigation and submission
 */
// region component
export const PublicSurveyPage = () => {
  const {
    survey,
    loading,
    submitting,
    notFound,
    submitted,
    started,
    currentIndex,
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
    handleKeyDown,
    isClosed,
  } = usePublicSurvey();

  // region loading / not-found states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Loading survey..." />
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
          {submitted ? (
            <PublicSurveyThankYou brandColor={brandColor} />
          ) : !started ? (
            <PublicSurveyCover
              survey={survey}
              brandColor={brandColor}
              questionsCount={questions.length}
              isClosed={isClosed}
              onStart={handleStart}
            />
          ) : currentQuestion ? (
            <PublicSurveyQuestionStep
              currentIndex={currentIndex}
              questionsCount={questions.length}
              currentQuestion={currentQuestion}
              currentAnswer={currentAnswer}
              currentUiType={currentUiType}
              progress={progress}
              brandColor={brandColor}
              canGoNext={canGoNext}
              submitting={submitting}
              stepInputRef={stepInputRef}
              onAnswerChange={handleAnswerChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
  // endregion
};
// endregion
