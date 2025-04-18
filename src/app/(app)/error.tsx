"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main className="flex flex-1">
      <Card className="m-auto max-w-lg text-center">
        <CardContent>
          <h1 className="text-3xl font-bold">⚠️ Error</h1>
          <p className="text-destructive my-4 text-lg">{error.message}</p>
          <Button variant="secondary" onClick={reset}>
            😖 Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
