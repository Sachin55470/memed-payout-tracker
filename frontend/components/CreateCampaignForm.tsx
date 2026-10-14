"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { Button, Group, NumberInput, Select, Stack, Text, TextInput } from "@mantine/core";
import { api } from "@/lib/axios";
import { showError, showSuccess } from "@/lib/notify";
import type { Platform } from "@/lib/types";

type FormValues = {
  name: string;
  platform: Platform;
  totalBudget: number | string;
  milestones: { views: number | string; payout: number | string }[];
};

type Props = {
  onCreated: () => void;
};

export function CreateCampaignForm({ onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      platform: "instagram",
      totalBudget: 10000,
      milestones: [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 },
        { views: 100000, payout: 5000 },
      ],
    },
    validate: {
      name: (value) => (value.trim() ? null : "Name is required"),
      totalBudget: (value) => (Number(value) > 0 ? null : "Budget must be more than 0"),
    },
  });

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await api.post("/brand/campaigns", {
        name: values.name,
        platform: values.platform,
        totalBudget: Number(values.totalBudget),
        milestones: values.milestones.map((m) => ({
          views: Number(m.views),
          payout: Number(m.payout),
        })),
      });
      showSuccess("Campaign created");
      onCreated();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label="Campaign name" required {...form.getInputProps("name")} />

        <Select
          label="Platform"
          data={[
            { label: "Instagram", value: "instagram" },
            { label: "YouTube", value: "youtube" },
          ]}
          allowDeselect={false}
          {...form.getInputProps("platform")}
        />

        <NumberInput
          label="Total budget (₹)"
          min={1}
          allowDecimal={false}
          thousandSeparator=","
          required
          {...form.getInputProps("totalBudget")}
        />

        <div>
          <Text size="sm" fw={500}>
            Milestones
          </Text>
          <Text size="xs" c="dimmed" mb="xs">
            Creators get the payout of the highest milestone their post crosses
          </Text>

          <Stack gap="xs">
            {form.values.milestones.map((_, index) => (
              <Group key={index} align="flex-end" wrap="nowrap">
                <NumberInput
                  label={index === 0 ? "Views" : undefined}
                  min={1}
                  allowDecimal={false}
                  thousandSeparator=","
                  style={{ flex: 1 }}
                  {...form.getInputProps(`milestones.${index}.views`)}
                />
                <NumberInput
                  label={index === 0 ? "Payout (₹)" : undefined}
                  min={1}
                  allowDecimal={false}
                  thousandSeparator=","
                  style={{ flex: 1 }}
                  {...form.getInputProps(`milestones.${index}.payout`)}
                />
                <Button
                  variant="subtle"
                  color="red"
                  disabled={form.values.milestones.length === 1}
                  onClick={() => form.removeListItem("milestones", index)}
                >
                  Remove
                </Button>
              </Group>
            ))}
          </Stack>

          <Button
            variant="light"
            size="xs"
            mt="sm"
            onClick={() => form.insertListItem("milestones", { views: "", payout: "" })}
          >
            + Add milestone
          </Button>
        </div>

        <Button type="submit" loading={submitting}>
          Create campaign
        </Button>
      </Stack>
    </form>
  );
}
