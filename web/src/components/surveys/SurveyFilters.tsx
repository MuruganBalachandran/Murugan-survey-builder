// region imports
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  SURVEY_DATE_RANGE_OPTIONS,
  SURVEY_SORT_OPTIONS,
  SURVEY_STATUSES,
} from "@/utils/constants";
import { CalendarIcon, FilterIcon, SortIcon } from "@/utils/icons";
// endregion

// region types
interface SurveyFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}
// endregion

// region component
export const SurveyFilters = ({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
}: SurveyFiltersProps) => {
  return (
    <div className="grid w-full gap-3 lg:max-w-5xl lg:grid-cols-[minmax(0,1.5fr)_150px_150px_150px]">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search surveys"
      />

      <Select
        value={dateRange}
        onChange={(event) => onDateRangeChange(event.target.value)}
        placeholder="Date range"
        icon={<CalendarIcon />}
        options={[...SURVEY_DATE_RANGE_OPTIONS]}
      />

      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        placeholder="Status"
        icon={<FilterIcon />}
        options={[
          { value: "all", label: "All status" },
          ...SURVEY_STATUSES.map((s) => ({
            value: s.id,
            label: s.label,
          })),
        ]}
      />

      <Select
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value)}
        placeholder="Sort by"
        icon={<SortIcon />}
        options={[...SURVEY_SORT_OPTIONS]}
      />
    </div>
  );
};
// endregion
