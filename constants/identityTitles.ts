import { IdentityTitleKey, IdentityTitle } from '@/types';

export interface IdentityTitleDefinition {
  key: IdentityTitleKey;
  label: string;
  description: string;
}

export const IDENTITY_TITLES: Record<IdentityTitleKey, IdentityTitleDefinition> = {
  consistent_mover: {
    key: 'consistent_mover',
    label: 'Consistent Mover',
    description: 'Shows up regularly, even when motivation varies',
  },
  joint_first_athlete: {
    key: 'joint_first_athlete',
    label: 'Joint-First Athlete',
    description: 'Prioritizes joint health in training decisions',
  },
  resilient_builder: {
    key: 'resilient_builder',
    label: 'Resilient Builder',
    description: 'Returns after breaks without losing momentum',
  },
  pain_aware_performer: {
    key: 'pain_aware_performer',
    label: 'Pain-Aware Performer',
    description: 'Trains intelligently around discomfort',
  },
  recovery_focused: {
    key: 'recovery_focused',
    label: 'Recovery Focused',
    description: 'Values rest as part of progress',
  },
  mindful_trainer: {
    key: 'mindful_trainer',
    label: 'Mindful Trainer',
    description: 'Checks in with body state regularly',
  },
  adaptive_athlete: {
    key: 'adaptive_athlete',
    label: 'Adaptive Athlete',
    description: 'Adjusts training based on how the body feels',
  },
  steady_progress: {
    key: 'steady_progress',
    label: 'Steady Progress',
    description: 'Builds strength gradually over time',
  },
};

export const computeIdentityTitles = (params: {
  totalWorkouts: number;
  totalRecoverySessions: number;
  totalCheckIns: number;
  hasReturnedAfterBreak: boolean;
  avgPainLevel: number;
  workoutsWithLowPain: number;
  programsCreated: number;
  weeksActive: number;
}): IdentityTitle[] => {
  const {
    totalWorkouts,
    totalRecoverySessions,
    totalCheckIns,
    hasReturnedAfterBreak,
    avgPainLevel,
    workoutsWithLowPain,
    programsCreated,
    weeksActive,
  } = params;

  const titles: IdentityTitle[] = [];
  const now = new Date().toISOString();

  if (totalWorkouts >= 10 && weeksActive >= 2) {
    titles.push({ ...IDENTITY_TITLES.consistent_mover, unlockedAt: now });
  }

  if (avgPainLevel <= 4 && totalWorkouts >= 5) {
    titles.push({ ...IDENTITY_TITLES.joint_first_athlete, unlockedAt: now });
  }

  if (hasReturnedAfterBreak) {
    titles.push({ ...IDENTITY_TITLES.resilient_builder, unlockedAt: now });
  }

  if (workoutsWithLowPain >= 5 && avgPainLevel > 0) {
    titles.push({ ...IDENTITY_TITLES.pain_aware_performer, unlockedAt: now });
  }

  if (totalRecoverySessions >= 5) {
    titles.push({ ...IDENTITY_TITLES.recovery_focused, unlockedAt: now });
  }

  if (totalCheckIns >= 7) {
    titles.push({ ...IDENTITY_TITLES.mindful_trainer, unlockedAt: now });
  }

  if (programsCreated >= 1 || totalWorkouts >= 15) {
    titles.push({ ...IDENTITY_TITLES.adaptive_athlete, unlockedAt: now });
  }

  if (weeksActive >= 4 && totalWorkouts >= 12) {
    titles.push({ ...IDENTITY_TITLES.steady_progress, unlockedAt: now });
  }

  return titles;
};
