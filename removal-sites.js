/**
 * On-demand removal sites — Swedish people-search and data broker services.
 * Source: https://www.polisforbundet.se/arbetsmiljo-rattshjalp/hot-och-vald-mot-poliser/minska-din-synlighet-pa-internet
 *
 * type: "email" — opens a mailto: link with a GDPR erasure request
 * type: "url"   — opens the site's removal/contact page in a new tab
 */

const REMOVAL_SITES = [
  {
    name: "Ratsit",
    type: "email",
    email: "kundservice@ratsit.se",
    dataController: "Ratsit AB",
    orgNumber: "556740-2478",
    description: "Personnummer, inkomst, fordon m.m.",
  },
  {
    name: "Upplysning.se",
    type: "email",
    email: "info@upplysning.se",
    dataController: "Upplysning.se",
    orgNumber: "",
    description: "Personuppgifter och adressregister",
  },
  {
    name: "Mrkoll",
    type: "email",
    email: "hej@nusvar.se",
    dataController: "Nusvar AB",
    orgNumber: "",
    description: "Personnummer, adress, fordon m.m.",
  },
  {
    name: "Eniro",
    type: "url",
    url: "https://www.eniro.se/kontakt",
    description: "Telefonnummer och adressregister (kräver BankID)",
  },
  {
    name: "Merinfo",
    type: "url",
    url: "https://www.merinfo.se/ta-bort-mina-uppgifter",
    description: "Personuppgifter (kräver BankID)",
  },
  {
    name: "Hitta.se",
    type: "url",
    url: "https://www.hitta.se/kontakta-oss",
    description: "Telefonnummer och adressregister (kräver BankID)",
  },
  {
    name: "Birthday.se",
    type: "url",
    url: "https://app.minauppgifter.se/birthday/bankidlogin",
    description: "Födelsedagsregister (kräver BankID)",
  },
  {
    name: "180.se",
    type: "url",
    url: "https://www.180.se/kontakta",
    description: "Telefonnummerregister",
  },
  {
    name: "Google (Right to be Forgotten)",
    type: "url",
    url: "https://reportcontent.google.com/forms/rtbf",
    description: "Ta bort sökresultat (kräver ID-kopia)",
  },
];
