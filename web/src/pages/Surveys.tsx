// region imports
import { Outlet, useLocation } from "@tanstack/react-router";
import { CustomModal } from "@/components/common/CustomModal";
import { Loading } from "@/components/common/Loading";
import { AppLayout } from "@/components/Layout/AppLayout";
import { CreateSurveyDrawer } from "@/components/surveys/drawers/CreateSurveyDrawer";
import { EditSurveyDrawer } from "@/components/surveys/drawers/EditSurveyDrawer";
import { SurveysGrid } from "@/components/surveys/grid/SurveysGrid";
import { ShareSurveyModal } from "@/components/surveys/share/ShareSurveyModal";
import { Button } from "@/components/ui/Button";
import { useSurveysPage } from "@/hooks/useSurveysPage";
import { SurveyFilters } from "@/components/surveys/SurveyFilters";
import { SurveyPagination } from "@/components/surveys/SurveyPagination";
import { getSurveyUrl } from "@/utils/common/survey";
// endregion

/**
 * SurveysPage - Survey management interface with create, edit, delete, and publish workflows
 * Provides filtering, pagination, question management, and CSV export capabilities
 */
// region component
export const SurveysPage = () => {
  const location = useLocation();

  const {
    modal,
    surveys,
    surveysTotal,
    isLoading,
    selectedSurveyId,
    isCreateOpen,
    createStep,
    surveyForm,
    surveyErrors,
    setSurveyErrors,
    questionForm,
    setQuestionForm,
    questionErrors,
    setQuestionErrors,
    questionMode,
    isQuestionComposerOpen,
    isSavingSurvey,
    isPublishingSurvey,
    isSavingQuestion,
    logoFileName,
    draggedQuestionId,
    surveyToShare,
    setSurveyToShare,
    pageSize,
    activeSurvey,
    activeQuestions,
    hasEditChanges,
    totalPages,
    paginatedSurveys,
    pageItems,
    surveySearch,
    setSurveySearch,
    surveyDateRange,
    setSurveyDateRange,
    surveyStatus,
    setSurveyStatus,
    surveySortBy,
    setSurveySortBy,
    currentPage,
    closeSurveyDrawer,
    closeCreateWizard,
    openCreateDrawer,
    openSurveyDrawer,
    openAddQuestionDrawer,
    openEditQuestionDrawer,
    closeComposer,
    handleLogoUpload,
    handleDuplicateSurvey,
    handleSelectTemplate,
    handleBlankSurvey,
    handleWizardNext,
    handleWizardBack,
    handleSaveSurvey,
    handleSurveyDelete,
    handleQuestionDelete,
    handleQuestionDragStart,
    handleQuestionDragOver,
    handleQuestionDrop,
    handleQuestionDragEnd,
    handleSaveQuestion,
    handleAutoExpire,
    handleManualClose,
    handlePublishSurvey,
    handleCopySurveyLink,
    handleOpenShareModal,
    handlePageChange,
    handleSurveyFormChange,
  } = useSurveysPage();

  const handlePreviewSurvey = (slug: string) => {
    window.open(getSurveyUrl(slug), "_blank", "noopener,noreferrer");
  };

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
            <SurveyFilters
              search={surveySearch}
              onSearchChange={setSurveySearch}
              dateRange={surveyDateRange}
              onDateRangeChange={setSurveyDateRange}
              status={surveyStatus}
              onStatusChange={setSurveyStatus}
              sortBy={surveySortBy}
              onSortByChange={setSurveySortBy}
            />
          </div>

          {isLoading && surveys.length === 0 ? (
            <div className="mt-6 flex justify-center py-8">
              <Loading size="md" text="Loading surveys..." />
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
                  onDuplicate={handleDuplicateSurvey}
                  onManualClose={handleManualClose}
                  onAutoExpire={handleAutoExpire}
                />
              </div>

              {/* pagination bar */}
              <SurveyPagination
                currentPage={currentPage}
                pageSize={pageSize}
                surveysTotal={surveysTotal}
                totalPages={totalPages}
                pageItems={pageItems}
                onPageChange={handlePageChange}
              />
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
        maxResponses={surveyForm.maxResponses}
        onMaxResponsesChange={(value) =>
          handleSurveyFormChange("maxResponses", value)
        }
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
        maxResponses={surveyForm.maxResponses}
        onMaxResponsesChange={(value) =>
          handleSurveyFormChange("maxResponses", value)
        }
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
