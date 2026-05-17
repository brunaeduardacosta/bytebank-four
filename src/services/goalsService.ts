// src/services/goalsService.ts

export interface GoalDTO {
  id?: string;
  title: string;
  target: number;
  current: number;
  color: string;
}

export interface Goal extends GoalDTO {
  id: string;
}

/**
 * Simula criação de meta (futuro: API ou AsyncStorage)
 */
export async function addGoalService(goal: GoalDTO): Promise<Goal> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGoal: Goal = {
        id: String(Date.now()),
        ...goal,
      };

      resolve(newGoal);
    }, 300);
  });
}

/**
 * Simula atualização de meta
 */
export async function updateGoalService(
  id: string,
  goal: GoalDTO
): Promise<Goal> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedGoal: Goal = {
        id,
        ...goal,
      };

      resolve(updatedGoal);
    }, 300);
  });
}


export async function deleteGoalService(id: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(id);
    }, 300);
  });
}

/**
 * Simula busca de metas (futuro backend / AsyncStorage)
 */
export async function getGoalsService(): Promise<Goal[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 300);
  });
}