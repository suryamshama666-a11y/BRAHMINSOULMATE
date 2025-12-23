import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Eye, Clock, ChevronRight, Loader2, Bell, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import { blogService } from '@/services/api/blog.service';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category: string;
  author_name: string;
  views: number;
  created_at: string;
  published_at?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
}

const categories = [
  { value: 'relationship-tips', label: 'Relationship Tips' },
  { value: 'wedding-planning', label: 'Wedding Planning' },
  { value: 'traditions', label: 'Traditions' },
  { value: 'success-tips', label: 'Success Tips' },
];

function Community() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [articlesData, announcementsData] = await Promise.all([
        blogService.getArticles(undefined, 50).catch(() => []),
        blogService.getAnnouncements().catch(() => [])
      ]);
      setArticles(articlesData as Article[]);
      setAnnouncements(announcementsData as Announcement[]);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const openArticle = async (slug: string) => {
    try {
      const article = await blogService.getArticleBySlug(slug);
      setSelectedArticle(article as Article | null);
    } catch (error) {
      console.error('Error loading article:', error);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const getCategoryLabel = (v: string) => categories.find(c => c.value === v)?.label || v;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <React.Fragment>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedArticle(null)} 
            className="mb-6 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
          <Badge className="mb-4 bg-red-100 text-red-700">{getCategoryLabel(selectedArticle.category)}</Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
          <div className="flex gap-4 text-sm text-gray-500 mb-8">
            <span>By {selectedArticle.author_name}</span>
            <span>{formatDate(selectedArticle.published_at || selectedArticle.created_at)}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{selectedArticle.views} views</span>
          </div>
          {selectedArticle.cover_image && (
            <img 
              src={selectedArticle.cover_image} 
              alt={selectedArticle.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}
          <div className="prose max-w-none">
            {selectedArticle.content.split('\n').map((p, i) => (
              <p key={i} className="mb-4 text-gray-700 leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
        <Footer />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Brahmin Blog
          </h1>
          <p className="text-gray-600">Tips, traditions, and insights for your journey</p>
        </div>

        {announcements.length > 0 && (
          <div className="mb-8 space-y-3">
            {announcements.slice(0, 2).map((a) => (
              <div 
                key={a.id} 
                className="p-4 rounded-lg border bg-orange-50 border-orange-200 flex items-start gap-3"
              >
                <Bell className="h-4 w-4 mt-1 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600">{a.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No articles yet</p>
            <p className="text-sm">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Card 
                key={article.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-500"
                onClick={() => openArticle(article.slug)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {article.cover_image && (
                      <img 
                        src={article.cover_image} 
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0 hidden sm:block"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2 text-xs text-red-600 border-red-200">
                        {getCategoryLabel(article.category)}
                      </Badge>
                      <h2 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt || article.content.substring(0, 150) + '...'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(article.published_at || article.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </span>
                        </div>
                        <span className="flex items-center text-red-600 font-medium">
                          Read more <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </React.Fragment>
  );
}

export default Community;
