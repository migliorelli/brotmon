import { createClient } from "@/lib/supabase/server";
import { BattleService } from "@/services/battle-service";
import { ApiTrainer } from "@/types/trainer.type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { trainer } = (await req.json()) as {
      trainer: ApiTrainer;
    };

    if (
      !trainer ||
      !trainer.username ||
      !trainer.emoji ||
      !trainer.brotmons ||
      trainer.brotmons.length === 0
    ) {
      return NextResponse.json({ error: "Invalid trainer data" }, { status: 400 });
    }

    // check if the trainer has more than 3 brotmons or less than 1 brotmon
    if (trainer.brotmons.length < 1 || trainer.brotmons.length > 3) {
      return NextResponse.json(
        { error: "Trainer can have between 1 and 3 brotmons" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const battleService = new BattleService(supabase);

    const { trainer_id, error: trainerError } = await battleService.createTrainer(trainer);
    if (trainerError !== null) {
      return NextResponse.json({ error: trainerError }, { status: 500 });
    }

    if (!trainer_id) {
      return NextResponse.json({ error: "Error creating trainer" }, { status: 500 });
    }

    const { battle_id, error: battleError } = await battleService.createBattle(trainer_id);
    if (battleError !== null) {
      return NextResponse.json({ error: battleError }, { status: 500 });
    }

    const response = NextResponse.json({ battle_id }, { status: 200 });
    response.cookies.set("trainer_id", trainer_id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error creating battle:", error);
    return NextResponse.json({ error: "Failed to create battle" }, { status: 500 });
  }
}
