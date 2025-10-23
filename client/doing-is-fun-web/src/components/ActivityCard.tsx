import ExpandableCard from "./ui/ExpandableCard";
import LogActivity from "./LogActivity";
import ActivityChart from "./ActivityChart";

export default function ActivityCard() {
    const summary = (
        <>
            <p>Track your custom activities and see your progress over time.</p>
            <p className="text-sm text-gray-400">Create personalized activities that matter to you!</p>
        </>
    );

    return (
        <ExpandableCard title="🎯 Activities" summary={summary}>
            <LogActivity />
            <ActivityChart />
        </ExpandableCard>
    );
}
