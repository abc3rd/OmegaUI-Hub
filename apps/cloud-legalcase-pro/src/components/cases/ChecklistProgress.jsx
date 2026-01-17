import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from 'lucide-react';

export default function ChecklistProgress({ items, onToggle }) {
  const completed = items.filter(item => item.completed).length;
  const total = items.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categories = {};
  items.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
          <Badge className="bg-purple-600 text-white text-base px-3 py-1">
            {completed} / {total}
          </Badge>
        </div>
        
        <div className="relative h-4 bg-white rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out flex items-center justify-center"
            style={{ width: `${percentage}%` }}
          >
            {percentage > 15 && (
              <span className="text-xs font-bold text-white">{percentage}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(categories).map(([category, categoryItems]) => {
          const categoryCompleted = categoryItems.filter(item => item.completed).length;
          const categoryTotal = categoryItems.length;
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{category}</h4>
                <span className="text-sm text-gray-500">
                  {categoryCompleted}/{categoryTotal}
                </span>
              </div>
              
              <div className="space-y-2">
                {categoryItems
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(item => (
                    <div
                      key={item.id}
                      className={`group flex items-start gap-3 p-4 rounded-lg transition-all duration-200 ${
                        item.completed
                          ? 'bg-green-50 hover:bg-green-100'
                          : 'bg-white hover:bg-purple-50 border border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => onToggle(item)}
                        className="mt-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          item.completed
                            ? 'text-green-700 line-through'
                            : 'text-gray-900'
                        }`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className={`text-sm mt-1 ${
                            item.completed ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {item.description}
                          </p>
                        )}
                        {item.due_date && (
                          <p className="text-xs text-gray-500 mt-2">
                            Due: {new Date(item.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {item.priority && (item.priority === 'high' || item.priority === 'critical') && (
                        <Badge variant="destructive" className="text-xs">
                          {item.priority}
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}