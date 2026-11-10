import { CapabilityCard } from './CapabilityCard.js';
import { apiPaths, getJson } from '../api/client.js';

const loadActivities = () => getJson<unknown>(apiPaths.activities);

export default function Activities() {
  return <CapabilityCard
    title="Activities"
    description="Track student activity minutes and points."
    load={loadActivities}
    collection="activities"
    emptyText="No activities available."
  />;
}
