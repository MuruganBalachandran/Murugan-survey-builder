// region imports
import { ChevronLeftIcon, ChevronRightIcon } from "@/utils/icons";
// endregion

// region types
interface SurveyPaginationProps {
  currentPage: number;
  pageSize: number;
  surveysTotal: number;
  totalPages: number;
  pageItems: (number | "ellipsis")[];
  onPageChange: (page: number) => void;
}
// endregion

// region component
export const SurveyPagination = ({
  currentPage,
  pageSize,
  surveysTotal,
  totalPages,
  pageItems,
  onPageChange,
}: SurveyPaginationProps) => {
  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-5 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-gray-600">
        Showing {Math.max(1, (currentPage - 1) * pageSize + 1)}-
        {Math.min(currentPage * pageSize, surveysTotal)} of {surveysTotal}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
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
                onClick={() => onPageChange(item)}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors ${
                  item === currentPage
                    ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};
// endregion
