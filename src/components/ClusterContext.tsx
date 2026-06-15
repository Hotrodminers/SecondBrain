"use client";

import { createContext, useContext } from "react";

export interface ClusterInfo {
  setColorOf: Record<string, string>;
  setIdOf: Record<string, number>;
}

// Disjoint-set membership for the current board, computed live in Canvas and
// consumed by TaskNode so nodes recolor whenever the graph changes.
export const ClusterContext = createContext<ClusterInfo>({
  setColorOf: {},
  setIdOf: {},
});

export const useCluster = () => useContext(ClusterContext);
