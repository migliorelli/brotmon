import { createClient } from "@/lib/supabase/server";
import { BattleService } from "@/services/battle-service";
import { BattleAction, BattleActionPayload } from "@/types/battle-service.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ battle_id: string }> },
) {
  try {
    const { battle_id } = await params;

    const trainer_id = req.cookies.get("trainer_id");
    if (!trainer_id || !trainer_id.value) {
      return NextResponse.json({ error: "Access unauthorized" }, { status: 401 });
    }

    const { data } = (await req.json()) as {
      data: BattleActionPayload;
    };

    if (!battle_id || data.action === null || data.action === undefined) {
      console.error("Missing required fields:", data);
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Object.values(BattleAction).includes(data.action)) {
      console.error("Invalid action:", data);
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const supabase = await createClient();
    const battleService = new BattleService(supabase);

    const { error } = await battleService.performAction(battle_id, trainer_id.value, data);

    if (error !== null) {
      console.error(error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error performing battle action:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
