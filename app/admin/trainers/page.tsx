import { getTrainers } from "@/lib/content";
import TrainerEditor from "./TrainerEditor";
import TrainerCreate from "./TrainerCreate";

export const dynamic = "force-dynamic";

export default async function AdminTrainersPage() {
  const trainers = await getTrainers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">TRAINERS</h1>
          <p className="text-sm text-neutral-500">Profiles shown on the Training page and booking flow</p>
        </div>
        <TrainerCreate />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {trainers.map((t) => (
          <TrainerEditor key={t.id} trainer={t} />
        ))}
      </div>
    </div>
  );
}
