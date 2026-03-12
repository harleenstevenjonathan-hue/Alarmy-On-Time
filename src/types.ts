/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MissionType = 'none' | 'math' | 'shake' | 'memory' | 'barcode';

export interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: number[];
  mission: MissionType;
  ringtone: string;
}

export const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MISSION_LABELS: Record<MissionType, string> = {
  none: 'None',
  math: 'Math',
  shake: 'Shake',
  memory: 'Memory',
  barcode: 'Barcode'
};

export const RINGTONES = ['Aurora', 'Zen', 'Pulse', 'Classic', 'Nature'];
