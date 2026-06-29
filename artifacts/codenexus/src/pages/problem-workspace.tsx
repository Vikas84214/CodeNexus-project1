import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useGetProblem, useRunCode, useCreateSubmission } from "@workspace/api-client-react";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Send, CheckCircle2, XCircle, AlertTriangle, Clock, Activity, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProblemWorkspace() {
  const { id } = useParams<{ id: string }>();
  const problemId = parseInt(id || "1", 10);
  const { toast } = useToast();
  
  const { data: problem, isLoading: loadingProblem } = useGetProblem(problemId);
  const runMutation = useRunCode();
  const submitMutation = useCreateSubmission();

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<{ status?: string; output?: string; error?: string; verdict?: string; runtime?: number | null; memory?: number | null } | null>(null);
  
  // Set default code when problem loads
  useEffect(() => {
    if (problem?.starterCode && !code) {
      setCode(problem.starterCode[language] || "");
    }
  }, [problem, language]);

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    if (problem?.starterCode) {
      setCode(problem.starterCode[val] || "");
    }
  };

  const handleRun = () => {
    runMutation.mutate({
      data: { problemId, language, code, customInput: "" }
    }, {
      onSuccess: (res) => {
        setOutput({
          status: res.status,
          output: res.output,
          error: res.error,
          runtime: res.runtime
        });
      },
      onError: () => {
        toast({ title: "Run Failed", variant: "destructive" });
      }
    });
  };

  const handleSubmit = () => {
    const userStr = localStorage.getItem("codenexus_user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    submitMutation.mutate({
      data: { problemId, language, code, userId: user?.id }
    }, {
      onSuccess: (res) => {
        setOutput({
          status: "Submission Complete",
          verdict: res.verdict,
          runtime: res.runtime,
          memory: res.memory
        });
      },
      onError: () => {
        toast({ title: "Submission Failed", variant: "destructive" });
      }
    });
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-emerald-500 bg-emerald-500/10";
      case "Medium": return "text-yellow-500 bg-yellow-500/10";
      case "Hard": return "text-red-500 bg-red-500/10";
      default: return "";
    }
  };

  const getVerdictIcon = (verdict?: string) => {
    if (verdict === "Accepted") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (verdict === "Wrong Answer") return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] w-full">
      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-none border-t border-border">
        {/* LEFT PANE: Problem Description */}
        <ResizablePanel defaultSize={45} minSize={30} className="bg-card">
          <Tabs defaultValue="description" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-card/50 px-2">
              <TabsTrigger value="description" className="data-[state=active]:bg-muted">Description</TabsTrigger>
              <TabsTrigger value="hints" className="data-[state=active]:bg-muted">Hints</TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-muted">Submissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="flex-1 overflow-auto p-6 m-0 outline-none">
              {loadingProblem ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <div className="flex gap-2"><Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-24" /></div>
                  <Skeleton className="h-32 w-full mt-6" />
                </div>
              ) : problem ? (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-3">{problem.title}</h1>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className={`${getDifficultyColor(problem.difficulty)} border-0 font-medium`}>
                        {problem.difficulty}
                      </Badge>
                      {problem.isSolved && (
                        <div className="flex items-center text-emerald-500 gap-1 font-medium">
                          <CheckCircle2 className="h-4 w-4" /> Solved
                        </div>
                      )}
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {Math.round(problem.acceptanceRate * 100)}% Acceptance
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none text-muted-foreground">
                    <p>{problem.description}</p>
                  </div>

                  {problem.examples.map((ex, i) => (
                    <div key={i} className="space-y-2">
                      <h3 className="font-semibold text-foreground">Example {i + 1}:</h3>
                      <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-1">
                        <div><span className="text-primary/70 select-none">Input: </span>{ex.input}</div>
                        <div><span className="text-primary/70 select-none">Output: </span>{ex.output}</div>
                        {ex.explanation && <div><span className="text-primary/70 select-none">Explanation: </span>{ex.explanation}</div>}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Constraints:</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground font-mono bg-muted/30 p-4 rounded-md space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {problem.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">{tag}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">Problem not found</div>
              )}
            </TabsContent>
            
            <TabsContent value="hints" className="flex-1 overflow-auto p-6 m-0 outline-none">
              <div className="space-y-4">
                {problem?.hints?.map((hint, i) => (
                  <div key={i} className="p-4 rounded-md border border-border bg-muted/20 text-sm">
                    <span className="font-semibold mr-2">Hint {i + 1}:</span>
                    <span className="text-muted-foreground">{hint}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle className="w-1.5 bg-border hover:bg-primary/50 transition-colors" />

        {/* RIGHT PANE: Code Editor & Output */}
        <ResizablePanel defaultSize={55} className="flex flex-col bg-[#1e1e1e]">
          {/* Editor Header */}
          <div className="h-12 border-b border-border bg-card/80 px-4 flex items-center justify-between">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] h-8 bg-muted/50 border-0 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="go">Go</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleRun} disabled={runMutation.isPending || submitMutation.isPending} className="h-8 gap-1.5 bg-muted hover:bg-muted/80">
                {runMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Run
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={runMutation.isPending || submitMutation.isPending} className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Submit
              </Button>
            </div>
          </div>

          <ResizablePanelGroup direction="vertical" className="flex-1">
            {/* Code Area */}
            <ResizablePanel defaultSize={70}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 font-mono text-[14px] leading-relaxed bg-[#1e1e1e] text-slate-300 resize-none outline-none selection:bg-primary/30"
                spellCheck={false}
                data-testid="textarea-code"
              />
            </ResizablePanel>

            <ResizableHandle className="h-1.5 bg-border hover:bg-primary/50 transition-colors" />

            {/* Output Area */}
            <ResizablePanel defaultSize={30} minSize={10} className="bg-card/50 flex flex-col">
              <div className="h-8 border-b border-border bg-card/80 px-4 flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Console Output
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {!output && (
                  <div className="text-muted-foreground/50 h-full flex items-center justify-center select-none">
                    Run or submit code to see output
                  </div>
                )}
                
                {output && (
                  <div className="space-y-4">
                    {output.verdict && (
                      <div className="flex items-center gap-2 text-lg font-bold">
                        {getVerdictIcon(output.verdict)}
                        <span className={
                          output.verdict === "Accepted" ? "text-emerald-500" :
                          output.verdict === "Wrong Answer" ? "text-red-500" : "text-yellow-500"
                        }>
                          {output.verdict}
                        </span>
                      </div>
                    )}
                    
                    {output.status && !output.verdict && (
                      <div className="font-semibold text-muted-foreground">{output.status}</div>
                    )}
                    
                    {(output.runtime !== undefined || output.memory !== undefined) && (
                      <div className="flex gap-6 text-muted-foreground text-xs bg-muted/30 p-2 rounded-md inline-flex">
                        {output.runtime !== null && output.runtime !== undefined && (
                          <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> Runtime: {output.runtime}ms</div>
                        )}
                        {output.memory !== null && output.memory !== undefined && (
                          <div className="flex items-center gap-1"><Activity className="h-3 w-3" /> Memory: {output.memory}MB</div>
                        )}
                      </div>
                    )}

                    {output.output && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Stdout</div>
                        <div className="bg-black/50 text-slate-300 p-3 rounded-md break-all whitespace-pre-wrap">
                          {output.output}
                        </div>
                      </div>
                    )}

                    {output.error && (
                      <div>
                        <div className="text-xs text-red-500/80 mb-1 uppercase tracking-wider">Error</div>
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-md break-all whitespace-pre-wrap border border-red-500/20">
                          {output.error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}