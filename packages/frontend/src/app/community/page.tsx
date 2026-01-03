"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Heart,
  TrendingUp,
  Sparkles,
  Users,
  PenSquare,
  Loader2,
  ChevronRight,
  Star,
  Quote,
  Filter,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MessageButton } from "@/components/messaging/MessageButton";
import { useAuth } from "@/providers/AuthProvider";

// Post types
const POST_TYPES = [
  { id: "all", label: "Alle", icon: Users },
  { id: "success_story", label: "Erfolgsgeschichten", icon: TrendingUp },
  { id: "question", label: "Fragen", icon: MessageCircle },
  { id: "tip", label: "Tipps", icon: Sparkles },
  { id: "inspiration", label: "Inspiration", icon: Star },
];

// Mock community posts (will come from API)
const MOCK_POSTS = [
  {
    id: "1",
    type: "success_story",
    title: "Von 4 auf 8 in 3 Monaten",
    content: "Als ich mit LEBENSENERGIE anfing, war mein Score bei 4. Heute, nach 3 Monaten konsequentem Check-in und den Modulen, bin ich bei 8! Der Schlüssel war für mich die Morgenroutine...",
    author: { id: "1", name: "Maria S.", avatarUrl: null },
    beforeScore: 4,
    afterScore: 8,
    likesCount: 47,
    commentsCount: 12,
    isLiked: false,
    createdAt: "2026-01-02T10:00:00Z",
  },
  {
    id: "2",
    type: "question",
    title: "Wie haltet ihr eure Morgenroutine durch?",
    content: "Ich schaffe es einfach nicht, konsequent morgens meine Routine zu machen. Hat jemand Tipps?",
    author: { id: "2", name: "Thomas K.", avatarUrl: null },
    likesCount: 23,
    commentsCount: 8,
    isLiked: true,
    createdAt: "2026-01-03T08:30:00Z",
  },
  {
    id: "3",
    type: "tip",
    title: "5-Minuten Atemübung für sofort mehr Energie",
    content: "Diese einfache Atemtechnik hat mir durch so manches Energietief geholfen: 4 Sekunden einatmen, 7 Sekunden halten, 8 Sekunden ausatmen. 5 Wiederholungen reichen!",
    author: { id: "3", name: "Julia R.", avatarUrl: null },
    likesCount: 89,
    commentsCount: 15,
    isLiked: false,
    createdAt: "2026-01-01T14:20:00Z",
  },
  {
    id: "4",
    type: "inspiration",
    content: "\"Der beste Zeitpunkt, deine Energie zu priorisieren, war gestern. Der zweitbeste ist heute.\" ✨",
    author: { id: "4", name: "MOJO Team", avatarUrl: null },
    likesCount: 156,
    commentsCount: 3,
    isPinned: true,
    createdAt: "2026-01-03T06:00:00Z",
  },
];

// Mock success stories for sidebar
const MOCK_SUCCESS_STORIES = [
  { id: "1", userId: "user-1", name: "Maria S.", improvement: 100, beforeScore: 4, afterScore: 8 },
  { id: "2", userId: "user-2", name: "Stefan H.", improvement: 75, beforeScore: 4, afterScore: 7 },
  { id: "3", userId: "user-3", name: "Anna M.", improvement: 50, beforeScore: 6, afterScore: 9 },
];

// Post Card Component
function PostCard({ post }: { post: typeof MOCK_POSTS[0] }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  
  // Don't show message button if user is the author
  const isOwnPost = user?.id === post.author.id;

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    // API call would go here
  };

  const typeConfig = {
    success_story: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Erfolgsgeschichte" },
    question: { color: "text-blue-600", bg: "bg-blue-50", label: "Frage" },
    tip: { color: "text-amber-600", bg: "bg-amber-50", label: "Tipp" },
    inspiration: { color: "text-purple-600", bg: "bg-purple-50", label: "Inspiration" },
    post: { color: "text-slate-600", bg: "bg-slate-50", label: "Beitrag" },
  };

  const config = typeConfig[post.type as keyof typeof typeConfig] || typeConfig.post;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#66dd99] to-[#44cc88] flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {post.author.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-900">{post.author.name}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", config.bg, config.color)}>
                {config.label}
              </span>
              {post.isPinned && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  📌 Angepinnt
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {new Date(post.createdAt).toLocaleDateString("de-DE", { 
                day: "numeric", 
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        </div>

        {/* Content */}
        {post.title && (
          <h3 className="font-semibold text-slate-900 mb-2">{post.title}</h3>
        )}
        <p className="text-slate-600 mb-4">{post.content}</p>

        {/* Success Story Stats */}
        {post.type === "success_story" && post.beforeScore && post.afterScore && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-emerald-50 mb-4">
            <div className="text-center">
              <div className="text-sm text-slate-500">Vorher</div>
              <div className="text-lg font-bold text-slate-400">{post.beforeScore}/10</div>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <div className="text-center">
              <div className="text-sm text-slate-500">Nachher</div>
              <div className="text-lg font-bold text-emerald-600">{post.afterScore}/10</div>
            </div>
            <div className="flex-1 text-right">
              <span className="text-emerald-600 font-bold">
                +{Math.round(((post.afterScore - post.beforeScore) / post.beforeScore) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                liked ? "text-red-500" : "text-slate-500 hover:text-red-500"
              )}
            >
              <Heart className={cn("w-4 h-4", liked && "fill-current")} />
              {likesCount}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#66dd99] transition-colors">
              <MessageCircle className="w-4 h-4" />
              {post.commentsCount}
            </button>
          </div>
          
          {/* Message Button - nur wenn nicht eigener Post */}
          {!isOwnPost && (
            <MessageButton
              targetUserId={post.author.id}
              targetUserName={post.author.name}
              postTitle={post.title}
              postType={post.type}
              variant="ghost"
              size="sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Success Stories Sidebar
function SuccessStoriesSidebar() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Top Transformationen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_SUCCESS_STORIES.map((story, index) => (
          <div key={story.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-lg font-bold text-slate-300">#{index + 1}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#66dd99] to-[#44cc88] flex items-center justify-center text-white text-xs font-semibold">
              {story.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-900 truncate">{story.name}</div>
              <div className="text-xs text-slate-400">{story.beforeScore} → {story.afterScore}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-600">+{story.improvement}%</span>
              <MessageButton
                targetUserId={story.userId}
                targetUserName={story.name}
                postType="success_story"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              />
            </div>
          </div>
        ))}
        <Link href="/community?type=success_story">
          <Button variant="ghost" size="sm" className="w-full text-[#66dd99] hover:text-[#44cc88]">
            Alle ansehen
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Daily Inspiration
function DailyInspiration() {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
      <CardContent className="p-6 text-center">
        <Quote className="w-8 h-8 text-purple-300 mx-auto mb-3" />
        <p className="text-lg text-slate-700 italic mb-3">
          "Der beste Zeitpunkt, deine Energie zu priorisieren, war gestern. Der zweitbeste ist heute."
        </p>
        <p className="text-sm text-purple-600">– MOJO Team</p>
      </CardContent>
    </Card>
  );
}

// Main Community Page
export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPosts = activeFilter === "all" 
    ? posts 
    : posts.filter(p => p.type === activeFilter);

  return (
    <div className="container mx-auto py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Community</h1>
              <p className="text-slate-500">Tausche dich mit Gleichgesinnten aus</p>
            </div>
            <Button className="bg-[#66dd99] hover:bg-[#44cc88] text-black gap-2">
              <PenSquare className="w-4 h-4" />
              Neuer Beitrag
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {POST_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveFilter(type.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    activeFilter === type.id
                      ? "bg-[#66dd99] text-black"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#66dd99]" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <DailyInspiration />
          <SuccessStoriesSidebar />
          
          {/* Community Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#66dd99]" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">2.847</div>
                <div className="text-xs text-slate-500">Mitglieder</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#66dd99]">127</div>
                <div className="text-xs text-slate-500">Gerade online</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

