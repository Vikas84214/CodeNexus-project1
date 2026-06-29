import { useParams } from "wouter";
import { useGetUser, useGetUserStats, useGetUserSubmissions } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, Star, Activity, MapPin, Link as LinkIcon, CalendarDays } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || "1", 10);

  const { data: user, isLoading: loadingUser } = useGetUser(userId);
  const { data: stats, isLoading: loadingStats } = useGetUserStats(userId);
  const { data: submissions, isLoading: loadingSubs } = useGetUserSubmissions(userId, { query: { limit: 10 } } as any);

  const totalSolved = (stats?.solvedEasy || 0) + (stats?.solvedMedium || 0) + (stats?.solvedHard || 0);

  if (!loadingUser && !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      
      {/* Profile Header */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-b border-border/50"></div>
        <CardContent className="p-6 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
            <Avatar className="h-24 w-24 border-4 border-card bg-card">
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {user?.username?.substring(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pb-2">
              {loadingUser ? (
                <Skeleton className="h-8 w-48 mb-2" />
              ) : (
                <h1 className="text-3xl font-bold">{user?.username}</h1>
              )}
              {user?.bio && <p className="text-muted-foreground mt-1 max-w-2xl">{user.bio}</p>}
            </div>

            <div className="flex gap-4 pb-2 w-full md:w-auto">
              <div className="text-center px-4 py-2 bg-muted/30 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Rank</div>
                <div className="font-mono font-bold text-lg">{user?.rank?.toLocaleString() || "-"}</div>
              </div>
              <div className="text-center px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Rating</div>
                <div className="font-mono font-bold text-lg text-primary">{user?.rating || "-"}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {user?.createdAt && (
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" /> Joined {format(new Date(user.createdAt), "MMM yyyy")}
              </div>
            )}
            {user?.badges?.map(badge => (
              <Badge key={badge} variant="outline" className="bg-muted font-normal text-xs">{badge}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stats */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Solved Problems</h3>
              {loadingStats ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-end pb-4 border-b border-border/50">
                    <div className="text-3xl font-bold">{totalSolved}</div>
                    <div className="text-sm text-muted-foreground mb-1">total</div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-0 font-normal">Easy</Badge>
                      <span className="font-mono text-sm font-medium">{stats?.solvedEasy || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-0 font-normal">Medium</Badge>
                      <span className="font-mono text-sm font-medium">{stats?.solvedMedium || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-0 font-normal">Hard</Badge>
                      <span className="font-mono text-sm font-medium">{stats?.solvedHard || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Submissions */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Recent Submissions
              </h3>
              
              {loadingSubs ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : submissions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-md">
                  No recent submissions found.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions?.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/30 transition-colors">
                      <div className="min-w-0 flex-1">
                        <Link href={`/problems/${sub.problemId}`} className="font-medium hover:text-primary transition-colors truncate block">
                          {sub.problemTitle || `Problem #${sub.problemId}`}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="font-mono">{formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}</span>
                          <span>•</span>
                          <span className="font-mono uppercase">{sub.language}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4 text-right">
                        <div className={`text-sm font-bold ${sub.verdict === "Accepted" ? "text-emerald-500" : sub.verdict === "Wrong Answer" ? "text-red-500" : "text-yellow-500"}`}>
                          {sub.verdict}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}