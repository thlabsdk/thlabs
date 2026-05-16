import { Container } from "@/components/layout/Container";

export default function Contact() {
  return (
    <Container>
      <section className="pt-24 pb-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Contact
        </h1>
        <p className="mt-4 text-base text-muted max-w-lg">
          Get in touch about collaboration or inquiries.
        </p>
      </section>
    </Container>
  );
}
