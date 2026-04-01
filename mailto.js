/**
 * Shared mailto URL builder for GDPR erasure requests.
 * Used by both background.js (service worker) and popup.js.
 */

const DEFAULT_SUBJECT =
  "Begäran om radering av personuppgifter enligt GDPR artikel 17";

function buildDefaultBody(recipient, today, userName) {
  const nameField = userName || "**[ANGE DITT NAMN]**";
  return `Till ${recipient},

Jag utövar härmed min rätt till radering av personuppgifter i enlighet med artikel 17 i EU:s dataskyddsförordning (GDPR).

Jag begär att ni utan onödig fördröjning raderar samtliga personuppgifter som ni har samlat in och behandlat om mig, inklusive men inte begränsat till:

- Cookies och spårningsdata
- Annonsprofiler och riktad annonsdata
- Webbläsarhistorik och beteendedata
- Eventuella andra personuppgifter kopplade till min IP-adress eller enhet

Enligt artikel 17.1 har jag rätt till radering bland annat när:
(a) personuppgifterna inte längre är nödvändiga för de ändamål de samlades in
(d) personuppgifterna har behandlats på ett otillåtet sätt

Jag begär även att ni bekräftar raderingen skriftligen inom 30 dagar i enlighet med artikel 12.3 i GDPR.

Om ni anser att det finns skäl att avvisa denna begäran, ber jag er att specificera den juridiska grunden för detta.

Med vänliga hälsningar,
${nameField}

Datum: ${today}

---
Detta meddelande skickades automatiskt via tillägget "GDPR Remove".`;
}

const IMY_COMPLAINT_SUBJECT = "Klagomål — utebliven radering av personuppgifter";

function buildImyComplaintUrl(site, templateSettings) {
  const today = new Date().toISOString().split("T")[0];
  const userName = templateSettings ? templateSettings.userName : "";
  const nameField = userName || "**[ANGE DITT NAMN]**";

  const orgLine = site.orgNumber
    ? `Org.nummer: ${site.orgNumber}`
    : "";

  const body = `Till Integritetsskyddsmyndigheten,

Jag vill lämna ett klagomål avseende ${site.dataController}${site.orgNumber ? ` (org.nr ${site.orgNumber})` : ""}.

Jag skickade en begäran om radering av mina personuppgifter i enlighet med GDPR artikel 17 till ovanstående organisation. Mer än 30 dagar har passerat utan att jag fått en bekräftelse på radering eller ett motiverat avslag, i strid med artikel 12.3 i GDPR.

Jag begär att Integritetsskyddsmyndigheten utreder ärendet.

Personuppgiftsansvarig: ${site.dataController}
${orgLine}${orgLine ? "\n" : ""}Kontaktadress: ${site.email}

Med vänliga hälsningar,
${nameField}

Datum: ${today}`;

  return `mailto:${encodeURIComponent("imy@imy.se")}?subject=${encodeURIComponent(IMY_COMPLAINT_SUBJECT)}&body=${encodeURIComponent(body)}`;
}

function buildMailtoUrl(site, templateSettings) {
  const today = new Date().toISOString().split("T")[0];

  const recipient = site.orgNumber
    ? `${site.dataController} (org.nr ${site.orgNumber})`
    : site.dataController;

  const userName = templateSettings ? templateSettings.userName : "";
  const subject = (templateSettings && templateSettings.subject) || DEFAULT_SUBJECT;
  const body = (templateSettings && templateSettings.body)
    ? templateSettings.body
        .replace("{{mottagare}}", recipient)
        .replace("{{datum}}", today)
        .replace("{{namn}}", userName || "**[ANGE DITT NAMN]**")
    : buildDefaultBody(recipient, today, userName);

  const safeEmail = site.email.replace(/[?&#]/g, "");
  return `mailto:${encodeURIComponent(safeEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
