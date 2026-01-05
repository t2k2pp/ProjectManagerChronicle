/**
 * 休暇パズルコンポーネントのエクスポート
 */

export { CalendarGrid } from './CalendarGrid';
export { NegotiationDialog } from './NegotiationDialog';
export {
    validateVacationSchedule,
    generateBlockedDays,
    suggestVacationDays,
    generateVacationPuzzle,
    shouldTriggerVacationPuzzle,
} from './puzzleEngine';
export type { VacationPuzzle, PuzzleConstraint } from './puzzleEngine';
