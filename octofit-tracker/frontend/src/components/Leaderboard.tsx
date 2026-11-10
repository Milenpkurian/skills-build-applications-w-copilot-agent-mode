import { CapabilityCard } from './CapabilityCard.js';
import { apiPaths } from '../api/client.js';

export default function Leaderboard() {
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." path={apiPaths.leaderboard} collection="leaderboard" />;
}
