import { useParams } from "wouter";
import { useGetContest, useGetContestLeaderboard } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Clock, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function ContestDetail() {
  const { id } = useParams<{ id: string }>();
  const contestId = parseInt(id || "1", 10);

  const { data: contest, isLoading: loadingContest } = useGetContest(contestId);
  const { data: leaderboard, isLoading: loadingLeaderboard } = useGetContestLeaderboard(contestId);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "upcoming": return "bg-primary/20 text-primary border-primary/30";
      case "ongoing": return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      case "finished": return "bg-muted text-muted-foreground border-border";
      default: return "";
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-emerald-500";
      case "Medium": return "text-yellow-500";
      case "Hard": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
      <Link href="/contests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Contests
      </Link>

      {loadingContest ? (
        <div className="space-y-4 mb-8">
          <Skeleton className="h-10 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      ) : contest ? (
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-3">{contest.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline" className={getStatusColor(contest.status)}>
                  {contest.status.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {format(new Date(contest.startTime), "MMM d, HH:mm")} - {format(new Date(contest.endTime), "HH:mm")}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {contest.participantCount.toLocaleString()} Participants
                </div>
              </div>
            </div>
          </div>
          {contest.description && (
            <p className="text-muted-foreground mt-4 max-w-3xl">{contest.description}</p>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">Contest not found</div>
      )}

      <Tabs defaultValue="problems" className="w-full">
        <TabsList className="mb-6 bg-card border border-border">
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="leaderboard">Live Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="problems">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>Problem Title</TableHead>
                  <TableHead className="w-24">Difficulty</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingContest ? (
                  <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ) : contest?.problems?.map((problem, index) => (
                  <TableRow key={problem.id} className="hover:bg-muted/30">
                    <TableCell className="text-center font-mono text-muted-foreground">
                      {String.fromCharCode(65 + index)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/problems/${problem.id}`} className="font-medium hover:text-primary transition-colors">
                        {problem.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-muted-foreground">
                      {problem.difficulty === "Easy" ? 3 : problem.difficulty === "Medium" ? 5 : 8}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Penalty Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLeaderboard ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : leaderboard?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No participants yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboard?.map((entry) => (
                    <TableRow key={entry.userId} className="hover:bg-muted/30">
                      <TableCell className="text-center font-mono font-medium text-muted-foreground">
                        {entry.rank <= 3 ? <Trophy className={`h-4 w-4 mx-auto ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-slate-300' : 'text-amber-600'}`} /> : entry.rank}
                      </TableCell>
                      <TableCell>
                        <Link href={`/profile/${entry.userId}`} className="font-medium hover:text-primary transition-colors">
                          {entry.username}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-primary">
                        {entry.score}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell font-mono text-sm text-muted-foreground">
                        {entry.penaltyTime}m
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}