import type { Copy } from "./catalog.ts";

type Pillar = { slug: string; title: Copy; intro: Copy; approach: Copy; example: Copy; capabilities: Copy[] };
export const pillars: readonly Pillar[] = [
  {
    slug: "business-consulting",
    title: ["Business consulting & process engineering", "Consultanță de business și ingineria proceselor"],
    intro: ["Find where work gets stuck and agree how it should move before investing in new tools.", "Identificăm unde se blochează activitatea și stabilim cum ar trebui să funcționeze înainte să investești în instrumente noi."],
    approach: ["We trace actual work, document requirements and responsibilities, and design a process your team can use. Start with a paid audit of one workflow and review the findings on a discovery call.", "Urmărim activitatea reală, documentăm cerințele și responsabilitățile și proiectăm un proces pe care echipa îl poate aplica. Poți începe cu un audit contra cost al unui flux, urmat de un apel în care discutăm concluziile."],
    example: ["For a service firm that reconciles approvals across Excel and email, the audit can produce a process map, approval rules and an ordered improvement plan.", "Pentru o firmă de servicii care centralizează aprobările din Excel și e-mail, auditul poate livra o hartă a procesului, reguli de aprobare și un plan cu priorități."],
    capabilities: [["Process mapping and operational assessment","Cartografierea proceselor și evaluare operațională"],["Workflow optimization and business requirements","Optimizarea fluxurilor și documentarea cerințelor"],["Process, system and data architecture","Arhitectura proceselor, sistemelor și datelor"],["Automation opportunities and digital transformation planning","Identificarea oportunităților de automatizare și planificarea transformării digitale"]],
  },
  {
    slug: "intelligent-automation",
    title: ["AI & intelligent automation", "AI și automatizare inteligentă"],
    intro: ["Reduce repetitive work with workflows and assistants built around defined rules, reliable inputs and human review.", "Reducem munca repetitivă prin fluxuri și asistenți bazați pe reguli clare, date fiabile și verificare umană."],
    approach: ["We identify which steps need rules, which benefit from AI, and where a person should decide. We test with representative inputs and agree how exceptions are handled.", "Stabilim pașii care au nevoie de reguli, unde ajută AI și unde decizia trebuie să rămână la o persoană. Testăm cu date reprezentative și definim gestionarea excepțiilor."],
    example: ["A document intake workflow could extract fields, classify the request and route ambiguous records for review before updating a report.", "Un flux de preluare a documentelor poate extrage câmpurile, clasifica cererea și trimite înregistrările ambigue la verificare înainte de actualizarea raportului."],
    capabilities: [["AI assistants and agents","Asistenți și agenți AI"],["Document processing, extraction and classification","Procesarea documentelor, extragerea și clasificarea datelor"],["Routing, notifications and reporting","Distribuirea cererilor, notificări și raportare"],["Microsoft 365 automation and custom AI integrations","Automatizări Microsoft 365 și integrări AI la comandă"]],
  },
  {
    slug: "software-integrations",
    title: ["Custom software & integrations", "Software la comandă și integrări"],
    intro: ["Build a better way to work around the data, systems and decisions your project actually needs.", "Construim instrumente în jurul datelor, sistemelor și deciziilor de care proiectul tău are nevoie."],
    approach: ["We define the users, data model, system boundaries and acceptance criteria, then build and test in increments. We plan how the solution can be maintained and extended.", "Definim utilizatorii, modelul de date, limitele sistemului și criteriile de acceptare, apoi dezvoltăm și testăm pe etape. Planificăm cum va fi întreținută și extinsă soluția."],
    example: ["An internal request portal could connect an existing database to a dashboard showing status, owners and exceptions.", "Un portal intern de cereri poate conecta baza de date existentă la un tablou de bord cu starea cererilor, responsabilii și excepțiile."],
    capabilities: [["Web apps and internal tools","Aplicații web și instrumente interne"],["API and platform integrations","Integrări prin API și între platforme"],["Database-backed workflows and dashboards","Fluxuri bazate pe baze de date și tablouri de bord"],["Modernization of existing systems","Modernizarea sistemelor existente"]],
  },
];

export const method: readonly { title: Copy; detail: Copy }[] = [
  {title:["Discover","Descoperim"], detail:["Map the work, the people and the places where it slows down.","Cartografiem activitatea, rolurile și punctele în care apar întârzieri."]},
  {title:["Design","Proiectăm"], detail:["Agree on responsibilities, data and the right solution.","Stabilim responsabilitățile, datele necesare și soluția potrivită."]},
  {title:["Build","Construim"], detail:["Implement in stages and validate against real scenarios.","Implementăm pe etape și verificăm soluția în scenarii reale."]},
  {title:["Optimize","Îmbunătățim"], detail:["Review results, handle exceptions and refine the system.","Evaluăm rezultatele, tratăm excepțiile și ajustăm sistemul."]},
];
