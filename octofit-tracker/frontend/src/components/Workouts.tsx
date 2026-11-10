import { CapabilityCard } from './CapabilityCard.js';
import { apiPaths, getJson } from '../api/client.js';

const loadWorkouts = () => getJson<unknown>(apiPaths.workoutSuggestions('mona@example.com'));

export default function Workouts() {
  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    load={loadWorkouts}
    collection="suggestions"
    emptyText="No workout suggestions available."
  />;
}
