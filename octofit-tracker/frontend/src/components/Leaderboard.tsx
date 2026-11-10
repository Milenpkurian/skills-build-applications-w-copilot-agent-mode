import { CapabilityCard } from './CapabilityCard.js';
import { apiPaths, getJson } from '../api/client.js';

const loadLeaderboard = () => getJson<unknown>(apiPaths.leaderboard);

export default function Leaderboard() {
  return <CapabilityCard
    title="Leaderboard"
    description="Compare team point totals."
    load={loadLeaderboard}
    collection="leaderboard"
    emptyText="No rankings available."
  />;
}
