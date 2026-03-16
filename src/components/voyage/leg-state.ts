import type { Leg } from "@/lib/data/legs";

export interface LegRemovalSnapshot {
  nextLegs: Leg[];
  removedLeg: Leg | null;
  removedIndex: number;
}

export function removeLegFromState(
  legs: Leg[],
  legId: string,
): LegRemovalSnapshot {
  const removedIndex = legs.findIndex((leg) => leg.id === legId);
  if (removedIndex === -1) {
    return {
      nextLegs: legs,
      removedLeg: null,
      removedIndex: -1,
    };
  }

  return {
    nextLegs: legs.filter((leg) => leg.id !== legId),
    removedLeg: legs[removedIndex],
    removedIndex,
  };
}

export function restoreLegToState(
  legs: Leg[],
  snapshot: LegRemovalSnapshot,
): Leg[] {
  if (!snapshot.removedLeg || snapshot.removedIndex === -1) {
    return legs;
  }

  if (legs.some((leg) => leg.id === snapshot.removedLeg?.id)) {
    return legs;
  }

  const nextLegs = [...legs];
  nextLegs.splice(
    Math.min(snapshot.removedIndex, nextLegs.length),
    0,
    snapshot.removedLeg,
  );
  return nextLegs;
}
