import { CapabilityCard } from './CapabilityCard.js';
import { apiPaths } from '../api/client.js';

export default function Activities() {
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." path={apiPaths.activities} collection="activities" />;
}
