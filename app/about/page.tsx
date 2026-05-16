import { Container } from "@/components/layout/Container";

export default function About() {
  return (
    <Container>
      <section className="pt-24 pb-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          About
        </h1>
        <p className="mt-4 text-base text-muted max-w-lg">
          The people and motivations behind THLabs.
        </p>
      </section>
    </Container>
  );
}
