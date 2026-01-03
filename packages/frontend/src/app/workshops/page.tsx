"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Lock,
  CheckCircle2,
  Play,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageButton } from "@/components/messaging/MessageButton";
import { WorkshopGroupChatButton } from "@/components/messaging/WorkshopGroupChatButton";
import { useAuth } from "@/providers/AuthProvider";

// Workshop types
const WORKSHOP_TYPES = {
  live: { label: "Live Workshop", color: "bg-blue-500", icon: Video },
  circle: { label: "LEBENSENERGIE Circle", color: "bg-purple-500", icon: Users },
  mentoring: { label: "1-zu-1 Mentoring", color: "bg-amber-500", icon: Crown },
};

// Mock workshops
const MOCK_WORKSHOPS = [
  {
    id: "1",
    title: "Morgenroutine Masterclass",
    description: "Lerne, wie du eine energiegeladene Morgenroutine aufbaust, die zu deinem Leben passt.",
    type: "live",
    scheduledAt: "2026-01-10T10:00:00Z",
    duration: 60,
    hostName: "Dr. Sarah Weber",
    hostId: "host-sarah-weber",
    hostAvatar: null,
    maxParticipants: 12,
    currentParticipants: 8,
    requiredTier: "resilienz",
    hasAccess: false,
    isBooked: false,
    status: "scheduled",
  },
  {
    id: "2",
    title: "Stress-Regulation für Fortgeschrittene",
    description: "Tiefgehende Techniken zur Stressregulation und emotionalen Balance.",
    type: "live",
    scheduledAt: "2026-01-12T18:00:00Z",
    duration: 90,
    hostName: "Marcus Keller",
    hostId: "host-marcus-keller",
    hostAvatar: null,
    maxParticipants: 12,
    currentParticipants: 12,
    requiredTier: "resilienz",
    hasAccess: false,
    isBooked: false,
    status: "scheduled",
  },
  {
    id: "3",
    title: "LEBENSENERGIE Circle #23",
    description: "Wöchentlicher Austausch in kleiner Gruppe. Teile deine Erfahrungen und lerne von anderen.",
    type: "circle",
    scheduledAt: "2026-01-08T19:00:00Z",
    duration: 90,
    hostName: "Julia Reich",
    hostId: "host-julia-reich",
    hostAvatar: null,
    maxParticipants: 8,
    currentParticipants: 5,
    requiredTier: "resilienz",
    hasAccess: true,
    isBooked: true,
    status: "scheduled",
  },
  {
    id: "4",
    title: "Energie-Coaching mit Dr. Weber",
    description: "Persönliches 1-zu-1 Coaching für deine individuelle LEBENSENERGIE Journey.",
    type: "mentoring",
    scheduledAt: "2026-01-15T14:00:00Z",
    duration: 30,
    hostName: "Dr. Sarah Weber",
    hostId: "host-sarah-weber",
    hostAvatar: null,
    maxParticipants: 1,
    currentParticipants: 0,
    requiredTier: "resilienz",
    hasAccess: true,
    isBooked: false,
    status: "scheduled",
  },
];

// Mock user tier
const USER_TIER: "lebensenergie" | "resilienz" | "free" = "lebensenergie";

// Workshop Card
function WorkshopCard({ workshop }: { workshop: typeof MOCK_WORKSHOPS[0] }) {
  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);
  const config = WORKSHOP_TYPES[workshop.type as keyof typeof WORKSHOP_TYPES];
  const Icon = config.icon;
  
  // Don't show message button if user is the host
  const isOwnWorkshop = user?.id === workshop.hostId;
  
  const date = new Date(workshop.scheduledAt);
  const spotsLeft = workshop.maxParticipants - workshop.currentParticipants;
  const isFull = spotsLeft <= 0;
  const isPast = date < new Date();

  const handleBook = async () => {
    setIsBooking(true);
    // API call would go here
    setTimeout(() => setIsBooking(false), 1000);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      !workshop.hasAccess && "opacity-75",
      workshop.isBooked && "ring-2 ring-[#66dd99]"
    )}>
      <div className={cn("h-1", config.color)} />
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            config.color, "bg-opacity-20"
          )}>
            <Icon className={cn("w-6 h-6", config.color.replace("bg-", "text-"))} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full text-white",
                config.color
              )}>
                {config.label}
              </span>
              {workshop.isBooked && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#66dd99] text-black">
                  ✓ Gebucht
                </span>
              )}
              {!workshop.hasAccess && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  RESILIENZ
                </span>
              )}
            </div>
            <h3 className="font-semibold text-slate-900">{workshop.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4">{workshop.description}</p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4" />
            {date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4" />
            {date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Video className="w-4 h-4" />
            {workshop.duration} Minuten
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="w-4 h-4" />
            {isFull ? (
              <span className="text-red-500">Ausgebucht</span>
            ) : (
              <span>{spotsLeft} Plätze frei</span>
            )}
          </div>
        </div>

        {/* Host */}
        <div className="flex items-center justify-between mb-4 p-2 rounded-lg bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#66dd99] to-[#44cc88] flex items-center justify-center text-white text-xs font-semibold">
              {workshop.hostName.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">{workshop.hostName}</div>
              <div className="text-xs text-slate-500">Host</div>
            </div>
          </div>
          {!isOwnWorkshop && (
            <MessageButton
              targetUserId={workshop.hostId}
              targetUserName={workshop.hostName}
              postTitle={workshop.title}
              postType="workshop"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            />
          )}
        </div>

        {/* Action */}
        {workshop.isBooked ? (
          <div className="space-y-2">
            <Button variant="outline" className="w-full gap-2" disabled={isPast}>
              <Video className="w-4 h-4" />
              {isPast ? "Aufnahme ansehen" : "Zum Meeting"}
            </Button>
            {/* Gruppen-Chat für gebuchte Workshops */}
            <WorkshopGroupChatButton
              workshopId={workshop.id}
              workshopTitle={workshop.title}
              participantIds={[]} // TODO: Load from API
              variant="outline"
              size="default"
              className="w-full"
            />
          </div>
        ) : !workshop.hasAccess ? (
          <Button className="w-full gap-2 bg-slate-900 hover:bg-slate-800">
            <Crown className="w-4 h-4" />
            RESILIENZ freischalten
          </Button>
        ) : isFull ? (
          <Button variant="outline" className="w-full" disabled>
            Ausgebucht
          </Button>
        ) : (
          <Button 
            className="w-full gap-2 bg-[#66dd99] hover:bg-[#44cc88] text-black"
            onClick={handleBook}
            disabled={isBooking}
          >
            {isBooking ? (
              <span className="animate-pulse">Wird gebucht...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Jetzt buchen
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Calendar View (simplified)
function WorkshopCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#66dd99]" />
            Kalender
          </CardTitle>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-1 rounded hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-1 rounded hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simplified calendar grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(day => (
            <div key={day} className="py-2 text-slate-400 font-medium">{day}</div>
          ))}
          {/* Sample calendar days */}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2; // Offset for month start
            const isToday = day === 3;
            const hasWorkshop = [8, 10, 12, 15].includes(day);
            
            if (day < 1 || day > 31) {
              return <div key={i} className="py-2 text-slate-200">{day > 31 ? day - 31 : 31 + day}</div>;
            }
            
            return (
              <div 
                key={i} 
                className={cn(
                  "py-2 rounded cursor-pointer transition-colors relative",
                  isToday && "bg-[#66dd99] text-black font-bold",
                  hasWorkshop && !isToday && "font-medium",
                  !isToday && "hover:bg-slate-100"
                )}
              >
                {day}
                {hasWorkshop && (
                  <div className={cn(
                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                    isToday ? "bg-black" : "bg-[#66dd99]"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// My Bookings
function MyBookings() {
  const bookedWorkshops = MOCK_WORKSHOPS.filter(w => w.isBooked);
  
  if (bookedWorkshops.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#66dd99]" />
          Meine Buchungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookedWorkshops.map(workshop => {
          const date = new Date(workshop.scheduledAt);
          return (
            <div key={workshop.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#66dd99]/10 border border-[#66dd99]/30">
              <div className="w-10 h-10 rounded-lg bg-[#66dd99]/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-[#66dd99]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-900 truncate">{workshop.title}</div>
                <div className="text-xs text-slate-500">
                  {date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })} 
                  {" "}um {date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-[#66dd99]">
                <Play className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Upgrade Banner
function UpgradeBanner() {
  if (USER_TIER === "resilienz") return null;

  return (
    <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Upgrade auf RESILIENZ</h3>
            <p className="text-white/80 text-sm mb-4">
              Erhalte Zugang zu allen Live-Workshops, Circles und 1-zu-1 Mentoring Sessions.
            </p>
            <Button className="bg-white text-purple-600 hover:bg-white/90">
              Jetzt upgraden – €79/Monat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Workshops Page
export default function WorkshopsPage() {
  const [filter, setFilter] = useState<"all" | "live" | "circle" | "mentoring">("all");
  
  const filteredWorkshops = filter === "all" 
    ? MOCK_WORKSHOPS 
    : MOCK_WORKSHOPS.filter(w => w.type === filter);

  return (
    <div className="container mx-auto py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Live Workshops</h1>
            <p className="text-slate-500">
              Interaktive Sessions für tieferes Lernen und echte Transformation
            </p>
          </div>

          {/* Upgrade Banner */}
          <UpgradeBanner />

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "Alle" },
              { id: "live", label: "Live Workshops" },
              { id: "circle", label: "Circles" },
              { id: "mentoring", label: "Mentoring" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilter(type.id as typeof filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  filter === type.id
                    ? "bg-[#66dd99] text-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Workshops Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredWorkshops.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <WorkshopCard workshop={workshop} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <MyBookings />
          <WorkshopCalendar />
          
          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Diese Woche</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#66dd99]">4</div>
                <div className="text-xs text-slate-500">Workshops</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">38</div>
                <div className="text-xs text-slate-500">Plätze frei</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

