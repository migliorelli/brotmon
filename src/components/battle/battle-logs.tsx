import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Log } from "@/hooks/use-battle-connection";
import { useEffect, useRef } from "react";

type Logs = {
  logs: Log[];
  turn: number;
}[];

type BattleLogProps = {
  logs: Log[];
};

export function BattleLogs({ logs }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const organizedLogs: Logs = logs.reduce((acc: Logs, next) => {
    const item = acc[next.turn.turn];
    if (item) item.logs.push(next);
    else acc[next.turn.turn] = { turn: next.turn.turn, logs: [next] };

    return acc;
  }, [] as Logs);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Battle Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          {organizedLogs.map((oLogs) => (
            <div key={oLogs.turn}>
              <p className="font-medium">Turn {oLogs.turn}</p>
              <div className="mb-1 text-sm space-y-4">
                {oLogs.logs.map((log) => (
                  <p key={log.id}>
                    {new Date(log.created_at).toISOString()} {log.message}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
