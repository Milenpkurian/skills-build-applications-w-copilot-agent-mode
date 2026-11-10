import { CapabilityCard } from './CapabilityCard.js';
import { apiPaths, getJson } from '../api/client.js';

const loadTeams = () => getJson<unknown>(apiPaths.teams);

export default function Teams() {
  return <CapabilityCard
    title="Teams"
    description="Manage teams and members."
    load={loadTeams}
    collection="teams"
    emptyText="No teams available."
  />;
}
