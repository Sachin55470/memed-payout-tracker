"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { api } from "@/lib/axios";
import { showError } from "@/lib/notify";
import type { ApiResponse, Role, User } from "@/lib/types";

// same rules as the backend, checked here so the user sees the problem right away
function getPasswordError(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password)) return "Password must contain a letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return null;
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("creator");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = getPasswordError(password);
    setPasswordError(error);
    if (error) return;

    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<{ user: User }>>("/auth/signup", { name, email, password, role });
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
        Create an account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Brands run campaigns, creators get paid for views
      </Text>

      <Paper withBorder p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <div>
              <Text size="sm" fw={500} mb={4}>
                I am a
              </Text>
              <SegmentedControl
                fullWidth
                value={role}
                onChange={(value) => setRole(value as Role)}
                data={[
                  { label: "Creator", value: "creator" },
                  { label: "Brand", value: "brand" },
                ]}
              />
            </div>
            <TextInput
              label={role === "brand" ? "Brand name" : "Name"}
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <TextInput
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              description="At least 8 characters, with a letter and a number"
              required
              error={passwordError}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button type="submit" loading={submitting}>
              Sign up
            </Button>
          </Stack>
        </form>
      </Paper>

      <Text size="sm" ta="center" mt="md">
        Already have an account?{" "}
        <Anchor component={Link} href="/login">
          Log in
        </Anchor>
      </Text>
    </Container>
  );
}
