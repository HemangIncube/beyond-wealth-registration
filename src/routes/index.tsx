import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { z } from "zod";

import beyondWealthLogo from "@/assets/beyond-wealth-logo.png";
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
      <header className="border-b border-border/80 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <img src={incubeCapitalLogo} alt="Incube Capital" className="h-11 w-auto object-contain sm:h-14" />
          <div className="flex items-center gap-3 border-l border-border pl-4 sm:gap-4 sm:pl-6">
            <p className="hidden max-w-32 text-right text-[10px] font-semibold uppercase leading-4 tracking-[0.16em] text-muted-foreground sm:block">
              Celebrating a five-year journey
            </p>
            <img src={fiveYearsMark} alt="5 years completed" className="h-14 w-auto object-contain sm:h-16" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl lg:min-h-[calc(100vh-97px)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative flex flex-col justify-center overflow-hidden border-b border-border px-5 py-12 sm:px-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-16">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <p className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-accent-foreground">
              <span className="h-px w-8 bg-accent" /> An exclusive gathering
            </p>
            <img src={beyondWealthLogo} alt="Beyond Wealth — Investment Perspectives, Market Outlook" className="w-full object-contain" />
            <div className="mt-9 border-t border-border pt-7">
              <p className="max-w-lg font-display text-2xl leading-snug text-primary sm:text-3xl">
                An evening of perspectives designed for your family’s financial future.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-success" />
                <span>Your information will be used only for event registration.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-9">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-success">Guest registration</p>
              <h1 className="mt-3 font-display text-4xl text-primary sm:text-5xl">Reserve your place</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Please share the attendee details below.</p>
            </div>

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
                    <Label htmlFor="kids">Kids <span className="font-normal text-muted-foreground">(optional)</span></Label>
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
              <Button type="submit" size="lg" className="h-13 w-full text-sm sm:w-auto sm:min-w-52" disabled={isSubmitting}>
                {isSubmitting ? "Saving registration…" : "Complete registration"} {!isSubmitting && <ArrowRight />}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
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