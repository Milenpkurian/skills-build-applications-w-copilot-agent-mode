import { CapabilityCard } from './CapabilityCard.js';
import { apiPaths } from '../api/client.js';

export default function Teams() {
  return <CapabilityCard title="Teams" description="Manage teams and members." path={apiPaths.teams} collection="teams" />;
}
