import { useGetUserStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, Target, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const userStr = localStorage.getItem("codenexus_user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  const { data: stats, isLoading } = useGetUserStats(user?.id, { 
    query: { enabled: !!user?.id } 
  });

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
          <Link href="/login" className="text-primary hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  const totalSolved = (stats?.solvedEasy || 0) + (stats?.solvedMedium || 0) + (stats?.solvedHard || 0);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, <span className="text-foreground font-medium">{user.username}</span>.</p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-card py-2 px-4 shadow-sm flex items-center gap-3">
            <Flame className="text-orange-500 h-5 w-5" />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Streak</div>
              <div className="text-xl font-bold leading-none">{stats?.streak || 0} <span className="text-sm font-normal text-muted-foreground">days</span></div>
            </div>
          </Card>
          <Card className="bg-card py-2 px-4 shadow-sm flex items-center gap-3">
            <Star className="text-primary h-5 w-5" />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rating</div>
              <div className="text-xl font-bold leading-none text-primary">{stats?.rating || 0}</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solved Problems Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Problem Solving Progress</CardTitle>
            <CardDescription>Your solved problems broken down by difficulty</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * Math.min(totalSolved/1000, 1))} className="text-primary transition-all duration-1000 ease-in-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{totalSolved}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Solved</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span className="text-emerald-500">Easy</span>
                      <span className="text-foreground">{stats?.solvedEasy || 0} <span className="text-muted-foreground font-normal">/ 500</span></span>
                    </div>
                    <Progress value={((stats?.solvedEasy || 0) / 500) * 100} className="h-2 bg-emerald-500/10 [&>div]:bg-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span className="text-yellow-500">Medium</span>
                      <span className="text-foreground">{stats?.solvedMedium || 0} <span className="text-muted-foreground font-normal">/ 800</span></span>
                    </div>
                    <Progress value={((stats?.solvedMedium || 0) / 800) * 100} className="h-2 bg-yellow-500/10 [&>div]:bg-yellow-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span className="text-red-500">Hard</span>
                      <span className="text-foreground">{stats?.solvedHard || 0} <span className="text-muted-foreground font-normal">/ 300</span></span>
                    </div>
                    <Progress value={((stats?.solvedHard || 0) / 300) * 100} className="h-2 bg-red-500/10 [&>div]:bg-red-500" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
              <CardDescription>Submissions by language</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : stats?.languageStats?.length ? (
                <div className="space-y-3">
                  {stats.languageStats.map((lang) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <span className="font-mono text-sm capitalize">{lang.language}</span>
                      <span className="text-sm font-medium">{lang.count} subs</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6">No language data yet</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <Target className="h-10 w-10 text-primary mx-auto" />
              <div>
                <h3 className="font-bold text-lg">Next Challenge</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Keep your streak alive by solving today's challenge.</p>
              </div>
              <Link href="/problems/1" className="w-full">
                <Button className="w-full">Solve Now</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}