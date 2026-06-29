import { useGetGlobalLeaderboard } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetGlobalLeaderboard({ limit: 100 });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-slate-300" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="font-mono text-muted-foreground text-sm w-5 text-center inline-block">{rank}</span>;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return "text-red-500 font-bold";
    if (rating >= 2100) return "text-orange-500 font-bold";
    if (rating >= 1900) return "text-purple-500 font-bold";
    if (rating >= 1600) return "text-blue-500 font-semibold";
    if (rating >= 1400) return "text-emerald-500 font-semibold";
    return "text-muted-foreground";
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
        <p className="text-muted-foreground mt-1">The top competitive programmers on CodeNexus.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Rating</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Problems Solved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 15 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right hidden sm:table-cell"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : leaderboard?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Leaderboard is empty.
                </TableCell>
              </TableRow>
            ) : (
              leaderboard?.map((entry) => (
                <TableRow key={entry.userId} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center">
                      {getRankIcon(entry.rank)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
                          {entry.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link href={`/profile/${entry.userId}`} className="font-medium hover:text-primary transition-colors flex items-center gap-1">
                        <span className={getRatingColor(entry.score)}>{entry.username}</span>
                        {entry.score >= 2400 && <Star className="h-3 w-3 text-red-500 fill-red-500" />}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    <span className={getRatingColor(entry.score)}>{entry.score}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground hidden sm:table-cell">
                    {entry.solvedCount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}