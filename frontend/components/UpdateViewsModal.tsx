"use client";

import { useState } from "react";
import { Button, Modal, NumberInput, Stack, Text } from "@mantine/core";
import { api } from "@/lib/axios";
import { formatRupees } from "@/lib/format";
import { showError, showSuccess } from "@/lib/notify";
import type { ApiResponse, CreatorSubmission } from "@/lib/types";

type Props = {
  submission: CreatorSubmission | null;
  onClose: () => void;
  onUpdated: () => void;
};


export function UpdateViewsModal({ submission, onClose, onUpdated }: Props) {
  return (
    <Modal opened={submission !== null} onClose={onClose} title="Simulate views">
      {submission && (
        <UpdateViewsForm key={submission._id} submission={submission} onUpdated={onUpdated} />
      )}
    </Modal>
  );
}

type FormProps = {
  submission: CreatorSubmission;
  onUpdated: () => void;
};

function UpdateViewsForm({ submission, onUpdated }: FormProps) {
  const [views, setViews] = useState<number | string>(submission.views);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch<ApiResponse<{ payoutNow: number }>>(`/submissions/${submission._id}/views`, {
        views: Number(views),
      });
      const payoutNow = res.data.data.payoutNow;
      if (payoutNow > 0) {
        showSuccess(`Views updated. You earned ${formatRupees(payoutNow)}!`);
      } else {
        showSuccess("Views updated. No new milestone reached.");
      }
      onUpdated();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Text size="sm" c="dimmed">
          This stands in for real platform data. Current views: {submission.views.toLocaleString("en-IN")}
        </Text>
        <NumberInput
          label="New view count"
          min={0}
          allowDecimal={false}
          thousandSeparator=","
          required
          value={views}
          onChange={setViews}
        />
        <Button type="submit" loading={submitting}>
          Update views
        </Button>
      </Stack>
    </form>
  );
}
