import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, CalendarDays, Check, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { z } from "zod";

import fiveYearsMark from "@/assets/five-years-mark.png";
import incubeCapitalLogo from "@/assets/incube-capital-logo.png";
import aboutTrust from "@/assets/about-trust.jpg";
import aboutGrowth from "@/assets/about-growth.jpg";
import aboutConversation from "@/assets/about-conversation.jpg";
import debendraRout from "@/assets/debendra-rout.png.asset.json";
import drShyamBhat from "@/assets/dr-shyam-bhat.png.asset.json";
import jugalPopat from "@/assets/jugal-popat.png.asset.json";
import niranjanAvasthi from "@/assets/niranjan-avasthi.png.asset.json";
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

const programme = [
  { time: "10:15–10:30 AM", title: "Journey of Incube Capital", speaker: "Mr. Debendra Rout" },
  { time: "10:30–11:00 AM", title: "Market Outlook", speaker: "Niranjan Avasthi" },
  { time: "11:00 AM–12:00 PM", title: "Purpose of Wealth & Well-Being", speaker: "Dr. Shyam K Bhat" },
  { time: "12:00–12:45 PM", title: "Estate Planning", speaker: "Mr. Jugal Popat" },
  { time: "12:45 PM onwards", title: "Lunch & Conversations", speaker: "Hosted by Incube Capital" },
];

const speakers = [
  {
    name: "Mr. Debendra Rout",
    role: "Founder, Incube Capital",
    line: "Journey of Incube Capital · 10:15 AM",
    image: debendraRout.url,
    bio: "Founder of Incube Capital, with extensive experience across investment distribution, financial services, and multiple market cycles. His strengths span portfolio management, asset allocation, and bespoke goal-based investment planning.",
  },
  {
    name: "Niranjan Avasthi",
    role: "Author, Mango Millionaire · President, Edelweiss Asset Management Ltd.",
    line: "Market Outlook · 10:30 AM",
    image: niranjanAvasthi.url,
    bio: "A finance leader and author credited with engineering one of the most remarkable growth stories in India’s mutual fund industry. With over two decades in asset management, he scaled Edelweiss AMC’s AUM from Rs. 6,000 crore to over Rs. 1,75,000 crore, taking the firm from 26th position to among India’s top 15 mutual fund houses. He is the architect of BHARAT Bond ETF, India’s first Bond ETF, and a pioneer of the Target Maturity Fund category. A qualified Cost and Management Accountant and Pune University rank holder, he serves on the AMFI ETF Committee and multiple SEBI sub-committees. He is co-author of Mango Millionaire, which simplifies personal finance for the everyday investor.",
  },
  {
    name: "Dr. Shyam K Bhat",
    role: "Psychiatrist & Integrative Medicine Specialist",
    line: "Purpose of Wealth & Well-Being · 11:00 AM",
    image: drShyamBhat.url,
    bio: "A psychiatrist, psychotherapist, and integrative medicine specialist regarded as a pioneer of holistic psychiatry in India. US board certified in Psychiatry, Internal Medicine, and Psychosomatic Medicine, he founded the Mind-Body Clinic, Seraniti, and Nirvikalpa: The Centre for Human Potential.",
  },
  {
    name: "Mr. Jugal Popat",
    role: "Co-founder, WillJini",
    line: "Estate Planning & Transfer of Wealth · 12:00 PM",
    image: jugalPopat.url,
    bio: "Co-founder of WillJini and a pioneer of online will writing in India. Since 2014, the firm has supported more than 15,000 families across 480+ cities and 30+ countries with wills, private family trusts, and inheritance assistance.",
  },
];

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
          <h1 className="text-4xl font-normal text-foreground sm:text-5xl">Thank you, {submittedName}.</h1>
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
             <div className="flex w-max items-center gap-3 text-[10px] font-medium text-foreground sm:gap-8 sm:text-sm">
               <a href="#event" className="hidden transition-colors hover:text-brand-green sm:inline">Event</a>
               <a href="#about" className="transition-colors hover:text-brand-green">About</a>
               <a href="#programme" className="transition-colors hover:text-brand-green">Programme</a>
               <a href="#voices" className="transition-colors hover:text-brand-green">Voices</a>
               <a href="#register" className="bg-brand-green px-2.5 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-5 sm:py-2.5">Register</a>
            </div>
          </nav>
        </div>
      </header>

      <section id="event" className="scroll-mt-20 bg-background px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <div className="relative mx-auto flex min-h-[calc(100vh-13rem)] max-w-7xl flex-col justify-center overflow-hidden border-y border-border py-12 sm:py-16 lg:py-20">
           <span className="pointer-events-none absolute -right-10 -top-16 select-none text-[20rem] font-light leading-none text-secondary/70 sm:text-[28rem]" aria-hidden="true">5</span>

          <div className="relative z-10 grid items-end gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col gap-9 lg:col-span-8 lg:gap-12">
              <div className="flex items-center gap-4">
                <span className="h-8 w-px bg-accent" aria-hidden="true" />
                 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground sm:text-sm">Incube Capital presents</p>
              </div>

              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-accent">1st edition · An exclusive gathering</p>
                 <h1 className="font-display text-7xl leading-[0.82] text-event-ink sm:text-8xl md:text-9xl lg:text-[9.5rem]">
                  Beyond<br />Wealth
                </h1>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-foreground sm:text-sm">Inaugural event of Incube Capital</p>
              </div>

              <div className="flex items-center gap-5">
                <span className="border border-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent sm:text-xs">Five-year anniversary edition</span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>
            </div>

            <div className="flex flex-col gap-8 lg:col-span-4">
               <img src={fiveYearsMark} alt="5 years of commitment" className="h-32 w-40 object-contain sm:h-40 sm:w-48" />
               <p className="max-w-sm text-2xl leading-snug text-foreground">
                 A day of meaningful conversations on Wealth &amp; Well-being, thoughtfully curated exclusively for our clients.
              </p>
              <dl className="grid grid-cols-2 gap-6 border-y border-border py-6 lg:grid-cols-1">
                <div>
                  <dt className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"><CalendarDays className="size-4" /> Date</dt>
                   <dd className="text-base font-medium text-foreground sm:text-lg">Sunday, 25 October 2026</dd>
                </div>
                 <div>
                   <dt className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"><Clock3 className="size-4" /> Time</dt>
                    <dd className="text-base font-medium text-foreground sm:text-lg">10:15 AM – 1:00 PM</dd>
                 </div>
                 <div className="col-span-2 lg:col-span-1">
                   <dt className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"><MapPin className="size-4" /> Address</dt>
                    <dd className="text-base font-medium text-foreground sm:text-lg">Hilton Garden Inn, Whitefield, Bangalore, Karnataka, 560048</dd>
                 </div>
              </dl>
               <Button asChild size="lg" className="h-13 w-fit rounded-none px-8 uppercase tracking-[0.12em]">
                 <a href="#register">Reserve my seat <ArrowRight /></a>
              </Button>
            </div>
          </div>

          <a href="#about" aria-label="Continue to About the event" className="relative z-10 mt-12 flex size-10 items-center justify-center border border-border text-primary transition-colors hover:border-accent hover:text-accent">
            <ArrowDown className="size-4" />
          </a>
        </div>
      </section>

       <section id="about" className="scroll-mt-20 bg-background px-5 py-20 sm:px-8 lg:py-28">
         <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
           <div>
             <SectionHeading eyebrow="About the gathering" title="Perspectives beyond the wealth" />
             <div className="mt-8 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
               <p>Five years of conviction, clarity, and compounding trust, and this is only the beginning. Beyond Wealth marks Incube Capital's milestone anniversary with an exclusive gathering crafted for those who understand that true wealth is built on perspective, not just portfolios.</p>
               <p>This inaugural edition takes a deeper look at the journey that shaped Incube Capital, paired with a sharp, forward-looking lens on market dynamics and investment opportunities in an ever-evolving landscape.</p>
               <p>A conversation designed not just for the informed investor, but for the discerning one, where strategy meets vision, and numbers find their narrative.</p>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-3" aria-label="Wealth, growth, and meaningful conversations">
             <img src={aboutTrust} alt="A trusted financial conversation" loading="lazy" width={1200} height={912} className="aspect-[4/3] w-full rounded-md object-cover" />
             <img src={aboutGrowth} alt="Long-term growth and stewardship" loading="lazy" width={1200} height={912} className="aspect-[4/3] w-full rounded-md object-cover" />
             <img src={aboutConversation} alt="Guests connecting through meaningful conversation" loading="lazy" width={1408} height={704} className="col-span-2 aspect-[2/1] w-full rounded-md object-cover" />
           </div>
        </div>
      </section>

       <section id="programme" className="scroll-mt-20 border-y border-primary/10 bg-secondary/45 px-5 py-20 sm:px-8 lg:py-28">
         <div className="mx-auto max-w-6xl">
           <SectionHeading eyebrow="Agenda" title="Sunday, 25 October 2026" centered />
            <div className="mx-auto mt-14 max-w-5xl border-t border-border">
             {programme.map((item) => (
                <div key={item.time} className="grid gap-3 border-b border-border py-7 transition-colors hover:bg-background sm:grid-cols-[11rem_1fr_13rem] sm:items-baseline sm:gap-8 sm:px-6">
                  <p className="text-sm font-semibold text-brand-green">{item.time}</p>
                  <p className="font-display text-xl text-event-ink sm:text-2xl">{item.title}</p>
                  <p className="text-sm text-muted-foreground sm:text-right sm:italic">{item.speaker}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      <section id="voices" className="scroll-mt-20 bg-background px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
           <SectionHeading eyebrow="The voices in the room" title="Speakers" centered />
            <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2">
              {speakers.map((speaker) => (
                 <article key={speaker.name} className="flex flex-col border border-border bg-background p-6 sm:p-8">
                   <img src={speaker.image} alt={speaker.name} loading="lazy" width={500} height={500} className="size-20 rounded-full border-2 border-background object-cover shadow-editorial" />
                   <h3 className="mt-6 font-display text-2xl text-event-ink">{speaker.name}</h3>
                   <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-green">{speaker.role}</p>
                   <p className="mt-5 flex-1 text-sm leading-7 text-muted-foreground">{speaker.bio}</p>
                   <p className="mt-7 border-t border-border pt-4 text-xs font-medium text-muted-foreground">{speaker.line}</p>
                 </article>
            ))}
          </div>
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
                 <p className="mb-5 text-xl font-medium text-foreground">Attendee details</p>
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
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/60">Incube Capital · Beyond Wealth · 1st Edition</p>
          <p className="mx-auto mt-4 max-w-3xl text-[10px] leading-5 text-muted-foreground">Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.</p>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, centered = false }: { eyebrow: string; title: string; centered?: boolean }) {
  return (
    <div className={centered ? "text-center" : undefined}>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-strong">{eyebrow}</p>
       <h2 className="mt-4 font-display text-4xl font-normal leading-tight text-event-ink sm:text-5xl">{title}</h2>
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