// region types
interface SurveyResponsesTabsProps {
  activeTab: "analytics" | "breakdown" | "responses";
  onTabChange: (tab: "analytics" | "breakdown" | "responses") => void;
}
// endregion

// region component
export const SurveyResponsesTabs = ({
  activeTab,
  onTabChange,
}: SurveyResponsesTabsProps) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => onTabChange("analytics")}
          className={`shrink-0 py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "analytics"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onTabChange("breakdown")}
          className={`shrink-0 py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "breakdown"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Question Breakdown
        </button>
        <button
          onClick={() => onTabChange("responses")}
          className={`shrink-0 py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "responses"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Responses
        </button>
      </div>
    </div>
  );
};
// endregion
