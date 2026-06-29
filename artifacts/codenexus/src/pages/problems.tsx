import { useState } from "react";
import { Link } from "wouter";
import { 
  useListProblems,
  ProblemSummaryDifficulty,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, CheckCircle2 } from "lucide-react";

export default function Problems() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  
  // Debounce search would be ideal, but for now we'll just pass it
  const { data: problems, isLoading } = useListProblems({
    search: search || undefined,
    difficulty: difficulty !== "all" ? (difficulty as any) : undefined,
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "Hard": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problem Set</h1>
          <p className="text-muted-foreground mt-1">Practice algorithmic challenges to level up your skills.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search problems..." 
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-problems"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-card border-border" data-testid="select-difficulty">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-center">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="hidden md:table-cell">Acceptance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-5 rounded-full mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
                </TableRow>
              ))
            ) : problems?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No problems found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              problems?.map((problem) => (
                <TableRow key={problem.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center">
                    {problem.isSolved && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/problems/${problem.id}`} className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2" data-testid={`link-problem-${problem.id}`}>
                      {problem.title}
                      {problem.isPremium && <Badge variant="secondary" className="text-[10px] h-4 px-1">PREMIUM</Badge>}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-mono text-xs border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                    {Math.round(problem.acceptanceRate * 100)}%
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