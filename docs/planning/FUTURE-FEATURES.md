# Future features

Ideas for after the MVP. Nothing here is committed work. Each entry says what it is, why it would matter, what it builds on, and roughly how big it is, so it can be picked up and planned properly when its time comes.

How to use this file: when an idea is chosen, write a plan for it (the same shape as [MVP-PLAN.md](MVP-PLAN.md)), move it out of this file, and record the decision in [../decisions/DECISIONS.md](../decisions/DECISIONS.md). New ideas go at the bottom of the right section, one entry each.

Sizes: S is days, M is a week or two, L is a month or more.

## Suggested order after the MVP

1. **Resume PDF export.** Cheap on top of the profile, and the clearest reason to come back.
2. **GitHub import.** Fits the developer audience and makes intake almost effortless.
3. **Paid tier and custom domains.** Turns usage into revenue once people rely on the product.
4. **Job-specific versions and the match score.** The strongest reason to pay.
5. **"Ask my portfolio" chat.** The most distinctive feature, and the one that needs the most care.

## 1. More from one profile

These all rest on the core design: one master profile, many written views.

| Feature                           | What it is                                                                                                                                                             | Why it matters                                                                                 | Builds on                                       | Size |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---- |
| **Resume PDF export**             | A one or two page CV generated from the same profile, in a matching style, as a PDF.                                                                                   | The site and the CV never drift apart. People apply with a CV far more often than with a link. | Profile, templates as pure components           | M    |
| **Job-specific version**          | Paste a job description and get a tailored portfolio at a private link for that one application.                                                                       | Tailoring is what recruiters respond to, and nobody does it because it is slow.                | `target_role`, snapshots, the generation prompt | M    |
| **Job match report**              | For a pasted job description: what in your profile matches, what is missing, and which real projects to lead with. It never suggests claiming a skill you do not have. | Honest guidance before applying. A natural paid feature.                                       | Profile, gap detection                          | M    |
| **Cover letter draft**            | A short letter for a specific job, written only from profile facts, with gaps marked.                                                                                  | Same facts, one more output people need.                                                       | Profile, generation, the no-invented-facts rule | S    |
| **LinkedIn and bio pack**         | Headline, About section, and short bios (one line, 50 words, 150 words) for other sites, kept in sync with the profile.                                                | People need the same story in many places.                                                     | Profile, generation                             | S    |
| **Interview prep sheet**          | Likely questions about your own projects, with answer outlines built from what you actually did.                                                                       | Turns the stored detail into something useful on interview day.                                | Profile, project case studies                   | S    |
| **Portfolio in another language** | A translated portfolio from the same profile, with its own slug.                                                                                                       | Opens non-English markets and helps people applying abroad.                                    | One-profile-many-portfolios                     | M    |
| **Link-in-bio page**              | A compact single-screen version of the portfolio for social profiles.                                                                                                  | A second, lighter public surface from the same data.                                           | Templates, profile                              | S    |

## 2. Easier intake

| Feature                                | What it is                                                                                                          | Why it matters                                                                   | Builds on                       | Size |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------- | ---- |
| **GitHub import**                      | Connect GitHub, pick repositories, and get drafted project case studies from READMEs, languages and commit history. | Developers already have the evidence. This removes the typing.                   | Intake sessions, profile merge  | M    |
| **LinkedIn data import**               | Upload the data export LinkedIn lets every user download, and extract experience and education from it.             | Many people keep LinkedIn more current than their CV. An upload avoids scraping. | CV extraction path              | S    |
| **Voice answers**                      | Answer interview questions by speaking.                                                                             | People explain their work better aloud than in writing.                          | AI interview                    | M    |
| **Import from an existing site**       | Give a URL to an old portfolio and extract its content into the profile for confirmation.                           | Removes the cost of switching to Folix.                                          | Extraction, confirmation screen | M    |
| **Design tool and case study imports** | Bring in projects from Behance, Dribbble or Figma for designers.                                                    | Needed if designers become an audience.                                          | Intake modes                    | M    |
| **Screenshot to project**              | Upload screenshots of a product and get a drafted description to confirm and correct.                               | Helps people who struggle to start writing.                                      | Image assets, extraction        | M    |
| **Keep-it-fresh check-in**             | A short, occasional prompt: "Anything new since March?" One answer updates the profile.                             | Portfolios go stale. This keeps them alive with almost no effort.                | Interview state machine, email  | S    |

## 3. Better writing and editing

| Feature                      | What it is                                                                                            | Why it matters                                                               | Builds on                    | Size   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------- | ------ |
| **Writing coach**            | Per-section feedback: vague claims, missing outcomes, buzzwords, passive voice, with a suggested fix. | Teaches people to describe their work, and raises the quality of every page. | Gap detection, rewrite       | M      |
| **Evidence prompts**         | When a claim has no number, ask a specific question to find one ("roughly how many users?").          | Specifics are what make copy believable, and they must come from the user.   | Gap check                    | S      |
| **Version history**          | Every publish is kept. Compare versions and restore one.                                              | Safety net, and confidence to experiment.                                    | Published snapshots          | M      |
| **Personal voice**           | Learn tone from a writing sample the user provides, and write in it.                                  | Stops every portfolio sounding the same.                                     | Generation prompt            | M      |
| **Project deep-dive pages**  | A long-form page per project at `/<slug>/<project>`, with images and sections.                        | Senior candidates need room to show depth.                                   | Templates, content schema    | M      |
| **Rich media**               | Image galleries, embedded video, before and after comparisons.                                        | Visual work needs to be shown, not described.                                | Assets                       | M      |
| **Section library**          | Optional sections: talks, publications, open source, certifications, volunteering, "now".             | Fits more kinds of career without template changes.                          | `SectionId` set, templates   | S each |
| **Comments from a reviewer** | Share a private draft link and collect comments from a friend or mentor.                              | People want a second opinion before publishing.                              | Draft content, private links | M      |

## 4. Reach and proof

| Feature                      | What it is                                                                                                                              | Why it matters                                                                             | Builds on                        | Size |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------- | ---- |
| **Custom domains**           | Serve a portfolio on the user's own domain.                                                                                             | Looks professional. The standard paid feature.                                             | Public page lookup, `proxy.ts`   | M    |
| **"Ask my portfolio" chat**  | Visitors ask questions and get answers drawn only from the profile, with a clear "I do not have that information" when it is not there. | A recruiter gets answers at midnight. Distinctive, and true to the no-invented-facts rule. | Profile, AI wrapper, rate limits | L    |
| **Verified testimonials**    | Ask a colleague for a short testimonial by link. They confirm by email, and it shows as verified.                                       | Social proof that cannot be faked by the owner.                                            | Extras section, email            | M    |
| **Verified links**           | Prove ownership of a GitHub account, a domain or a package, and show a verified mark.                                                   | Reduces impersonation and adds trust.                                                      | Auth providers, links            | M    |
| **Recruiter view**           | A one-click summary for busy readers: role, years, top three projects, how to contact.                                                  | Respects how recruiters actually read.                                                     | Templates, profile               | S    |
| **Better analytics**         | Which sections are read, how far people scroll, which company networks visit (where the law allows), weekly email summary.              | Tells people what is working. A paid feature.                                              | `page_events`                    | M    |
| **Privacy modes**            | Password-protected portfolios, expiring links, hide from search.                                                                        | People job-hunting quietly need control over who sees what.                                | Publish settings                 | S    |
| **QR code and contact card** | A QR code and a downloadable contact card for events and printed CVs.                                                                   | Small, useful, cheap.                                                                      | Public page                      | S    |
| **Availability status**      | "Open to work", "Freelance from March", with an optional booking link.                                                                  | The first thing a visitor wants to know.                                                   | Basics section                   | S    |

## 5. Design

| Feature                  | What it is                                                                           | Why it matters                                       | Builds on         | Size   |
| ------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------- | ----------------- | ------ |
| **More templates**       | Templates for more fields: designer, researcher, writer, product manager, student.   | Each new audience needs a layout that fits its work. | Template registry | M each |
| **Theme controls**       | More accents and font pairs, a dark or light choice per portfolio, density options.  | Lets people make it theirs without breaking it.      | Theme token sets  | S      |
| **Brand extraction**     | Suggest an accent colour and font pair from an uploaded photo or logo.               | A personal look in one click.                        | Theme, assets     | S      |
| **Motion presets**       | Optional, tasteful entrance and scroll effects per template, off for reduced motion. | Polish that people associate with expensive sites.   | Templates         | S      |
| **Template marketplace** | Templates made by invited designers, with revenue share.                             | Variety without building every template in-house.    | Template contract | L      |

## 6. Business

| Feature                     | What it is                                                                                                                     | Why it matters                                                      | Builds on                              | Size |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------- | ---- |
| **Paid tier**               | Free: one portfolio with a small Folix badge. Paid: second portfolio, no badge, analytics, custom domain, higher AI allowance. | Revenue.                                                            | Limits in one file, server-side checks | M    |
| **Student plan**            | Free or cheap paid features with a verified student email.                                                                     | Students become paying professionals.                               | Paid tier                              | S    |
| **Teams and bootcamps**     | An organisation buys seats, sees its members' progress, and applies a shared template.                                         | One sale, many users. Bootcamps and universities need exactly this. | Ownership model                        | L    |
| **Agency mode**             | A freelancer or agency manages portfolios for clients.                                                                         | Opens a professional-services market.                               | Teams                                  | L    |
| **Referral credit**         | Extra AI allowance or a free month for inviting someone who publishes.                                                         | Cheap growth.                                                       | Paid tier, usage limits                | S    |
| **Public API and webhooks** | Read your own profile and portfolio as JSON, and get notified on publish.                                                      | Lets developers pull their Folix data into their own site.          | Content as validated JSON              | M    |

## 7. Platform

| Feature                          | What it is                                                                                                                 | Why it matters                                               | Builds on                       | Size |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------- | ---- |
| **Background worker**            | A small worker for long jobs: bulk imports, PDF rendering, scheduled emails.                                               | Needed as soon as a job cannot finish inside one request.    | Packages with no app dependency | M    |
| **Export everything**            | Download the profile and portfolios as JSON, Markdown and a static site archive.                                           | No lock-in builds trust, and it is the right thing to offer. | Content schema, templates       | S    |
| **Self-host the published site** | Export a static copy of a portfolio to host anywhere.                                                                      | Appeals strongly to developers.                              | Templates                       | M    |
| **Admin console**                | Review reports, take pages down, see usage and cost, manage users.                                                         | Needed once there is real traffic and real abuse.            | `reports`, `ai_usage`           | M    |
| **Automated abuse checks**       | Scan new public pages for phishing patterns and suspicious links before they go live.                                      | Protects the shared domain's reputation.                     | Publish step                    | M    |
| **Model evaluation suite**       | An automated score for prompts: invented facts, lock violations, length, tone. Runs before a prompt or model change ships. | Makes it safe to change prompts and switch models.           | AI fixtures                     | M    |
| **Mobile editing polish**        | An editor designed for phones, not just usable on them.                                                                    | Many people will edit from a phone.                          | Editor                          | M    |

## Ideas considered and set aside

| Idea                                                         | Why not, for now                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| A free-form page builder with drag and drop                  | It competes with general site builders and loses the "written for you" advantage. Templates plus sections cover the need. |
| Custom HTML, CSS or scripts in portfolios                    | A security and abuse risk on a shared domain. Forbidden by the rules.                                                     |
| A job board or applying to jobs from Folix                   | A different business with different users (employers).                                                                    |
| A social feed of portfolios                                  | Moderation cost with little benefit to the person looking for work.                                                       |
| Scraping LinkedIn or other sites on the user's behalf        | Against those sites' terms and fragile. The user's own data export achieves the same.                                     |
| Writing claims the user did not make, to "improve" a profile | Breaks the first product rule. Never.                                                                                     |
