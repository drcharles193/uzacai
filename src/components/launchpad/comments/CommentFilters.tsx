
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUp, ArrowDown } from 'lucide-react';

type SortOption = 'newest' | 'oldest';
type FilterOption = 'all' | 'withReplies' | 'withoutReplies';

interface CommentFiltersProps {
  sortOrder: SortOption;
  setSortOrder: (order: SortOption) => void;
  filterType: FilterOption;
  setFilterType: (type: FilterOption) => void;
}

const CommentFilters: React.FC<CommentFiltersProps> = ({
  sortOrder,
  setSortOrder,
  filterType,
  setFilterType
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-sm">
              <Filter className="h-3.5 w-3.5" />
              {filterType === 'all' && 'All Comments'}
              {filterType === 'withReplies' && 'With Replies'}
              {filterType === 'withoutReplies' && 'Without Replies'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => setFilterType('all')}>
              All Comments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('withReplies')}>
              With Replies
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('withoutReplies')}>
              Without Replies
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1 text-sm">
            {sortOrder === 'newest' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setSortOrder('newest')}>
            <ArrowDown className="h-3.5 w-3.5 mr-2" />
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
            <ArrowUp className="h-3.5 w-3.5 mr-2" />
            Oldest First
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CommentFilters;
