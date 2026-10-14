import { Button, Card, Group, List, Text } from "@mantine/core";
import { formatRupees, formatViews } from "@/lib/format";
import type { LiveCampaign } from "@/lib/types";
import { PlatformBadge } from "./PlatformBadge";

type Props = {
  campaign: LiveCampaign;
  onSubmitPost: () => void;
};

export function CampaignCard({ campaign, onSubmitPost }: Props) {
  const remaining = campaign.totalBudget - campaign.spent;

  return (
    <Card withBorder radius="md">
      <Group justify="space-between" mb={4}>
        <Text fw={600}>{campaign.name}</Text>
        <PlatformBadge platform={campaign.platform} />
      </Group>
      <Text size="sm" c="dimmed" mb="sm">
        by {campaign.brand.name} · {formatRupees(remaining)} budget left
      </Text>

      <Text size="sm" fw={500}>
        Payouts
      </Text>
      <List size="sm" mb="md">
        {campaign.milestones.map((milestone) => (
          <List.Item key={milestone.views}>
            {formatViews(milestone.views)} views → {formatRupees(milestone.payout)}
          </List.Item>
        ))}
      </List>

      <Button variant="light" mt="auto" onClick={onSubmitPost}>
        Submit a post
      </Button>
    </Card>
  );
}
