import { createClient } from "@/lib/supabase/server";
import { BattleService } from "@/services/battle-service";
import { ApiTrainer } from "@/types/trainer.type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ battle_id: string }> },
) {
  try {
    const { battle_id } = await params;
    const { trainer } = (await req.json()) as {
      trainer: ApiTrainer;
    };

    if (!battle_id) {
      return NextResponse.json({ error: "Battle ID is required" }, { status: 400 });
    }

    if (
      !trainer ||
      !trainer.username ||
      !trainer.emoji ||
      !trainer.brotmons ||
      trainer.brotmons.length === 0
    ) {
      return NextResponse.json({ error: "Invalid trainer data" }, { status: 400 });
    }

    // check if the trainer has more than 3 brotmons
    if (trainer.brotmons.length > 3) {
      return NextResponse.json({ error: "Trainer can have at most 3 Brotmons" }, { status: 400 });
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

    const { error: joinError } = await battleService.joinBattle(battle_id, trainer_id);
    if (joinError !== null) {
      return NextResponse.json({ error: "Error joining battle room" }, { status: 500 });
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
    return NextResponse.json({ error: "Error creating battle" }, { status: 500 });
  }
}
