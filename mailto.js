/**
 * Shared mailto URL builder for GDPR erasure requests.
 * Used by both background.js (service worker) and popup.js.
 */

function buildMailtoUrl(site) {
  const today = new Date().toISOString().split("T")[0];
  const subject =
    "Begäran om radering av personuppgifter enligt GDPR artikel 17";

  const recipient = site.orgNumber
    ? `${site.dataController} (org.nr ${site.orgNumber})`
    : site.dataController;

  const body = `Till ${recipient},

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
**[ANGE DITT NAMN]**

Datum: ${today}

---
Detta meddelande skickades automatiskt via tillägget "GDPR Remove".`;

  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
