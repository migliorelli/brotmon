import battleService from "@/services/battle-service";

export default async function Page() {
  const battles = battleService.getAllBattles();
  console.log(battles)

  return (
    <div>
      {battles.map((b: any) => (
        <div key={b.id}>{JSON.stringify(b, null, 2)}</div>
      ))}
    </div>
  );
}
