import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, CalendarDays, Check, Clock3, Mic2, ShieldCheck } from "lucide-react";
import { z } from "zod";

import fiveYearsMark from "@/assets/five-years-mark.png";
import incubeCapitalLogo from "@/assets/incube-capital-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveRegistration } from "@/lib/registration.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beyond Wealth | Registration" },
      {
        name: "description",
        content: "Register for Beyond Wealth, an exclusive investment perspectives and market outlook event by Incube Capital.",
      },
      { property: "og:title", content: "Beyond Wealth | Registration" },
      {
        property: "og:description",
        content: "Register for Beyond Wealth by Incube Capital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BeyondWealthRegistration,
});

const registrationSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name as per KYC.").max(100),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
    email: z.string().trim().email("Enter a valid email address.").max(255),
    members: z.number().int().min(1, "At least one member is required.").max(20),
    adults: z.number().int().min(1, "At least one adult is required.").max(20),
    kids: z.number().int().min(0).max(10),
    ages: z.array(z.number().int().min(1).max(18)),
  })
  .refine((data) => data.adults + data.kids === data.members, {
    message: "Adults and kids must add up to the total number of members.",
    path: ["members"],
  })
  .refine((data) => data.ages.length === data.kids, {
    message: "Please select an age for every child.",
    path: ["ages"],
  });

type FieldErrors = Partial<Record<"name" | "mobile" | "email" | "members" | "adults" | "ages" | "submit", string>>;

function BeyondWealthRegistration() {
  const [kids, setKids] = useState(0);
  const [ages, setAges] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submittedName, setSubmittedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateKids = (value: string) => {
    const count = Number(value);
    setKids(count);
    setAges((current) => Array.from({ length: count }, (_, index) => current[index] ?? ""));
    setErrors((current) => {
      const { ages: _ages, ...remaining } = current;
      return remaining;
    });
  };

  const submitRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = registrationSchema.safeParse({
      name: form.get("name"),
      mobile: form.get("mobile"),
      email: form.get("email"),
      members: Number(form.get("members")),
      adults: Number(form.get("adults")),
      kids,
      ages: ages.map(Number),
    });

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FieldErrors;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await saveRegistration({ data: result.data });
      setSubmittedName(result.data.name.split(" ")[0] ?? result.data.name);
    } catch {
      setErrors({ submit: "We couldn't save your registration. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedName) {
    return (
      <main className="min-h-screen bg-background px-5 py-12 sm:px-8">
        <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col items-center justify-center text-center">
          <div className="mb-8 flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
            <Check className="size-8" strokeWidth={2} />
          </div>
          <p className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.24em] text-success">Registration received</p>
          <h1 className="font-display text-4xl text-primary sm:text-5xl">Thank you, {submittedName}.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Your details for Beyond Wealth have been recorded. We look forward to welcoming you and your family.
          </p>
          <Button className="mt-8 h-12 px-6" onClick={() => setSubmittedName("")}>
            Register another guest
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-gold/40 bg-background/95 shadow-ribbon backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-8">
          <a href="#event" aria-label="Beyond Wealth home" className="shrink-0">
            <img src={incubeCapitalLogo} alt="Incube Capital" className="h-10 w-auto object-contain sm:h-12" />
          </a>
          <nav aria-label="Event sections" className="ml-auto min-w-0 overflow-x-auto">
            <div className="flex w-max items-center gap-3 text-[9px] font-bold uppercase tracking-[0.12em] text-primary sm:gap-8 sm:text-xs sm:tracking-[0.15em]">
              <a href="#event" className="hidden transition-colors hover:text-gold-strong sm:inline">Event</a>
              <a href="#about" className="transition-colors hover:text-gold-strong">About</a>
              <a href="#programme" className="transition-colors hover:text-gold-strong">Programme</a>
              <a href="#voices" className="transition-colors hover:text-gold-strong">Voices</a>
              <a href="#register" className="border border-primary bg-primary px-2.5 py-2 text-primary-foreground transition-colors hover:border-gold hover:bg-gold hover:text-primary sm:px-4 sm:py-2.5">Register</a>
            </div>
          </nav>
        </div>
      </header>

      <section id="event" className="scroll-mt-20 bg-background px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <div className="relative mx-auto flex min-h-[calc(100vh-13rem)] max-w-7xl flex-col justify-center overflow-hidden border-y border-border py-12 sm:py-16 lg:py-20">
          <span className="pointer-events-none absolute -right-10 -top-16 select-none font-display text-[20rem] leading-none text-secondary/70 sm:text-[28rem]" aria-hidden="true">5</span>

          <div className="relative z-10 grid items-end gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col gap-9 lg:col-span-8 lg:gap-12">
              <div className="flex items-center gap-4">
                <span className="h-8 w-px bg-accent" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">Incube Capital presents</p>
              </div>

              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-accent">1st edition · An exclusive gathering</p>
                <h1 className="font-display text-7xl leading-[0.82] text-primary sm:text-8xl md:text-9xl lg:text-[9.5rem]">
                  Beyond<br />Wealth
                </h1>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm">
                  Investment perspectives <span className="mx-2 text-gold" aria-hidden="true">|</span> Market outlook
                </p>
              </div>

              <div className="flex items-center gap-5">
                <span className="border border-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent sm:text-xs">Five-year anniversary edition</span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>
            </div>

            <div className="flex flex-col gap-8 lg:col-span-4">
              <img src={fiveYearsMark} alt="5 years completed" className="h-20 w-20 object-contain" />
              <p className="max-w-sm font-display text-2xl leading-snug text-primary">
                An afternoon of investment perspectives and market outlooks, created for your family’s financial future.
              </p>
              <dl className="grid grid-cols-2 gap-6 border-y border-border py-6 lg:grid-cols-1">
                <div>
                  <dt className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"><CalendarDays className="size-4" /> Date</dt>
                  <dd className="text-base font-medium text-primary sm:text-lg">Sunday, 25 October 2026</dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"><Clock3 className="size-4" /> Time</dt>
                  <dd className="text-base font-medium text-primary sm:text-lg">10:30 AM – 1:00 PM</dd>
                </div>
              </dl>
              <Button asChild size="lg" className="h-13 w-fit rounded-none px-8 uppercase tracking-[0.12em]">
                <a href="#register">Register now <ArrowRight /></a>
              </Button>
            </div>
          </div>

          <a href="#about" aria-label="Continue to About the event" className="relative z-10 mt-12 flex size-10 items-center justify-center border border-border text-primary transition-colors hover:border-accent hover:text-accent">
            <ArrowDown className="size-4" />
          </a>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 bg-background px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <SectionHeading eyebrow="About the event" title="Perspectives beyond the numbers" />
          <div className="space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
            <p>Beyond Wealth brings families together for a considered conversation on investment perspectives and the market outlook ahead.</p>
            <p>Presented as Incube Capital marks five years, the gathering creates space to reflect on the journey so far and look thoughtfully toward long-term financial decisions.</p>
          </div>
        </div>
      </section>

      <section id="programme" className="scroll-mt-20 border-y border-primary/10 bg-secondary/45 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Event programme" title="The afternoon, thoughtfully arranged" centered />
          <div className="mx-auto mt-12 max-w-4xl border-y border-gold/60 py-12 text-center">
            <CalendarDays className="mx-auto size-7 text-gold-strong" />
            <p className="mt-5 font-display text-4xl text-primary sm:text-5xl">Coming soon</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">The detailed event schedule will be shared here once it is finalised.</p>
          </div>
        </div>
      </section>

      <section id="voices" className="scroll-mt-20 bg-background px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Voices" title="Meet the perspectives shaping the conversation" centered />
          <div className="mx-auto mt-12 grid max-w-4xl gap-px bg-primary/15 sm:grid-cols-3">
            {["Market outlook", "Investment perspectives", "Family wealth"].map((topic) => (
              <div key={topic} className="bg-background px-7 py-12 text-center">
                <Mic2 className="mx-auto size-6 text-gold-strong" />
                <p className="mt-5 font-display text-2xl text-primary">Coming soon</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{topic}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-7 max-w-xl text-center text-sm leading-6 text-muted-foreground">Speaker details will be announced soon.</p>
        </div>
      </section>

      <section id="register" className="scroll-mt-20 border-t border-primary/10 bg-secondary/45 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Register" title="Reserve your place" />
            <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">Please share the attendee details below. Fields marked with an asterisk are required.</p>
            <div className="mt-7 flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              <span>Your information will be used only for event registration.</span>
            </div>
          </div>

          <div className="border border-primary/15 bg-background p-6 shadow-editorial sm:p-9">
            <form className="space-y-6" onSubmit={submitRegistration} noValidate>
              <Field id="name" label="Name (as per KYC)" error={errors.name}>
                <Input id="name" name="name" autoComplete="name" placeholder="Enter your full name" maxLength={100} className="h-12" aria-invalid={Boolean(errors.name)} />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="mobile" label="Mobile No." error={errors.mobile}>
                  <Input id="mobile" name="mobile" inputMode="numeric" autoComplete="tel" placeholder="10-digit number" maxLength={10} className="h-12" aria-invalid={Boolean(errors.mobile)} />
                </Field>
                <Field id="email" label="Email ID" error={errors.email}>
                  <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={255} className="h-12" aria-invalid={Boolean(errors.email)} />
                </Field>
              </div>

              <div className="border-y border-border py-6">
                <p className="mb-5 font-display text-xl text-primary">Attendee details</p>
                <div className="grid gap-5 sm:grid-cols-3">
                  <NumberSelect name="members" label="No. of members" min={1} max={20} error={errors.members} />
                  <NumberSelect name="adults" label="Adults" min={1} max={20} />
                  <div className="space-y-2">
                    <Label htmlFor="kids">Kids</Label>
                    <Select value={String(kids)} onValueChange={updateKids}>
                      <SelectTrigger id="kids" className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>{Array.from({ length: 11 }, (_, i) => <SelectItem key={i} value={String(i)}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {kids > 0 && (
                  <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="mb-3 text-sm font-medium text-foreground">Age of {kids === 1 ? "child" : "children"}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {ages.map((age, index) => (
                        <Select key={index} value={age} onValueChange={(value) => setAges((current) => current.map((item, ageIndex) => ageIndex === index ? value : item))}>
                          <SelectTrigger aria-label={`Age of child ${index + 1}`} className="h-12">
                            <SelectValue placeholder={`Child ${index + 1}`} />
                          </SelectTrigger>
                          <SelectContent>{Array.from({ length: 18 }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} years</SelectItem>)}</SelectContent>
                        </Select>
                      ))}
                    </div>
                    {errors.ages && <p className="mt-2 text-xs text-destructive">{errors.ages}</p>}
                  </div>
                )}
              </div>

              {errors.submit && <p role="alert" className="text-sm text-destructive">{errors.submit}</p>}
              <Button type="submit" size="lg" className="h-13 w-full rounded-none text-sm sm:w-auto sm:min-w-56" disabled={isSubmitting}>
                {isSubmitting ? "Saving registration…" : "Complete registration"} {!isSubmitting && <ArrowRight />}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-gold/40 bg-background px-5 py-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/60">Incube Capital · Beyond Wealth · 1st Edition</p>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, centered = false }: { eyebrow: string; title: string; centered?: boolean }) {
  return (
    <div className={centered ? "text-center" : undefined}>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-strong">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl leading-tight text-primary sm:text-5xl">{title}</h2>
      <div className={centered ? "mx-auto mt-6 h-px w-16 bg-gold" : "mt-6 h-px w-16 bg-gold"} aria-hidden="true" />
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} <span className="text-destructive">*</span></Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NumberSelect({ name, label, min, max, error }: { name: string; label: string; min: number; max: number; error?: string | undefined }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label} <span className="text-destructive">*</span></Label>
      <select id={name} name={name} defaultValue="" className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring" aria-invalid={Boolean(error)}>
        <option value="" disabled>Select</option>
        {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}