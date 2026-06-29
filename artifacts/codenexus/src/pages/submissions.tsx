import { useListSubmissions } from "@workspace/api-client-react";
import { Link } from "wouter";
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
import { formatDistanceToNow } from "date-fns";

export default function Submissions() {
  const userStr = localStorage.getItem("codenexus_user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  const { data: submissions, isLoading } = useListSubmissions(
    { userId: user?.id, limit: 50 },
    { query: { enabled: !!user?.id } }
  );

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "Accepted": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Accepted</Badge>;
      case "Wrong Answer": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Wrong Answer</Badge>;
      case "Time Limit Exceeded": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">Time Limit</Badge>;
      default: return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">{verdict}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to view your submissions.</p>
          <Link href="/login" className="text-primary hover:underline font-medium">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
        <p className="text-muted-foreground mt-1">History of your recent problem attempts.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Time Submitted</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead>Runtime</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Language</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : submissions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  You haven't made any submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              submissions?.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/problems/${sub.problemId}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {sub.problemTitle || `Problem #${sub.problemId}`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {getVerdictBadge(sub.verdict)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {sub.runtime ? `${sub.runtime} ms` : "N/A"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {sub.memory ? `${sub.memory} MB` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs bg-muted/50 border-border">
                      {sub.language}
                    </Badge>
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