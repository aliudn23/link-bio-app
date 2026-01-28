'use client';

interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
  order: number;
}

interface LinkCardProps {
  link: Link;
  onEdit?: (link: Link) => void;
  onDelete?: (linkId: string) => void;
  onToggle?: (linkId: string, active: boolean) => void;
}

export function LinkCard({ link, onEdit, onDelete, onToggle }: LinkCardProps) {
  const handleClick = () => {
    if (link.active) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`relative group bg-white rounded-lg border-2 transition-all duration-200 ${
      link.active 
        ? 'border-blue-200 hover:border-blue-300 hover:shadow-md cursor-pointer' 
        : 'border-gray-200 opacity-60'
    }`}>
      <div 
        className="p-4 text-center"
        onClick={handleClick}
      >
        <h3 className="font-medium text-gray-900 truncate">
          {link.title}
        </h3>
        <p className="text-sm text-gray-500 truncate mt-1">
          {link.url}
        </p>
      </div>

      {/* Action buttons (shown on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-1">
          {onToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(link.id, !link.active);
              }}
              className={`p-1 rounded text-xs ${
                link.active 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title={link.active ? 'Disable' : 'Enable'}
            >
              {link.active ? '⏸' : '▶'}
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(link);
              }}
              className="p-1 rounded text-xs bg-blue-100 text-blue-600 hover:bg-blue-200"
              title="Edit"
            >
              ✏️
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${link.title}"?`)) {
                  onDelete(link.id);
                }
              }}
              className="p-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200"
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      {!link.active && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">Disabled</span>
        </div>
      )}
    </div>
  );
}

export type { Link, LinkCardProps };