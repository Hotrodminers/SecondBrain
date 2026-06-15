// src/lib/templates.ts
// Premade node templates for quick-add to canvas

export interface NodeTemplate {
  id: string;
  label: string;
  note: string;
  quadrant: "do_now" | "schedule" | "delegate" | "drop";
  category: "academic" | "fitness" | "project" | "personal";
}

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Academic
  {
    id: "tpl_exam_prep",
    label: "Study for upcoming exam",
    note: "Review notes, practice problems",
    quadrant: "do_now",
    category: "academic",
  },
  {
    id: "tpl_assignment",
    label: "Finish assignment",
    note: "Check submission deadline",
    quadrant: "do_now",
    category: "academic",
  },
  {
    id: "tpl_study_session",
    label: "Plan weekly study session",
    note: "Block 2 hours, no distractions",
    quadrant: "schedule",
    category: "academic",
  },
  {
    id: "tpl_revision",
    label: "Revise previous topics",
    note: "Spaced repetition review",
    quadrant: "schedule",
    category: "academic",
  },

  // Fitness / health
  {
    id: "tpl_workout",
    label: "Workout session",
    note: "30-45 min, gym or home",
    quadrant: "schedule",
    category: "fitness",
  },
  {
    id: "tpl_sleep",
    label: "Fix sleep schedule",
    note: "Aim for consistent bedtime",
    quadrant: "schedule",
    category: "fitness",
  },
  {
    id: "tpl_meal_prep",
    label: "Meal prep for the week",
    note: "Plan and cook in batches",
    quadrant: "schedule",
    category: "fitness",
  },
  {
    id: "tpl_doctor",
    label: "Book a health checkup",
    note: "Routine appointment",
    quadrant: "delegate",
    category: "fitness",
  },

  // Project / work
  {
    id: "tpl_deadline",
    label: "Project deadline",
    note: "Final deliverable due",
    quadrant: "do_now",
    category: "project",
  },
  {
    id: "tpl_meeting_prep",
    label: "Prepare for meeting",
    note: "Agenda, slides, talking points",
    quadrant: "do_now",
    category: "project",
  },
  {
    id: "tpl_review",
    label: "Code/design review",
    note: "Review pending PRs or drafts",
    quadrant: "schedule",
    category: "project",
  },
  {
    id: "tpl_followup",
    label: "Follow up with team",
    note: "Check status, unblock others",
    quadrant: "delegate",
    category: "project",
  },

  // Personal
  {
    id: "tpl_chores",
    label: "Household chores",
    note: "Laundry, cleaning, dishes",
    quadrant: "delegate",
    category: "personal",
  },
  {
    id: "tpl_errands",
    label: "Run errands",
    note: "Groceries, bank, post office",
    quadrant: "delegate",
    category: "personal",
  },
  {
    id: "tpl_habit",
    label: "Build a new habit",
    note: "Pick one small daily action",
    quadrant: "schedule",
    category: "personal",
  },
  {
    id: "tpl_declutter",
    label: "Declutter / organize space",
    note: "Low priority, do when free",
    quadrant: "drop",
    category: "personal",
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  academic: "Academic",
  fitness: "Fitness & Health",
  project: "Project & Work",
  personal: "Personal",
};
