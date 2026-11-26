// Wording shown for a score returned by the server. Presentation only: the
// app never computes a score, it picks the message for the one it received.

export type ScoreTier = "perfect" | "great" | "good" | "miss";

export type ScoreFeedback = { tier: ScoreTier; title: string; message: string };

export function scoreFeedback(score: number): ScoreFeedback {
  if (score >= 90) {
    return { tier: "perfect", title: "Énorme !", message: "Tu as presque la couleur parfaite !" };
  }
  if (score >= 75) {
    return { tier: "great", title: "Bien joué !", message: "Tu es tout près de la couleur du jour." };
  }
  if (score >= 50) {
    return { tier: "good", title: "Pas mal !", message: "Encore un effort, la couleur n’est pas loin." };
  }
  return { tier: "miss", title: "Raté…", message: "Cherche un objet plus proche de la couleur du jour." };
}
