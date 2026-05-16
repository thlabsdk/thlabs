import { Container } from "@/components/layout/Container";

export default function Projects() {
  return (
    <Container>
      <section className="pt-24 pb-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Projects
        </h1>
        <p className="mt-4 text-base text-muted max-w-lg">
          Experiments, tools, and systems under development.
        </p>
      </section>
    </Container>
  );
}
