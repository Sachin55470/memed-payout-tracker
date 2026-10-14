"use client";

import { useEffect, useState } from "react";
import { Button, Group, Loader, Modal, Paper, Progress, SimpleGrid, Table, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CampaignPostsModal } from "./CampaignPostsModal";
import { CreateCampaignForm } from "./CreateCampaignForm";
import { PlatformBadge } from "./PlatformBadge";
import { StatCard } from "./StatCard";
import { api } from "@/lib/axios";
import { formatRupees } from "@/lib/format";
import { showError } from "@/lib/notify";
import type { ApiResponse, BrandCampaign } from "@/lib/types";

export function BrandDashboard() {
  const [campaigns, setCampaigns] = useState<BrandCampaign[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [createOpened, createModal] = useDisclosure(false);
  const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign | null>(null);

  useEffect(() => {
    api
      .get<ApiResponse<{ campaigns: BrandCampaign[] }>>("/brand/campaigns")
      .then((res) => setCampaigns(res.data.data.campaigns))
      .catch(showError);
  }, [reloadKey]);

  function handleCreated() {
    createModal.close();
    setReloadKey((key) => key + 1);
  }

  if (campaigns === null) {
    return <Loader />;
  }

  let totalBudget = 0;
  let totalSpent = 0;
  for (const campaign of campaigns) {
    totalBudget += campaign.totalBudget;
    totalSpent += campaign.spent;
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Your campaigns</Title>
        <Button onClick={createModal.open}>New campaign</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
        <StatCard label="Campaigns" value={campaigns.length} />
        <StatCard label="Total budget" value={formatRupees(totalBudget)} />
        <StatCard label="Total spent" value={formatRupees(totalSpent)} />
      </SimpleGrid>

      {campaigns.length === 0 ? (
        <Paper withBorder p="xl" ta="center">
          <Text c="dimmed">No campaigns yet. Create your first one.</Text>
        </Paper>
      ) : (
        <Paper withBorder>
          <Table.ScrollContainer minWidth={700}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Campaign</Table.Th>
                  <Table.Th>Platform</Table.Th>
                  <Table.Th>Budget</Table.Th>
                  <Table.Th>Spent</Table.Th>
                  <Table.Th>Remaining</Table.Th>
                  <Table.Th w={160}>Used</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {campaigns.map((campaign) => {
                  const usedPercent = (campaign.spent / campaign.totalBudget) * 100;
                  return (
                    <Table.Tr key={campaign._id}>
                      <Table.Td fw={500}>{campaign.name}</Table.Td>
                      <Table.Td>
                        <PlatformBadge platform={campaign.platform} />
                      </Table.Td>
                      <Table.Td>{formatRupees(campaign.totalBudget)}</Table.Td>
                      <Table.Td>{formatRupees(campaign.spent)}</Table.Td>
                      <Table.Td>{formatRupees(campaign.remaining)}</Table.Td>
                      <Table.Td>
                        <Progress value={usedPercent} color={usedPercent >= 100 ? "red" : "blue"} />
                        <Text size="xs" c="dimmed" mt={4}>
                          {Math.round(usedPercent)}% used
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Button variant="default" size="xs" onClick={() => setSelectedCampaign(campaign)}>
                          View posts
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}

      <Modal opened={createOpened} onClose={createModal.close} title="New campaign" size="lg">
        <CreateCampaignForm onCreated={handleCreated} />
      </Modal>

      <CampaignPostsModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
    </>
  );
}
