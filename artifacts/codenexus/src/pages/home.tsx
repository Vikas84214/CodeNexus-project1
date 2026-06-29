import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Trophy, Code2, Users, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: recentActivity, isLoading: loadingActivity } = useGetRecentActivity({ limit: 5 });

  const getVerdictColor = (verdict: string) => {
    if (verdict === "Accepted") return "text-emerald-500";
    if (verdict === "Wrong Answer") return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Master algorithms.<br />
            <span className="text-primary">Dominate interviews.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            The elite platform for serious developers to hone their problem-solving skills with a curated collection of coding challenges.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/problems">
              <Button size="lg" className="gap-2 font-semibold">
                Start Coding <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Problems", value: summary?.totalProblems, icon: Code2, loading: loadingSummary },
          { title: "Active Users", value: summary?.totalUsers, icon: Users, loading: loadingSummary },
          { title: "Total Submissions", value: summary?.totalSubmissions, icon: Activity, loading: loadingSummary },
          { title: "Active Contests", value: summary?.activeContests, icon: Trophy, loading: loadingSummary },
        ].map((stat, i) => (
          <Card key={i} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stat.value?.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Challenge Placeholder */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Daily Challenge</CardTitle>
            <CardDescription>Solve the problem of the day to maintain your streak.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-12 text-center border-t border-border/50 bg-muted/20">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Code2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Two Sum</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <span className="text-emerald-500 font-medium">Easy</span>
              <span>•</span>
              <span>48.5% Acceptance</span>
            </div>
            <Link href="/problems/1">
              <Button>Solve Challenge</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Global Activity</CardTitle>
            <CardDescription>Recent submissions from around the world.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between text-sm p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                        {activity.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">
                          <Link href={`/profile/${activity.userId}`} className="hover:text-primary transition-colors">
                            {activity.username}
                          </Link>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <span>solved</span>
                          <Link href={`/problems/${activity.problemId}`} className="hover:underline">
                            {activity.problemTitle}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-mono text-xs font-medium ${getVerdictColor(activity.verdict)}`}>
                        {activity.verdict}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {activity.language}
                      </span>
                    </div>
                  </div>
                ))}
                {recentActivity?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}