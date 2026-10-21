import { getRepos } from "./actions/getRepos";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "~/lib/contact";
import { translations } from "~/lib/translations";

import HomePage from "./client-page";

// Only About is in the first HTML (the other sections render when opened
// from the board), so search engines get the essentials as structured data.
const { about, experience } = translations.en;
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Alexandre Arabian",
  jobTitle: "Software Engineer",
  email: `mailto:${EMAIL}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Barcelona",
    addressCountry: "ES",
  },
  sameAs: [LINKEDIN_URL, GITHUB_URL],
  alumniOf: experience.education.items.map((item) => ({
    "@type": "EducationalOrganization",
    name: item.school,
  })),
  knowsLanguage: about.languages.map((item) => item.name),
};

export default async function page() {
  const repos = await getRepos();

  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so no string in it can close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(person).replace(/</g, "\\u003c"),
        }}
      />
      <HomePage repos={repos} />
    </>
  );
}
