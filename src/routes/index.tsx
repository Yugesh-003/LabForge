import { createFileRoute } from "@tanstack/react-router";
import { LabForgeApp } from "@/lib/labforge";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "LabForge — Start learning" }, { name: "description", content: "Choose your LabForge learning or faculty workspace." }, { property: "og:title", content: "LabForge — Start learning" }, { property: "og:description", content: "Choose your LabForge learning or faculty workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <LabForgeApp screen="landing" />,
});