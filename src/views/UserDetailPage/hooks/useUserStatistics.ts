import { User } from "src/types/user"


export const useUserStatistics = (
  users: User[],
) => {
  return {
    total: users.length,

    active: users.filter(
      (x) => x.status === 2,
    ).length,

    pending: users.filter(
      (x) => x.status === 1,
    ).length,

    inactive: users.filter(
      (x) => x.status === 3,
    ).length,

    locked: users.filter(
      (x) => x.status === 4,
    ).length,
  }
}