"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CONTACT_EMAIL = "contact@varsityclublacrosse.com";

const TOPICS = [
  { value: "general", label: "General inquiry" },
  { value: "tip", label: "Story tip or media" },
  { value: "partnership", label: "Partnership or advertising" },
  { value: "contributor", label: "Contributor interest" },
  { value: "technical", label: "Technical issue" },
  { value: "other", label: "Other" },
] as const;

type FormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  topic: "general",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const topicLabel =
      TOPICS.find((t) => t.value === form.topic)?.label ?? "General inquiry";

    const subject = encodeURIComponent(`[VCL Contact] ${topicLabel}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nTopic: ${topicLabel}\n\n${message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setForm(initialForm);
  };

  return (
    <div className="rounded-sm border border-border bg-card p-6 md:p-8">
      {submitted ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground font-medium">
            Your email app should open with your message ready to send.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If nothing opened, email us directly at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-vcl-gold hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() => setSubmitted(false)}
          >
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <select
              id="topic"
              name="topic"
              value={form.topic}
              onChange={handleChange}
              className={cn(
                "border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              )}
            >
              {TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help?"
              rows={6}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full sm:w-fit bg-vcl-gold text-vcl-gold-foreground hover:bg-vcl-gold/90"
          >
            Send message
          </Button>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Submitting opens your default email app with a pre-filled message to{" "}
            {CONTACT_EMAIL}.
          </p>
        </form>
      )}
    </div>
  );
}
