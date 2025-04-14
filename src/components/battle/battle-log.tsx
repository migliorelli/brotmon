import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Battle } from "@/types/old/battle.type";
import { useEffect, useRef } from "react";

interface BattleLogProps {
  logs: Battle["logs"];
}

export function BattleLog({ logs }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle>Battle Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
          {logs.map((turnLogs, turn) => (
            <div key={turn} className="mb-4">
              <h4 className="text-muted-foreground mb-2 text-sm font-semibold">
                Turn {turn + 1}
              </h4>
              {turnLogs.map((log, i) => (
                <p key={i} className="mb-1 text-sm">
                  {log.message}
                </p>
              ))}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
