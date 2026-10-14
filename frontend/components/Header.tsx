"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Container, Group, Text, Title } from "@mantine/core";
import { api } from "@/lib/axios";
import { showError } from "@/lib/notify";
import type { ApiResponse, User } from "@/lib/types";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api
      .get<ApiResponse<{ user: User }>>("/auth/me")
      .then((res) => setUser(res.data.data.user))
      .catch(showError);
  }, []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
      router.replace("/login");
    } catch (error) {
      showError(error);
    }
  }

  return (
    <header style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
      <Container size="lg" py="sm">
        <Group justify="space-between">
          <Title order={3}>Meme&apos;d Payouts</Title>
          <Group gap="sm">
            {user && (
              <>
                <Text size="sm">{user.name}</Text>
                <Badge variant="light">{user.role}</Badge>
              </>
            )}
            <Button variant="default" size="xs" onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Group>
      </Container>
    </header>
  );
}
