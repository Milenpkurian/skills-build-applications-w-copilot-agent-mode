import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    !mongoose.isValidObjectId(userId) ||
    typeof teamId !== 'string' ||
    !mongoose.isValidObjectId(teamId) ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw Object.assign(new Error('Activity input is invalid'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 400 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof mascot !== 'string' ||
    !mascot.trim() ||
    !Array.isArray(members) ||
    members.some((member) => typeof member !== 'string' || !mongoose.isValidObjectId(member))
  ) {
    throw Object.assign(new Error('Team input is invalid'), { status: 400 });
  }

  const memberIds = [...new Set(members as string[])];
  if (memberIds.length) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== memberIds.length) {
      throw Object.assign(new Error('One or more team members were not found'), { status: 400 });
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map(({ _id }) => _id) } }).lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals.map(({ _id, totalPoints }, index) => ({
    teamName: teamNames.get(_id.toString()),
    totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [workouts, activity] = await Promise.all([
    Workout.find({ focus: user.fitnessGoal }).lean(),
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
  ]);

  const activityType = activity?.type ?? 'activity';
  return workouts.map((workout) => ({
    ...workout,
    reason: `Recommended based on your ${activityType} activity and ${user.fitnessGoal} goal`,
  }));
}

export { User };
