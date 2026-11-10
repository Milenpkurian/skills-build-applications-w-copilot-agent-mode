import { CapabilityCard } from './CapabilityCard.js';
import { apiPaths } from '../api/client.js';

export default function Workouts() {
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." path={apiPaths.workoutSuggestions('mona@example.com')} collection="suggestions" />;
}
