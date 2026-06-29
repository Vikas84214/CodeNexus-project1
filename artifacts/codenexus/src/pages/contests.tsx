import { useListContests } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, Clock, CalendarDays } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function Contests() {
  const { data: contests, isLoading } = useListContests();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-primary/20 text-primary border-primary/30";
      case "ongoing": return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      case "finished": return "bg-muted text-muted-foreground border-border";
      default: return "";
    }
  };

  const upcomingContests = contests?.filter(c => c.status === "upcoming") || [];
  const ongoingContests = contests?.filter(c => c.status === "ongoing") || [];
  const pastContests = contests?.filter(c => c.status === "finished") || [];

  const ContestCard = ({ contest }: { contest: any }) => {
    const isOngoing = contest.status === "ongoing";
    const isUpcoming = contest.status === "upcoming";
    const targetDate = new Date(isUpcoming ? contest.startTime : contest.endTime);
    
    return (
      <Card className="bg-card hover:border-primary/50 transition-colors flex flex-col h-full">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className={getStatusColor(contest.status)}>
              {contest.status.toUpperCase()}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Users className="h-3 w-3" />
              {contest.participantCount.toLocaleString()}
            </div>
          </div>
          <CardTitle className="text-xl line-clamp-1">{contest.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {format(new Date(contest.startTime), "MMM d, yyyy • h:mm a")}
            </div>
            {(isOngoing || isUpcoming) && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className={`h-4 w-4 ${isOngoing ? "text-emerald-500" : "text-primary"}`} />
                <span className={isOngoing ? "text-emerald-500" : "text-primary"}>
                  {isUpcoming ? "Starts in " : "Ends in "} 
                  {formatDistanceToNow(targetDate)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/contests/${contest.id}`} className="w-full">
            <Button className="w-full" variant={isOngoing ? "default" : "secondary"}>
              {isOngoing ? "Enter Contest" : "View Details"}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Contests</h1>
        <p className="text-muted-foreground">Compete against others to improve your rating.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-48">
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-1/2 mb-2" /><Skeleton className="h-4 w-1/3" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {(ongoingContests.length > 0 || upcomingContests.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="text-primary h-5 w-5" /> 
                Active & Upcoming
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingContests.map(c => <ContestCard key={c.id} contest={c} />)}
                {upcomingContests.map(c => <ContestCard key={c.id} contest={c} />)}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">Past Contests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
              {pastContests.map(c => <ContestCard key={c.id} contest={c} />)}
            </div>
            {pastContests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-border">
                No past contests available.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}