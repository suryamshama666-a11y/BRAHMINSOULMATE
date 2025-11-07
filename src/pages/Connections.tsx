import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Video, Phone, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Connections() {
  // Sample data for messages, video calls, and voice calls
  const messages = [
    { id: 1, name: 'Anjali Sharma', image: '/placeholder.svg', lastMessage: 'Would love to know more about your interests!', time: '5m ago', unread: 3, isOnline: true },
    { id: 2, name: 'Vikram Iyer', image: '/placeholder.svg', lastMessage: 'Looking forward to our meeting next week.', time: '2h ago', unread: 0, isOnline: false },
    { id: 3, name: 'Priya Gupta', image: '/placeholder.svg', lastMessage: 'Thank you for your time!', time: '1d ago', unread: 0, isOnline: true },
  ];

  const videoCalls = [
    { id: 1, name: 'Anjali Sharma', image: '/placeholder.svg', duration: '15 mins', time: 'Today, 10:30 AM', status: 'completed' },
    { id: 2, name: 'Rahul Kapoor', image: '/placeholder.svg', time: 'Tomorrow, 3:00 PM', status: 'scheduled' },
  ];

  const voiceCalls = [
    { id: 1, name: 'Vikram Iyer', image: '/placeholder.svg', duration: '8 mins', time: 'Yesterday, 6:15 PM', status: 'completed' },
    { id: 2, name: 'Priya Gupta', image: '/placeholder.svg', duration: '22 mins', time: '12 Apr, 11:45 AM', status: 'completed' },
    { id: 3, name: 'Rahul Kapoor', image: '/placeholder.svg', time: 'Tomorrow, 5:30 PM', status: 'scheduled' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-serif font-bold mb-8 gradient-text">
            My Connections
          </h1>

          <Tabs defaultValue="messages">
            <TabsList className="mb-6">
              <TabsTrigger value="messages" className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="video-calls" className="flex items-center">
                <Video className="h-4 w-4 mr-2" />
                Video Calls
              </TabsTrigger>
              <TabsTrigger value="voice-calls" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Voice Calls
              </TabsTrigger>
            </TabsList>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Conversations</CardTitle>
                    <Link to="/messages">
                      <Button variant="ghost" size="sm" className="text-brahmin-primary">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="relative">
                          <div className="h-12 w-12 border border-gray-200 rounded-full overflow-hidden">
                            <Avatar>
                              <AvatarImage src={message.image} alt={message.name} />
                              <AvatarFallback>{message.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                          {message.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{message.name}</h3>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{message.lastMessage}</p>
                        </div>
                        {message.unread > 0 && (
                          <Badge className="ml-2 rounded-full h-6 w-6 p-0 flex items-center justify-center bg-brahmin-primary">
                            {message.unread}
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="ml-2">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {messages.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No messages yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Video Calls Tab */}
            <TabsContent value="video-calls">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Video Calls</CardTitle>
                    <Button variant="outline" size="sm" className="text-brahmin-primary">
                      Request New Call
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {videoCalls.length > 0 && (
                      <>
                        <div>
                          <h3 className="text-lg font-medium mb-3">Scheduled</h3>
                          <div className="space-y-3">
                            {videoCalls
                              .filter(call => call.status === 'scheduled')
                              .map((call) => (
                                <div key={call.id} className="flex items-center p-4 rounded-lg border border-gray-200 bg-white">
                                  <Avatar className="h-12 w-12 border border-gray-200">
                                    <AvatarImage src={call.image} alt={call.name} />
                                    <AvatarFallback>{call.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4 flex-1">
                                    <h3 className="font-medium">{call.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      <span>{call.time}</span>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button size="sm" className="bg-brahmin-primary hover:bg-brahmin-dark">
                                      Join
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      Reschedule
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-3">Recent</h3>
                          <div className="space-y-3">
                            {videoCalls
                              .filter(call => call.status === 'completed')
                              .map((call) => (
                                <div key={call.id} className="flex items-center p-4 rounded-lg border border-gray-200 bg-white">
                                  <Avatar className="h-12 w-12 border border-gray-200">
                                    <AvatarImage src={call.image} alt={call.name} />
                                    <AvatarFallback>{call.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4 flex-1">
                                    <h3 className="font-medium">{call.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>{call.time} · {call.duration}</span>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Call Again
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}

                    {videoCalls.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No video calls yet</p>
                        <Button className="mt-4 bg-brahmin-primary hover:bg-brahmin-dark">
                          Schedule a Call
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Calls Tab */}
            <TabsContent value="voice-calls">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Voice Calls</CardTitle>
                    <Button variant="outline" size="sm" className="text-brahmin-primary">
                      Request New Call
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {voiceCalls.length > 0 && (
                      <>
                        <div>
                          <h3 className="text-lg font-medium mb-3">Scheduled</h3>
                          <div className="space-y-3">
                            {voiceCalls
                              .filter(call => call.status === 'scheduled')
                              .map((call) => (
                                <div key={call.id} className="flex items-center p-4 rounded-lg border border-gray-200 bg-white">
                                  <Avatar className="h-12 w-12 border border-gray-200">
                                    <AvatarImage src={call.image} alt={call.name} />
                                    <AvatarFallback>{call.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4 flex-1">
                                    <h3 className="font-medium">{call.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      <span>{call.time}</span>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button size="sm" className="bg-brahmin-primary hover:bg-brahmin-dark">
                                      Join
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      Reschedule
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-3">Recent</h3>
                          <div className="space-y-3">
                            {voiceCalls
                              .filter(call => call.status === 'completed')
                              .map((call) => (
                                <div key={call.id} className="flex items-center p-4 rounded-lg border border-gray-200 bg-white">
                                  <Avatar className="h-12 w-12 border border-gray-200">
                                    <AvatarImage src={call.image} alt={call.name} />
                                    <AvatarFallback>{call.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4 flex-1">
                                    <h3 className="font-medium">{call.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>{call.time} · {call.duration}</span>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Call Again
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}

                    {voiceCalls.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No voice calls yet</p>
                        <Button className="mt-4 bg-brahmin-primary hover:bg-brahmin-dark">
                          Schedule a Call
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
