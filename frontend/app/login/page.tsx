"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, Button, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { api } from "@/lib/axios";
import { showError } from "@/lib/notify";
import type { ApiResponse, User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<{ user: User }>>("/auth/login", { email, password });
      router.replace(`/${res.data.data.user.role}`);
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container size={420} py={80}>
      <Title order={2} ta="center">
        Meme&apos;d Payouts
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Log in to your account
      </Text>

      <Paper withBorder p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button type="submit" loading={submitting}>
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>

      <Text size="sm" ta="center" mt="md">
        Don&apos;t have an account?{" "}
        <Anchor component={Link} href="/signup">
          Sign up
        </Anchor>
      </Text>
    </Container>
  );
}
