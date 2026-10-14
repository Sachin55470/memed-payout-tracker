"use client";

import { useEffect, useState } from "react";
import { Anchor, Loader, Modal, Table, Text } from "@mantine/core";
import { api } from "@/lib/axios";
import { formatRupees, formatViews } from "@/lib/format";
import { showError } from "@/lib/notify";
import type { ApiResponse, BrandCampaign, CampaignSubmission } from "@/lib/types";

type Props = {
  campaign: BrandCampaign | null;
  onClose: () => void;
};


export function CampaignPostsModal({ campaign, onClose }: Props) {
  const [posts, setPosts] = useState<CampaignSubmission[] | null>(null);

  useEffect(() => {
    if (!campaign) return;

    api
      .get<ApiResponse<{ submissions: CampaignSubmission[] }>>(`/brand/campaigns/${campaign._id}/submissions`)
      .then((res) => setPosts(res.data.data.submissions))
      .catch(showError);
  }, [campaign]);

  function handleClose() {
    setPosts(null);
    onClose();
  }

  return (
    <Modal opened={campaign !== null} onClose={handleClose} title={campaign?.name} size="xl">
      {posts === null && <Loader />}

      {posts?.length === 0 && <Text c="dimmed">No posts submitted yet.</Text>}

      {posts && posts.length > 0 && (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Creator</Table.Th>
              <Table.Th>Post</Table.Th>
              <Table.Th>Views</Table.Th>
              <Table.Th>Paid</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {posts.map((post) => (
              <Table.Tr key={post._id}>
                <Table.Td>{post.creator.name}</Table.Td>
                <Table.Td>
                  <Anchor href={post.postUrl} target="_blank" size="sm">
                    Open link
                  </Anchor>
                </Table.Td>
                <Table.Td>{formatViews(post.views)}</Table.Td>
                <Table.Td>{formatRupees(post.paidAmount)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  );
}
