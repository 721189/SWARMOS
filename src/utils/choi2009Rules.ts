/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SWARMOS Consensus Engine: Choi et al. (2009) CBBA Conflict Resolution Rules
 * Reference: "Consensus-Based Decentralized Auctions for Multiple Agent Task Allocation"
 * IEEE Transactions on Robotics, Vol. 25, No. 4, August 2009, Tables 1 & 2.
 */

import { ChoiAction, ChoiRuleLog } from '../types';

export interface ChoiDecisionResult {
  action: ChoiAction;
  ruleNumber: number;
  newWinningAgent: string | null;
  newWinningBid: number;
  explanation: string;
}

/**
 * Resolves conflict for task j when Receiver (i) receives a gossip packet from Sender (k).
 * 
 * @param receiverId - Agent i receiving gossip
 * @param senderId - Agent k sending gossip
 * @param taskId - Task j being evaluated
 * @param zi - Winner believed by receiver i for task j
 * @param yi - Highest bid recorded by receiver i for task j
 * @param zk - Winner believed by sender k for task j
 * @param yk - Highest bid recorded by sender k for task j
 * @param s_im - Timestamp receiver i has about winner m
 * @param s_km - Timestamp sender k has about winner m
 * @param s_ik - Timestamp receiver i has about sender k
 * @param s_kk - Current timestamp of sender k
 */
export function resolveChoi2009Conflict(
  receiverId: string,
  senderId: string,
  taskId: string,
  zi: string | null,
  yi: number,
  zk: string | null,
  yk: number,
  s_im: number = 0,
  s_km: number = 0,
  s_ik: number = 0,
  s_kk: number = 1
): ChoiDecisionResult {
  const i = receiverId;
  const k = senderId;
  const EPSILON = 0.0001;

  // Case 1: Receiver has no bid / unassigned (z_i == null)
  if (!zi || zi === 'NONE') {
    if (zk && zk !== 'NONE' && yk > 0) {
      return {
        action: 'UPDATE',
        ruleNumber: 1,
        newWinningAgent: zk,
        newWinningBid: yk,
        explanation: `Rule 1: Receiver ${i} had no winner for ${taskId}. Adopted sender ${k}'s winner (${zk}) with bid ${yk.toFixed(1)}.`,
      };
    }
    return {
      action: 'LEAVE',
      ruleNumber: 2,
      newWinningAgent: null,
      newWinningBid: 0,
      explanation: `Rule 2: Both ${i} and ${k} have no active bid for ${taskId}.`,
    };
  }

  // Case 2: Both agents agree on the winning agent (z_i == z_k == m)
  if (zi === zk) {
    const m = zi;
    if (m === i) {
      // Receiver thinks it won, sender also agrees receiver won
      return {
        action: 'LEAVE',
        ruleNumber: 3,
        newWinningAgent: i,
        newWinningBid: yi,
        explanation: `Rule 3: Both agree ${i} is winner for ${taskId}. Receiver confirms ownership.`,
      };
    } else if (m === k) {
      // Both agree sender k is winner. Check if sender has newer bid
      return {
        action: 'UPDATE',
        ruleNumber: 4,
        newWinningAgent: k,
        newWinningBid: yk,
        explanation: `Rule 4: Both agree ${k} is winner. Receiver updated bid to ${yk.toFixed(1)}.`,
      };
    } else {
      // Both agree a third party m is winner
      if (s_km > s_im || (s_km === s_im && yk > yi)) {
        return {
          action: 'UPDATE',
          ruleNumber: 5,
          newWinningAgent: m,
          newWinningBid: yk,
          explanation: `Rule 5: Third party ${m} won. Sender has newer info (t=${s_km} > ${s_im}). Bid updated to ${yk.toFixed(1)}.`,
        };
      }
      return {
        action: 'LEAVE',
        ruleNumber: 6,
        newWinningAgent: m,
        newWinningBid: yi,
        explanation: `Rule 6: Third party ${m} won. Receiver holds equal or fresher info. Retained bid ${yi.toFixed(1)}.`,
      };
    }
  }

  // Case 3: Receiver thinks itself won (z_i == i), sender thinks someone else won (z_k == m != i)
  if (zi === i) {
    if (zk === k) {
      // Direct competition between receiver i and sender k
      if (yk > yi + EPSILON) {
        return {
          action: 'UPDATE',
          ruleNumber: 9,
          newWinningAgent: k,
          newWinningBid: yk,
          explanation: `Rule 9: Outbid! Sender ${k} bid ${yk.toFixed(1)} > Receiver ${i} bid ${yi.toFixed(1)}. Ownership conceded to ${k}.`,
        };
      } else {
        return {
          action: 'LEAVE',
          ruleNumber: 10,
          newWinningAgent: i,
          newWinningBid: yi,
          explanation: `Rule 10: Receiver ${i} defended bid (${yi.toFixed(1)} >= ${yk.toFixed(1)}) against sender ${k}.`,
        };
      }
    } else if (zk === null || zk === 'NONE') {
      // Sender thinks no one won, but receiver knows it won
      return {
        action: 'LEAVE',
        ruleNumber: 11,
        newWinningAgent: i,
        newWinningBid: yi,
        explanation: `Rule 11: Receiver ${i} retains active bid ${yi.toFixed(1)} over sender ${k}'s null state.`,
      };
    } else {
      // Sender thinks third party m won
      if (yk > yi + EPSILON) {
        return {
          action: 'UPDATE',
          ruleNumber: 12,
          newWinningAgent: zk,
          newWinningBid: yk,
          explanation: `Rule 12: Third party ${zk} outbid ${i} (${yk.toFixed(1)} > ${yi.toFixed(1)}). Ownership transferred.`,
        };
      } else {
        return {
          action: 'LEAVE',
          ruleNumber: 13,
          newWinningAgent: i,
          newWinningBid: yi,
          explanation: `Rule 13: Receiver ${i} bid ${yi.toFixed(1)} holds precedence over third party ${zk} (${yk.toFixed(1)}).`,
        };
      }
    }
  }

  // Case 4: Receiver thinks sender won (z_i == k), sender thinks someone else won (z_k != k)
  if (zi === k) {
    if (zk === null || zk === 'NONE') {
      // Sender dropped task
      return {
        action: 'RESET',
        ruleNumber: 14,
        newWinningAgent: null,
        newWinningBid: 0,
        explanation: `Rule 14: Sender ${k} vacated task ${taskId}. Receiver ${i} reset winner to null for re-auction.`,
      };
    } else {
      // Sender updated to another agent
      return {
        action: 'UPDATE',
        ruleNumber: 15,
        newWinningAgent: zk,
        newWinningBid: yk,
        explanation: `Rule 15: Sender ${k} reassigned winner to ${zk} with bid ${yk.toFixed(1)}. Receiver updated.`,
      };
    }
  }

  // Case 5: Receiver thinks third party m won (z_i == m), sender has different view
  if (s_kk > s_ik) {
    if (yk > yi) {
      return {
        action: 'UPDATE',
        ruleNumber: 16,
        newWinningAgent: zk,
        newWinningBid: yk,
        explanation: `Rule 16: Sender ${k} broadcast fresher, higher bid (${yk.toFixed(1)} > ${yi.toFixed(1)}) by ${zk}. Updated.`,
      };
    } else if (zk === null || zk === 'NONE') {
      return {
        action: 'RESET',
        ruleNumber: 17,
        newWinningAgent: null,
        newWinningBid: 0,
        explanation: `Rule 17: Stale information detected. Task ${taskId} reset to release orphaned claim.`,
      };
    }
  }

  // Default Fallback
  return {
    action: 'LEAVE',
    ruleNumber: 18,
    newWinningAgent: zi,
    newWinningBid: yi,
    explanation: `Rule 18: Default consensus preservation. Retained existing state for ${taskId}.`,
  };
}

/**
 * Creates a formatted log record for the Choi 2009 step-debugger
 */
export function createChoiLog(
  receiverId: string,
  senderId: string,
  taskId: string,
  zi: string | null,
  yi: number,
  zk: string | null,
  yk: number,
  res: ChoiDecisionResult
): ChoiRuleLog {
  return {
    id: `CHOI_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestampMs: Date.now(),
    receiverId,
    senderId,
    taskId,
    receiverWinner: zi,
    receiverBid: Number(yi.toFixed(1)),
    senderWinner: zk,
    senderBid: Number(yk.toFixed(1)),
    receiverTimestamp: 1,
    senderTimestamp: 2,
    ruleNumber: res.ruleNumber,
    action: res.action,
    explanation: res.explanation,
  };
}
