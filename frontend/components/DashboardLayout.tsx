import { Container } from "@mantine/core";
import { Header } from "./Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Container size="lg" py="lg">
        {children}
      </Container>
    </>
  );
}
