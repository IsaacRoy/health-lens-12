
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  emoji?: string;
  image?: string;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
  gradient?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  emoji,
  image,
  title,
  description,
  onClick,
  badge,
  gradient = 'from-blue-500 to-purple-600'
}) => {
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border-0 shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 flex items-center justify-center">
            {image ? (
              <img src={image} alt={title} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <span className="text-3xl">{emoji}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {badge && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};
