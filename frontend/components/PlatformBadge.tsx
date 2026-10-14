import { Badge } from "@mantine/core";
import type { Platform } from "@/lib/types";

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <Badge color={platform === "instagram" ? "pink" : "red"} variant="light">
      {platform === "instagram" ? "Instagram" : "YouTube"}
    </Badge>
  );
}
