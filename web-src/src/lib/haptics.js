import { Capacitor, registerPlugin } from "@capacitor/core";

// Implemented in ios/App/App/SelectionHapticsPlugin.swift with
// UISelectionFeedbackGenerator. Other platforms simply skip the feedback.
const SelectionHaptics = registerPlugin("SelectionHaptics");

export function selectionChangedHaptic() {
  if (!Capacitor.isPluginAvailable("SelectionHaptics")) return;

  SelectionHaptics.selectionChanged().catch(() => {
    // Haptics are a nicety; never let them interrupt date selection.
  });
}
