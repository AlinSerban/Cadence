import { useGetTodaySummaryQuery } from "../store/api";

export default function TodaySummaryCard() {
    const { data, isFetching, isError, refetch } = useGetTodaySummaryQuery();

    if (isFetching) {
        return (
            <div className="rounded-2xl bg-zinc-900/60 p-4">
                <div className="animate-pulse h-6 w-32 rounded bg-zinc-800 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-lg bg-zinc-800 h-16" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-2xl bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Today</h2>
                    <button
                        onClick={() => refetch()}
                        className="text-sm underline decoration-dotted"
                    >
                        retry
                    </button>
                </div>
                <p className="text-sm text-red-400">Couldn’t load today’s summary.</p>
            </div>
        );
    }

    const t = data.today;

    return (
        <div className="rounded-2xl bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Today</h2>
                <div className="flex items-center gap-3">
                    <span className="text-sm opacity-80">XP: {data.xp}</span>
                    <button
                        onClick={() => refetch()}
                        className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
                    >
                        refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Activities (min)" value={t.activitiesMinutes} />
                <Stat label="Activities Count" value={t.activitiesCount} />
                <Stat label="Goals Completed" value={t.goalsCompleted} />
                <Stat label="Streak (days)" value={t.streak} />
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg bg-zinc-800 p-3">
            <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
            <div className="text-2xl font-semibold">{value}</div>
        </div>
    );
}
