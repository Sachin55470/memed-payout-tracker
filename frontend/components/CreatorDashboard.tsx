"use client";

import { useEffect, useState } from "react";
import { Anchor, Button, Loader, Paper, SimpleGrid, Table, Text, Title } from "@mantine/core";
import { CampaignCard } from "./CampaignCard";
import { StatCard } from "./StatCard";
import { SubmitPostModal } from "./SubmitPostModal";
import { UpdateViewsModal } from "./UpdateViewsModal";
import { api } from "@/lib/axios";
import { formatRupees, formatViews } from "@/lib/format";
import { showError } from "@/lib/notify";
import type { ApiResponse, CreatorSubmission, LiveCampaign } from "@/lib/types";

export function CreatorDashboard() {
  const [campaigns, setCampaigns] = useState<LiveCampaign[] | null>(null);
  const [submissions, setSubmissions] = useState<CreatorSubmission[] | null>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const [campaignToSubmit, setCampaignToSubmit] = useState<LiveCampaign | null>(null);
  const [postToUpdate, setPostToUpdate] = useState<CreatorSubmission | null>(null);

  useEffect(() => {
    api
      .get<ApiResponse<{ campaigns: LiveCampaign[] }>>("/campaigns")
      .then((res) => setCampaigns(res.data.data.campaigns))
      .catch(showError);

    api
      .get<ApiResponse<{ totalEarnings: number; submissions: CreatorSubmission[] }>>("/creator/submissions")
      .then((res) => {
        setSubmissions(res.data.data.submissions);
        setTotalEarnings(res.data.data.totalEarnings);
      })
      .catch(showError);
  }, [reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  function handlePostSubmitted() {
    setCampaignToSubmit(null);
    reload();
  }

  function handleViewsUpdated() {
    setPostToUpdate(null);
    reload();
  }

  if (campaigns === null || submissions === null) {
    return <Loader />;
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl">
        <StatCard label="Total earnings" value={formatRupees(totalEarnings)} />
        <StatCard label="Posts submitted" value={submissions.length} />
      </SimpleGrid>

      <Title order={3} mb="md">
        Live campaigns
      </Title>
      {campaigns.length === 0 ? (
        <Paper withBorder p="xl" ta="center" mb="xl">
          <Text c="dimmed">No live campaigns right now. Check back later.</Text>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="xl">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              onSubmitPost={() => setCampaignToSubmit(campaign)}
            />
          ))}
        </SimpleGrid>
      )}

      <Title order={3} mb="md">
        My posts
      </Title>
      {submissions.length === 0 ? (
        <Paper withBorder p="xl" ta="center">
          <Text c="dimmed">You haven&apos;t submitted any posts yet.</Text>
        </Paper>
      ) : (
        <Paper withBorder>
          <Table.ScrollContainer minWidth={600}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Campaign</Table.Th>
                  <Table.Th>Post</Table.Th>
                  <Table.Th>Views</Table.Th>
                  <Table.Th>Earned</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {submissions.map((submission) => (
                  <Table.Tr key={submission._id}>
                    <Table.Td fw={500}>{submission.campaign.name}</Table.Td>
                    <Table.Td>
                      <Anchor href={submission.postUrl} target="_blank" size="sm">
                        Open link
                      </Anchor>
                    </Table.Td>
                    <Table.Td>{formatViews(submission.views)}</Table.Td>
                    <Table.Td>{formatRupees(submission.paidAmount)}</Table.Td>
                    <Table.Td>
                      <Button variant="default" size="xs" onClick={() => setPostToUpdate(submission)}>
                        Simulate views
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}

      <SubmitPostModal
        campaign={campaignToSubmit}
        onClose={() => setCampaignToSubmit(null)}
        onSubmitted={handlePostSubmitted}
      />
      <UpdateViewsModal
        submission={postToUpdate}
        onClose={() => setPostToUpdate(null)}
        onUpdated={handleViewsUpdated}
      />
    </>
  );
}
