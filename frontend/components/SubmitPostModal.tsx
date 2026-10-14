"use client";

import { useState } from "react";
import { Button, Modal, Stack, Text, TextInput } from "@mantine/core";
import { api } from "@/lib/axios";
import { showError, showSuccess } from "@/lib/notify";
import type { LiveCampaign } from "@/lib/types";

type Props = {
  campaign: LiveCampaign | null;
  onClose: () => void;
  onSubmitted: () => void;
};

export function SubmitPostModal({ campaign, onClose, onSubmitted }: Props) {
  const [postUrl, setPostUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    setPostUrl("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaign) return;

    setSubmitting(true);
    try {
      await api.post(`/campaigns/${campaign._id}/submissions`, { postUrl });
      showSuccess("Post submitted");
      setPostUrl("");
      onSubmitted();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  const placeholder =
    campaign?.platform === "youtube" ? "https://youtube.com/shorts/..." : "https://instagram.com/reel/...";

  return (
    <Modal opened={campaign !== null} onClose={handleClose} title={`Submit a post to ${campaign?.name ?? ""}`}>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Text size="sm" c="dimmed">
            Paste the link to your {campaign?.platform === "youtube" ? "YouTube" : "Instagram"} post.
          </Text>
          <TextInput
            label="Post link"
            placeholder={placeholder}
            required
            value={postUrl}
            onChange={(e) => setPostUrl(e.currentTarget.value)}
          />
          <Button type="submit" loading={submitting}>
            Submit
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
