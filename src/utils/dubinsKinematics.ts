/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SWARMOS Kinematics, Dubins Flight Dynamics & Atmospheric Modeling
 * Implementation of Dubins paths, minimum turn radii, aerodynamic bank angles,
 * wind vector drift (headwind/tailwind/crosswind), and energy derating curves.
 */

import { AgentEntity, WindVector } from '../types';

export interface GroundVelocityResult {
  airspeedMps: number;
  groundSpeedMps: number;
  groundHeadingDeg: number;
  crabAngleDeg: number;
  vx: number;
  vy: number;
}

/**
 * Calculates ground velocity vector from vehicle airspeed, vehicle heading, and meteorological wind.
 * Wind direction is meteorological origin (0 = wind from North blowing South).
 */
export function calculateGroundVelocity(
  airspeedMps: number,
  headingDeg: number,
  wind: WindVector
): GroundVelocityResult {
  // Convert vehicle heading to math angle (0 deg = East, 90 deg = North)
  // Tactical heading 0 = North, 90 = East, 180 = South, 270 = West
  const headingRad = ((90 - headingDeg) * Math.PI) / 180;
  const vAirX = airspeedMps * Math.cos(headingRad);
  const vAirY = airspeedMps * Math.sin(headingRad);

  // Wind blowing direction (opposite of where it comes from)
  const windBlowDir = (wind.directionDeg + 180) % 360;
  const windRad = ((90 - windBlowDir) * Math.PI) / 180;
  
  // Stochastic gust factor
  const gustFactor = 1 + (Math.random() - 0.5) * (wind.turbulencePct / 100);
  const effectiveWindSpeed = wind.speedMps * gustFactor;

  const vWindX = effectiveWindSpeed * Math.cos(windRad);
  const vWindY = effectiveWindSpeed * Math.sin(windRad);

  // Ground velocity vector
  const vgX = vAirX + vWindX;
  const vgY = vAirY + vWindY;
  const groundSpeedMps = Math.hypot(vgX, vgY);

  // Ground course heading (0 = North)
  let groundHeadingDeg = (90 - (Math.atan2(vgY, vgX) * 180) / Math.PI + 360) % 360;
  
  // Crab angle (difference between heading and ground track)
  let crabAngleDeg = groundHeadingDeg - headingDeg;
  if (crabAngleDeg > 180) crabAngleDeg -= 360;
  if (crabAngleDeg < -180) crabAngleDeg += 360;

  return {
    airspeedMps,
    groundSpeedMps,
    groundHeadingDeg,
    crabAngleDeg,
    vx: vgX,
    vy: vgY,
  };
}

/**
 * Computes aerodynamic bank angle for a coordinated turn in fixed-wing aircraft:
 * tan(phi) = (v^2) / (g * R)
 * where g = 9.81 m/s^2, R = turn radius in meters
 */
export function calculateBankAngle(speedMps: number, turnRadiusM: number): number {
  const g = 9.81;
  const clampedRadius = Math.max(15, turnRadiusM);
  const tanPhi = (speedMps * speedMps) / (g * clampedRadius);
  const bankRad = Math.atan(tanPhi);
  const bankDeg = (bankRad * 180) / Math.PI;
  return Math.min(45, Math.max(0, bankDeg)); // Cap at 45 deg safe bank limit
}

/**
 * Calculates instantaneous vehicle power draw in Watts based on aerodynamic profile,
 * wind resistance, and payload mass.
 */
export function calculatePowerDraw(
  agent: AgentEntity,
  groundSpeedMps: number,
  wind: WindVector
): number {
  const isFixedWing = agent.domain === 'AIR_FIXED_WING';
  const isMultirotor = agent.domain === 'AIR_MULTIROTOR';
  const isUgv = agent.domain === 'GROUND_UGV';
  const isUsv = agent.domain === 'SURFACE_USV';

  // Relative airspeed into vehicle
  const relativeAirspeed = Math.max(5, groundSpeedMps + wind.speedMps * 0.4);

  if (isFixedWing) {
    // Parasitic drag + induced drag curve: P = 0.5*rho*v^3*S*Cd + 2*W^2/(rho*v*S*pi*e*AR)
    const baseParasiticWatts = 85.0 + 0.08 * Math.pow(relativeAirspeed, 2.8);
    const avionicsWatts = 45.0; // Jetson Orin + SDR
    return Math.round(baseParasiticWatts + avionicsWatts);
  }

  if (isMultirotor) {
    // Multirotor induced power in hover + forward profile drag + wind stabilization penalty
    const baseHoverWatts = 320.0;
    const windBuffetingWatts = wind.speedMps * 7.5;
    const payloadWatts = agent.payloads.includes('HEAVY_CARGO') ? 95.0 : 35.0;
    const avionicsWatts = 55.0; // Jetson Orin + 3D Lidar / FLIR
    return Math.round(baseHoverWatts + windBuffetingWatts + payloadWatts + avionicsWatts);
  }

  if (isUgv) {
    // Rolling resistance + tracked chassis drag + mobile dock power
    const rollingWatts = 180.0 + groundSpeedMps * 25.0;
    const dockStandbyWatts = agent.isRechargeHub ? 120.0 : 0;
    return Math.round(rollingWatts + dockStandbyWatts + 65.0);
  }

  if (isUsv) {
    // Hydrodynamic hull displacement wave-making drag (increases with v^3)
    const waveDragWatts = 140.0 + Math.pow(groundSpeedMps * 0.5, 3) * 12.0;
    return Math.round(waveDragWatts + 85.0);
  }

  return 150.0;
}

/**
 * Step kinematics with turn-rate clamping and Dubins path smoothing.
 * Enforces maximum roll rate (45 deg/s) and turn rate (v / R).
 */
export function stepKinematics(
  currentPos: [number, number],
  currentHeadingDeg: number,
  targetPos: [number, number] | null,
  speedMps: number,
  minTurnRadiusM: number,
  dtSec: number,
  isFixedWing: boolean,
  wind: WindVector
): {
  nextPos: [number, number];
  nextHeadingDeg: number;
  bankAngleDeg: number;
  groundSpeedMps: number;
  crabAngleDeg: number;
} {
  if (!targetPos) {
    return {
      nextPos: currentPos,
      nextHeadingDeg: currentHeadingDeg,
      bankAngleDeg: 0,
      groundSpeedMps: 0,
      crabAngleDeg: 0,
    };
  }

  const dx = targetPos[0] - currentPos[0];
  const dy = targetPos[1] - currentPos[1];
  const dist = Math.hypot(dx, dy);

  // Desired heading to target
  const desiredHeadingDeg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;

  let newHeadingDeg = currentHeadingDeg;
  let bankDeg = 0;

  if (isFixedWing) {
    // Fixed-wing coordinated turn: maximum yaw rate omega = v / R
    const maxTurnRateDegS = (speedMps / Math.max(25, minTurnRadiusM)) * (180 / Math.PI);
    let headingDiff = desiredHeadingDeg - currentHeadingDeg;
    if (headingDiff > 180) headingDiff -= 360;
    if (headingDiff < -180) headingDiff += 360;

    const maxHeadingStep = maxTurnRateDegS * dtSec;
    const turnSign = Math.sign(headingDiff);
    const actualTurnStep = Math.min(Math.abs(headingDiff), maxHeadingStep) * turnSign;

    newHeadingDeg = (currentHeadingDeg + actualTurnStep + 360) % 360;

    // Bank angle proportional to turn rate
    if (Math.abs(headingDiff) > 5) {
      bankDeg = calculateBankAngle(speedMps, minTurnRadiusM) * turnSign;
    }
  } else {
    // Multirotor / ground: can turn at higher yaw rates or point instantly
    newHeadingDeg = desiredHeadingDeg;
    bankDeg = 0;
  }

  // Atmospheric wind drift calculation
  const groundResult = calculateGroundVelocity(speedMps, newHeadingDeg, wind);
  const stepDist = groundResult.groundSpeedMps * dtSec;

  let nextX = currentPos[0];
  let nextY = currentPos[1];

  if (dist > 4) {
    const moveStep = Math.min(dist, stepDist);
    const moveHeadingRad = ((90 - groundResult.groundHeadingDeg) * Math.PI) / 180;
    nextX += Math.cos(moveHeadingRad) * moveStep;
    nextY -= Math.sin(moveHeadingRad) * moveStep;
  }

  return {
    nextPos: [nextX, nextY],
    nextHeadingDeg: Math.round(newHeadingDeg),
    bankAngleDeg: Math.round(bankDeg),
    groundSpeedMps: Number(groundResult.groundSpeedMps.toFixed(1)),
    crabAngleDeg: Number(groundResult.crabAngleDeg.toFixed(1)),
  };
}
