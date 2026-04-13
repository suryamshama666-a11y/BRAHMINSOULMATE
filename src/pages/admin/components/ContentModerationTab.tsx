import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { } from '@/components/ui/avatar';
import { 
  AlertTriangle, CheckCircle, Trash2, Eye, 
  MessageSquare, User, Image as ImageIcon, Filter,
  ShieldAlert, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FlaggedItem {
  id: string;
  type: 'profile' | 'post' | 'image';
  reason: string;
  reporter: string;
  target_name: string;
  target_id: string;
  content_preview?: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export const ContentModerationTab = () => {
  const [items, setItems] = useState<FlaggedItem[]>([
    {
      id: 'flag-1',
      type: 'profile',
      reason: 'Inappropriate bio content',
      reporter: 'Anjali R.',
      target_name: 'Rahul Khanna',
      target_id: 'user-123',
      content_preview: 'Seeking fun and more, not looking for marriage...',
      created_at: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: 'flag-2',
      type: 'post',
      reason: 'Spam / Advertisement',
      reporter: 'System Bot',
      target_name: 'Community Post #442',
      target_id: 'post-99',
      content_preview: 'Click here for cheap international trips! Best deals...',
      created_at: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: 'flag-3',
      type: 'image',
      reason: 'Not a person (Landscape)',
      reporter: 'User Verification',
      target_name: 'Sunita M. (Photo)',
      target_id: 'photo-88',
      created_at: new Date().toISOString(),
      status: 'pending'
    }
  ]);

  const handleAction = (id: string, action: 'dismiss' | 'resolve' | 'delete') => {
    toast.success(`Content ${action}ed successfully`);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            Content Moderation Queue
          </h2>
          <p className="text-gray-500">Review flagged content and reports from users</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-gray-200">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-gray-200">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Moderation Logs
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className={`w-2 md:w-1 bg-red-500`} />
                    <div className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-red-50 p-3 rounded-2xl">
                            {item.type === 'profile' && <User className="h-6 w-6 text-red-600" />}
                            {item.type === 'post' && <MessageSquare className="h-6 w-6 text-red-600" />}
                            {item.type === 'image' && <ImageIcon className="h-6 w-6 text-red-600" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{item.target_name}</h4>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter h-5">
                                {item.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-red-600 font-semibold mt-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {item.reason}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Reported by {item.reporter} • {new Date(item.created_at).toLocaleDateString()}
                            </p>
                            {item.content_preview && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm italic text-gray-600">
                                "{item.content_preview}"
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleAction(item.id, 'dismiss')}
                            className="text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Dismiss
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleAction(item.id, 'delete')}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gray-900">All caught up!</h3>
            <p className="text-gray-500">There are no pending items in the moderation queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};
