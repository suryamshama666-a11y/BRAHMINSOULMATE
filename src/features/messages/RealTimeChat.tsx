
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, Phone, Video, InfoIcon, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Message } from './types';

interface RealTimeChatProps {
  recipientId: string;
  recipientName: string;
  recipientImage?: string;
  onBack?: () => void;
  onViewProfile?: () => void;
  onVideoCall?: () => void;
  onPhoneCall?: () => void;
}

export default function RealTimeChat({
  recipientId,
  recipientName,
  recipientImage,
  onBack,
  onViewProfile,
  onVideoCall,
  onPhoneCall
}: RealTimeChatProps) {
  const { user, isPremium } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Simulate received messages
  useEffect(() => {
    if (!user) return;
    
    const initialMessage: Message = {
      id: `msg-${Date.now()}`,
      content: `Hi there! How can I help you today?`,
      senderId: recipientId,
      receiverId: user.id,
      timestamp: new Date(),
      read: true
    };
    
    setTimeout(() => {
      setMessages([initialMessage]);
    }, 1000);
    
    // Simulated typing and response for demo
    const handleReceivedMessage = (messageText: string) => {
      setTimeout(() => {
        setTyping(true);
        
        setTimeout(() => {
          setTyping(false);
          
          const newMsg: Message = {
            id: `msg-${Date.now()}`,
            content: messageText,
            senderId: recipientId,
            receiverId: user.id,
            timestamp: new Date(),
            read: true
          };
          
          setMessages(prev => [...prev, newMsg]);
        }, 2000 + Math.random() * 1000);
      }, 1000);
    };
    
    // Set up listener for when user sends messages
    const messageListener = () => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId === user.id) {
        // List of possible responses
        const responses = [
          "That's interesting! Tell me more.",
          "I see. What do you think about astrology?",
          "Have you checked your birth chart recently?",
          "That's nice to know. I'm looking for someone who appreciates traditional values.",
          "Would you like to know more about my family background?",
          "Do you believe in Kundali matching before marriage?",
          "What kind of relationship are you looking for?",
          "I've been looking for someone like you.",
          "Have you visited any temples recently?",
          "What are your thoughts on traditional ceremonies?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        handleReceivedMessage(randomResponse);
      }
    };
    
    if (messages.length > 0 && messages[messages.length - 1]?.senderId === user.id) {
      messageListener();
    }
  }, [messages, recipientId, user]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }
    
    if (!isPremium) {
      toast.error('Messaging is only available for premium members');
      return;
    }
    
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      senderId: user.id,
      receiverId: recipientId,
      timestamp: new Date(),
      read: false
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Function to generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-3 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={recipientImage} alt={recipientName} />
            <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{recipientName}</h3>
            <div className="text-xs text-green-500 flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={onPhoneCall}>
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onVideoCall}>
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onViewProfile}>
            <InfoIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Message area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {!isPremium ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Lock className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              Real-time chat is only available for premium members. Upgrade your subscription to unlock this feature.
            </p>
            <Button>Upgrade to Premium</Button>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div 
                key={message.id}
                className={`mb-4 flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                {message.senderId !== user?.id && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarImage src={recipientImage} alt={recipientName} />
                    <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.senderId === user?.id 
                      ? 'bg-brahmin-primary text-white' 
                      : 'bg-white border'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 text-right ${
                    message.senderId === user?.id ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {typing && (
              <div className="mb-4 flex justify-start">
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src={recipientImage} alt={recipientName} />
                  <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
                </Avatar>
                <div className="bg-white border rounded-lg p-3 flex items-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
        <div className="flex items-center">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isPremium ? "Type your message..." : "Premium feature only"}
            className="flex-1 mr-2"
            disabled={!isPremium}
          />
          <Button type="submit" size="icon" disabled={!isPremium || !newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {!isPremium && (
          <p className="text-xs text-amber-600 mt-1 flex items-center">
            <Lock className="h-3 w-3 mr-1" />
            Upgrade to premium to send messages
          </p>
        )}
      </form>
    </div>
  );
}
