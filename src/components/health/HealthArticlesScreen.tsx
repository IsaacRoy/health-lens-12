
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, ArrowLeft, Heart, Brain, Activity } from 'lucide-react';

interface HealthArticlesScreenProps {
  onBack: () => void;
}

export const HealthArticlesScreen: React.FC<HealthArticlesScreenProps> = ({ onBack }) => {
  const [articles] = useState([
    {
      id: '1',
      title: 'Understanding Your Blood Pressure Numbers',
      category: 'Heart Health',
      readTime: '5 min',
      summary: 'Learn what your blood pressure readings mean and how to maintain healthy levels.',
      icon: '❤️'
    },
    {
      id: '2',
      title: 'Managing Diabetes Through Diet',
      category: 'Nutrition',
      readTime: '8 min',
      summary: 'Practical tips for managing blood sugar levels through proper nutrition.',
      icon: '🍎'
    },
    {
      id: '3',
      title: 'The Importance of Mental Health',
      category: 'Mental Wellness',
      readTime: '6 min',
      summary: 'Understanding the connection between mental and physical health.',
      icon: '🧠'
    }
  ]);

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <div className="flex items-center space-x-3 mb-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Health Articles 📰</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="heart">Heart</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="mental">Mental</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {articles.map((article) => (
              <Card key={article.id} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{article.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {article.readTime}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600">{article.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="heart" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Heart Health Articles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Heart health focused articles will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span>Nutrition Articles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Nutrition and diet articles will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mental" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span>Mental Health Articles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Mental health and wellness articles will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
