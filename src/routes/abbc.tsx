import { createFileRoute } from "@tanstack/react-router";
import ABBC from "@/pages/ABBC";

export const Route = createFileRoute("/abbc")({
  component: ABBC,
});
