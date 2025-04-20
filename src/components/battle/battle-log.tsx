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

export function BattleLog({ logs }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const organizedLogs: Logs = logs.reduce((acc: Logs, next) => {
    let item = acc[next.turn.turn];
    if (item) item.logs.push(next);
    else item = { turn: next.turn.turn, logs: [next] };

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
        <ScrollArea className="h-[200px] pr-4" ref={scrollRef}>
          {organizedLogs.map((oLogs) => (
            <div key={oLogs.turn}>
              <p className="font-medium">Turn {oLogs.turn}</p>
              <p className="mb-1 text-sm">
                {oLogs.logs.map((log) => (
                  <p key={log.id}>
                    {new Date(log.created_at).toUTCString()} {log.message}
                  </p>
                ))}
              </p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
