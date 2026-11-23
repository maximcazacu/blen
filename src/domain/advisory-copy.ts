import type { Copy } from "./catalog.ts";
import { advisoryServices, type Area, type CostKey } from "./advisory.ts";

type Service = {title:Copy;summary:Copy;signs:Copy;approach:Copy;deliverables:Copy;client:Copy;tools:Copy;example:Copy};
export const serviceCopy:Record<typeof advisoryServices[number],Service> = {
  "process-audit":{
    title:["Business Process Audit","Audit de procese de business"],
    summary:["A paid audit maps how a process works today and identifies where it gets stuck. We review the findings with you on a discovery call.","Auditul contra cost documentează modul de lucru actual și identifică blocajele. Discutăm concluziile împreună într-un apel după audit."],
    signs:["The same information is entered twice. Teams disagree about where a request is waiting or who should act next.","Aceleași informații sunt introduse de două ori. Echipele nu știu unde a rămas o cerere sau cine trebuie să intervină."],
    approach:["Interview stakeholders, observe the current workflow, then map handoffs, systems, data and exceptions. We check suspected causes against examples.","Discutăm cu persoanele implicate, observăm fluxul actual și cartografiem transferurile, sistemele, datele și excepțiile. Verificăm cauzele presupuse pe exemple."],
    deliverables:["Current-state map (AS-IS), register of issues and dependencies, and a prioritized action plan.","Hartă a procesului actual (AS-IS), registru de probleme și dependențe și plan de acțiune prioritizat."],
    client:["Identify the process owner, make key people available and confirm how the work happens in practice.","Desemnează responsabilul de proces, facilitează discuțiile cu echipa și confirmă cum se desfășoară activitatea în practică."],
    tools:["Process maps, interviews and selected examples from existing systems.","Hărți de proces, interviuri și exemple selectate din sistemele folosite."],
    example:["A distributor traces a purchase request from the first email to order placement and identifies which handoffs to investigate.","Un distribuitor urmărește o cerere de achiziție de la primul e-mail până la comandă și identifică transferurile care merită analizate."],
  },
  "process-optimization":{
    title:["Process Design & Optimization","Proiectare și optimizare de procese"],
    summary:["Define a repeatable workflow with clear owners, approvals and exceptions.","Definim un flux repetabil, cu responsabili, aprobări și excepții clare."],
    signs:["Every department handles the same request differently. Exceptions depend on a person remembering whom to ask.","Fiecare departament gestionează diferit aceeași cerere. Excepțiile depind de cine își amintește pe cine să întrebe."],
    approach:["Design the future workflow, review it with the people who use it, and test normal and exceptional cases before implementation.","Proiectăm fluxul viitor, îl revizuim cu utilizatorii și verificăm cazurile uzuale și excepțiile înainte de implementare."],
    deliverables:["Future-state map (TO-BE), swimlanes, a responsibility matrix, approval rules and a rollout roadmap.","Hartă a procesului viitor (TO-BE), diagramă pe roluri, matrice de responsabilități, reguli de aprobare și plan de implementare."],
    client:["Decide who owns the workflow and who can approve decisions. Validate the rules with the operational team.","Decide cine răspunde de proces și cine poate aproba deciziile. Validează regulile cu echipa operațională."],
    tools:["BPMN-inspired diagrams, decision tables and a RACI matrix when useful.","Diagrame inspirate din BPMN, tabele de decizie și matrice RACI acolo unde ajută."],
    example:["A service team designs one approval flow for discounts, with a separate path for exceptions.","O echipă de servicii proiectează un singur flux de aprobare a discounturilor, cu traseu separat pentru excepții."],
  },
  "data-architecture":{
    title:["Data Architecture & Information Management","Arhitectură de date și managementul informațiilor"],
    summary:["Agree which records are authoritative and how teams should maintain and use them.","Stabilim care este sursa de referință pentru fiecare tip de date și cum o întrețin și folosesc echipele."],
    signs:["Customer records disagree across spreadsheets. Reporting starts with manual checks and corrections.","Datele despre clienți diferă între fișiere. Raportarea începe cu verificări și corecturi manuale."],
    approach:["Inventory sources, define owners and access, map relationships and flows, and specify validation and reporting needs.","Inventariem sursele, definim responsabilii și accesul, mapăm relațiile și fluxurile de date și stabilim regulile de validare și raportare."],
    deliverables:["Data model, ownership map, validation rules and recommendations for integration and reporting.","Model de date, hartă a responsabililor, reguli de validare și recomandări pentru integrare și raportare."],
    client:["Confirm business definitions, confidentiality needs, who owns the records and which source the team trusts today.","Confirmă definițiile de business, cerințele de confidențialitate, responsabilii și sursa pe care echipa o consideră de referință."],
    tools:["Excel, Microsoft Lists, SharePoint, SQL or cloud services may fit after a review of requirements, security and budget.","Excel, Microsoft Lists, SharePoint, SQL sau servicii cloud pot fi potrivite după analiza cerințelor, securității și bugetului."],
    example:["A wholesaler defines separate customer and order records with a shared customer identifier.","Un comerciant en-gros definește evidențe separate pentru clienți și comenzi, legate printr-un identificator de client."],
  },
  "ai-readiness":{
    title:["AI Opportunity & Readiness Assessment","Evaluarea oportunităților și pregătirii pentru AI"],
    summary:["Decide whether a workflow needs a clear rule, an AI-assisted step or a human decision.","Stabilim dacă un flux are nevoie de o regulă clară, de un pas asistat de AI sau de o decizie umană."],
    signs:["Teams repeat document or knowledge work, but the data quality, licensing, oversight and acceptable error rate are unclear.","Echipele repetă sarcini pe documente sau baze de cunoștințe, dar nu sunt clare calitatea datelor, licențele, verificarea și rata de eroare acceptabilă."],
    approach:["Compare rules, AI assistance and manual work. Review data, confidentiality, review points, integration effort and recurring costs.","Comparăm regulile, asistența AI și lucrul manual. Evaluăm datele, confidențialitatea, punctele de verificare, efortul de integrare și costurile recurente."],
    deliverables:["Opportunity matrix, data and oversight requirements, risks and an implementation roadmap.","Matrice de oportunități, cerințe privind datele și verificarea, riscuri și plan de implementare."],
    client:["Define acceptable outputs, nominate reviewers and approve which information any pilot may use.","Definește rezultatele acceptabile, desemnează persoanele care verifică rezultatele și aprobă informațiile care pot fi folosite într-un pilot."],
    tools:["Options may include Copilot Studio, Power Automate, Office Scripts, n8n, assisted document processing or approved retrieval architecture.","Opțiunile pot include Copilot Studio, Power Automate, Office Scripts, n8n, procesarea asistată a documentelor sau căutare în surse aprobate (RAG)."],
    example:["A team compares rule-based invoice checks with assisted extraction and sends ambiguous fields to a human reviewer.","O echipă compară validarea facturilor pe bază de reguli cu extragerea asistată și trimite câmpurile ambigue la verificare umană."],
  },
  "systems-integration":{
    title:["Systems Integration & Workflow Architecture","Integrarea sistemelor și arhitectura fluxurilor"],
    summary:["Design how information moves reliably between applications and who handles exceptions.","Proiectăm cum circulă informațiile între aplicații și cine gestionează excepțiile."],
    signs:["Staff copy values between CRM and ERP. Failed transfers are discovered after someone notices missing records.","Echipa copiază valori între CRM și ERP. Transferurile eșuate ies la iveală când cineva observă înregistrările lipsă."],
    approach:["Check API feasibility, map fields and permissions, and design orchestration, monitoring, error handling and recovery.","Verificăm fezabilitatea API-urilor, mapăm câmpurile și permisiunile și proiectăm coordonarea fluxurilor, monitorizarea, tratarea erorilor și recuperarea."],
    deliverables:["Integration diagram, interface and permissions plan, error scenarios and an operating guide.","Diagramă de integrare, plan de interfețe și permisiuni, scenarii de eroare și ghid de operare."],
    client:["Provide authorized contacts for each system and agree who reviews failed transfers and owns recovery.","Desemnează persoane autorizate pentru fiecare sistem și stabilește cine analizează transferurile eșuate și coordonează recuperarea."],
    tools:["APIs, Microsoft 365, Power Automate or n8n may be considered. Infrastructure and recurring licenses are quoted separately.","Putem evalua API-uri, Microsoft 365, Power Automate sau n8n. Infrastructura și licențele recurente se cotează separat."],
    example:["A sales order reaches the ERP once. A failed transfer is logged and can be retried by an authorized operator.","O comandă de vânzare ajunge o singură dată în ERP. Un transfer eșuat este înregistrat și poate fi reluat de un operator autorizat."],
  },
  "continuous-improvement":{
    title:["Continuous Improvement & Support","Îmbunătățire continuă și suport"],
    summary:["Keep workflows useful as teams, policies and systems change.","Menținem fluxurile utile pe măsură ce echipele, regulile și sistemele se schimbă."],
    signs:["Small failures go unrecorded, documentation falls behind, or only one person knows how the automation works.","Erorile mici nu sunt înregistrate, documentația nu mai este actuală sau doar o persoană știe cum funcționează automatizarea."],
    approach:["Review workflow health, investigate recurring incidents, update documentation and agree a prioritized improvement backlog.","Revizuim starea fluxurilor, analizăm incidentele recurente, actualizăm documentația și prioritizăm îmbunătățirile."],
    deliverables:["Review notes, maintenance plan, onboarding materials, revised documentation and monitoring recommendations.","Note de revizuire, plan de mentenanță, materiale de instruire, documentație actualizată și recomandări de monitorizare."],
    client:["Nominate an operational owner, agree how issues are reported and approve the support terms contractually.","Desemnează un responsabil operațional, stabilește cum se raportează problemele și aprobă contractual condițiile de suport."],
    tools:["Workflow run histories, issue registers, documentation and agreed monitoring tools.","Istoricul rulărilor, registre de incidente, documentație și instrumente de monitorizare convenite."],
    example:["A team reviews repeat failures after a source spreadsheet changes and assigns an owner to keep its schema current.","O echipă analizează erorile repetate după modificarea unui fișier sursă și desemnează un responsabil pentru actualizarea structurii."],
  },
};

export const areaLabels:Record<Area,Copy> = {
  standardization:["Process standardization","Standardizarea proceselor"],data:["Data architecture","Arhitectură de date"],
  automation:["Workflow automation","Automatizarea fluxurilor"],reporting:["Reporting improvements","Îmbunătățirea raportării"],
  integration:["Systems integration","Integrarea sistemelor"],governance:["Governance and documentation","Guvernanță și documentație"],
  ai:["AI readiness","Pregătire pentru AI"],
};
export const costLabels:Record<CostKey,Copy> = {
  consulting:["Consulting","Consultanță"],implementation:["Implementation","Implementare"],licenses:["Third-party licenses","Licențe terțe"],
  hosting:["Hosting","Găzduire"],maintenance:["Optional maintenance","Mentenanță opțională"],
};
export const signalLabels:Record<string,Copy> = {
  documentation:["Incomplete documentation","Documentație incompletă"],errors:["Recurring errors","Erori recurente"],accuracy:["Accuracy is a goal","Reducerea erorilor este un obiectiv"],
  duplicates:["Duplicate information","Informații duplicate"],availability:["Hard-to-access data","Date greu de găsit"],centralize:["Centralization is a goal","Centralizarea este un obiectiv"],
  entry:["Repeated manual entry","Introducere manuală repetată"],automate:["Automation is a goal","Automatizarea este un obiectiv"],frequency:["Runs at least weekly","Procesul se repetă cel puțin săptămânal"],
  reporting:["Reporting delays","Întârzieri în raportare"],"reporting-goal":["Better reporting is a goal","Raportarea este un obiectiv"],
  systems:["Disconnected systems","Sisteme deconectate"],"multiple-tools":["Several digital tools","Mai multe instrumente digitale"],
  ownership:["Unclear responsibilities","Responsabilități neclare"],"governance-goal":["Clearer ownership is a goal","Clarificarea responsabilităților este un obiectiv"],
  "ai-goal":["AI is an area to evaluate","AI este o opțiune de evaluat"],
};
export const engagementCopy = {
  discovery:{title:["Paid Process Audit","Audit de proces contra cost"],body:["A map of the current process, a list of priority issues and a discovery call to agree on next steps.","O hartă a procesului actual, o listă a problemelor prioritare și un apel pentru a stabili pașii următori."]},
  architecture:{title:["Process & Systems Architecture","Arhitectură de procese și sisteme"],body:["Future workflows, data structures, integration design, and governance.","Fluxuri viitoare, structuri de date, proiectarea integrărilor și guvernanță."]},
  implementation:{title:["Implementation & Ongoing Support","Implementare și suport continuu"],body:["Agreed changes, testing, rollout, documentation, and training. Support terms are agreed separately.","Schimbări convenite, testare, lansare, documentație și instruire. Condițiile de suport se stabilesc separat."]},
} as const satisfies Record<string,{title:Copy;body:Copy}>;
