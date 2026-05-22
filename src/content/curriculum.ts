import type { Module, Lab } from "@/lib/types";

export const modules: Module[] = [
  {
    id: "foundations",
    number: "01",
    track: "foundations",
    title: "Foundations & Authorization",
    summary:
      "Mental models, ATT&CK fluency, and the authorization discipline that gates every engagement. No tools yet — get the rules right first.",
    mode: "all",
    lessons: [
      {
        id: "authorization",
        title: "Authorization, Scope, and the Standing Rule",
        summary:
          "Why passive recon does not require authorization but anything touching a target does. Scope documents, engagement letters, ROEs.",
        minutes: 25,
        difficulty: "intro",
        docs: ["CLAUDE.md §8 Standing Rules"],
      },
      {
        id: "attack-framework",
        title: "ATT&CK as a Mental Model",
        summary:
          "Tactic → Technique → Procedure. How to read T-numbers, why ICS uses a separate T0xxx namespace, when to map and when not to.",
        minutes: 35,
        difficulty: "intro",
        docs: ["CLAUDE.md §5 MITRE ATT&CK Mapping Format"],
      },
      {
        id: "engagement-workflow",
        title: "Engagement Workflow & File Organization",
        summary:
          "Scaffold a workspace with engagement-init.sh, register with scan-db, follow the directory conventions that make handoffs and reports cheap.",
        minutes: 30,
        difficulty: "intro",
        scripts: ["engagement-init.sh", "scan-db.py"],
        hasLab: true,
        labId: "01-workspace",
      },
      {
        id: "modes",
        title: "Three Modes: Hunt / Defend / Restore",
        summary:
          "Where each mode starts and stops, who owns which decisions, why SOC hands off to IR at confirmed true positive.",
        minutes: 20,
        difficulty: "intro",
        docs: ["docs/soc-reference.md", "docs/ir-reference.md"],
      },
    ],
  },
  {
    id: "passive-recon",
    number: "02",
    track: "recon",
    title: "Passive Reconnaissance",
    summary:
      "OSINT, certificate transparency, passive DNS, breach data, infrastructure clustering. Zero target interaction.",
    prerequisites: ["foundations"],
    mode: "passive",
    lessons: [
      {
        id: "osint-aggregation",
        title: "OSINT Aggregation with osint-passive.sh",
        summary:
          "WHOIS, theHarvester, CT logs, ASN/BGP enrichment, favicon hashing for Shodan clustering, breach-data URL generation.",
        minutes: 45,
        difficulty: "core",
        scripts: ["osint-passive.sh"],
        attck: ["T1589", "T1590", "T1591", "T1596"],
        hasLab: true,
        labId: "02-osint",
      },
      {
        id: "subdomain-discovery",
        title: "Subdomain & DNS Discovery",
        summary:
          "Passive-only flow with subfinder + amass + CT logs. When to escalate to active zone transfers and reverse-DNS sweeps.",
        minutes: 40,
        difficulty: "core",
        scripts: ["subdomain-enum.sh"],
        attck: ["T1590.005"],
      },
      {
        id: "brand-protection",
        title: "Phishing Infrastructure & Brand Protection",
        summary:
          "Typosquats, CT-log lookalikes, Cloudflare-fronted evilginx fingerprinting, favicon hash hunting via Shodan.",
        minutes: 35,
        difficulty: "advanced",
        scripts: ["phish-infra-check.sh"],
        attck: ["T1583.001", "T1583.008"],
      },
    ],
  },
  {
    id: "active-recon",
    number: "03",
    track: "recon",
    title: "Active Scanning & Enumeration",
    summary:
      "nmap, service fingerprinting, SMB/SMTP/SNMP enumeration. Requires written authorization.",
    prerequisites: ["foundations", "passive-recon"],
    mode: "active",
    lessons: [
      {
        id: "nmap-workflow",
        title: "Nmap Workflow & pentest.sh Pipeline",
        summary:
          "Discovery, service detection, NSE scripts. Output parsing through scan-db. Known-bad version detection.",
        minutes: 60,
        difficulty: "core",
        scripts: ["pentest.sh", "scan-db.py"],
        attck: ["T1595.001", "T1595.002"],
        hasLab: true,
        labId: "03-scan-lab",
      },
      {
        id: "service-enumeration",
        title: "SMB / SMTP / SNMP Enumeration",
        summary:
          "When and how to enumerate each service. enum4linux, VRFY/EXPN, onesixtyone, snmpwalk MIB queries.",
        minutes: 45,
        difficulty: "core",
        scripts: ["pentest.sh"],
        docs: ["data/references/enumeration-checklist.md"],
      },
      {
        id: "cve-triage",
        title: "CVE Triage and Risk Scoring",
        summary:
          "From nmap output to a triaged findings list with weighted risk scores and OWASP auto-tags.",
        minutes: 45,
        difficulty: "core",
        scripts: ["cve-lookup.sh", "risk-scoring.py"],
      },
    ],
  },
  {
    id: "web-app",
    number: "04",
    track: "recon",
    title: "Web Application Testing",
    summary:
      "From content discovery through SQLi/SSRF/SSTI/XXE/IDOR/upload to JWT, OAuth, and WAF bypass.",
    prerequisites: ["active-recon"],
    mode: "active",
    lessons: [
      {
        id: "web-fuzzing",
        title: "Content Discovery & Fuzzing",
        summary:
          "gobuster, ffuf, nuclei. API discovery, GraphQL introspection, file-upload extension testing.",
        minutes: 60,
        difficulty: "core",
        scripts: ["web-fuzzer.sh", "webapp-scanner.sh"],
        attck: ["T1190", "T1083"],
        hasLab: true,
        labId: "04-dvwa-juice",
      },
      {
        id: "injection",
        title: "Injection Class Vulnerabilities",
        summary:
          "SQLi (boolean, time, union), XSS (reflected, stored, DOM), SSTI, command injection, SSRF cloud metadata.",
        minutes: 90,
        difficulty: "core",
        docs: ["data/references/webapp-attack-checklist.md"],
        attck: ["T1190"],
      },
      {
        id: "auth-attacks",
        title: "Auth Attacks — JWT, OAuth, Sessions",
        summary:
          "JWT alg:none, kid injection, HMAC brute force. OAuth redirect_uri bypass, state CSRF, PKCE bypass.",
        minutes: 60,
        difficulty: "advanced",
        docs: ["data/references/auth-attack-checklist.md"],
        attck: ["T1078", "T1539"],
      },
      {
        id: "waf-bypass",
        title: "WAF Detection & Bypass",
        summary:
          "Vendor fingerprinting (12 vendors), encoding bypass, header manipulation, origin IP discovery.",
        minutes: 45,
        difficulty: "advanced",
        docs: ["data/references/waf-bypass-reference.md"],
      },
    ],
  },
  {
    id: "metasploit",
    number: "05",
    track: "exploit",
    title: "Metasploit Fundamentals",
    summary:
      "msfconsole, msfvenom, the database, sessions, and the discipline that keeps you out of trouble. Four toolkit scripts wrap the framework so you can stay in the engagement workflow.",
    prerequisites: ["active-recon"],
    mode: "active",
    lessons: [
      {
        id: "msf-fundamentals",
        title: "Module Taxonomy, Sessions, and the Database",
        summary:
          "How exploit/auxiliary/post/payload/encoder fit together, staged vs stageless, bind vs reverse, and why every engagement gets its own workspace.",
        minutes: 60,
        difficulty: "core",
        docs: ["data/references/metasploit-reference.md"],
        attck: ["T1190", "T1059"],
      },
      {
        id: "msf-rc-workflow",
        title: "From Findings to RC Scripts",
        summary:
          "Turning a scored findings JSON into a Metasploit resource script. Safe-by-default check modules; explicit gates before exploits.",
        minutes: 45,
        difficulty: "core",
        scripts: ["msf-rc-gen.sh", "msf-session.sh"],
        hasLab: true,
        labId: "06-msf-lab",
      },
      {
        id: "msfvenom-payloads",
        title: "msfvenom Payload Generation",
        summary:
          "Picking the right payload, encoder choice and reality check, format mapping (exe/dll/elf/jar/raw/c), manifest + handler companion files.",
        minutes: 60,
        difficulty: "core",
        scripts: ["msfvenom-gen.sh"],
        attck: ["T1027", "T1059.001"],
      },
      {
        id: "msf-post-exploit",
        title: "Sessions, Pivoting, and Post-Exploit Recipes",
        summary:
          "Working a meterpreter session: privesc suggest, mimikatz, autoroute, portfwd, SOCKS proxy, token impersonation. Persistence under ROE only.",
        minutes: 75,
        difficulty: "advanced",
        scripts: ["msf-post.sh", "msf-session.sh"],
        attck: ["T1003.001", "T1055", "T1090", "T1572"],
      },
    ],
  },
  {
    id: "ad-attacks",
    number: "06",
    track: "exploit",
    title: "Active Directory Attack Paths",
    summary:
      "Kerberoasting, AS-REP roasting, Pass the Ticket. BloodHound attack graphs and the 19 pre-built queries.",
    prerequisites: ["active-recon"],
    mode: "active",
    lessons: [
      {
        id: "kerberos-attacks",
        title: "Kerberoasting & AS-REP Roasting",
        summary:
          "GetUserSPNs, GetNPUsers, hashcat modes. RC4 TGS volume detection on the defensive side.",
        minutes: 60,
        difficulty: "advanced",
        attck: ["T1558.003", "T1558.004"],
        hasLab: true,
        labId: "05-adlab",
      },
      {
        id: "bloodhound",
        title: "BloodHound Attack Paths",
        summary:
          "Linux-side collection with bloodhound.py, importing to Neo4j, the 19 pre-built attack-path queries.",
        minutes: 75,
        difficulty: "advanced",
        scripts: ["bloodhound-import.sh", "bloodhound-query.sh"],
      },
      {
        id: "lateral-movement",
        title: "Lateral Movement Hierarchy",
        summary: "WinRM > SMB > WMI > DCOM > RDP > PsExec — pick the quietest tool that works.",
        minutes: 45,
        difficulty: "advanced",
        docs: ["data/references/redteam-ops-reference.md"],
        attck: ["T1021.001", "T1021.002", "T1021.006"],
      },
    ],
  },
  {
    id: "cloud-k8s",
    number: "07",
    track: "exploit",
    title: "Cloud & Kubernetes Enumeration",
    summary:
      "Read-only enumeration of AWS, Azure/Entra, GCP, and Kubernetes. Container escape audit from inside a pod.",
    prerequisites: ["active-recon"],
    mode: "active",
    lessons: [
      {
        id: "aws-enum",
        title: "AWS Read-Only Enumeration",
        summary:
          "Identity, IAM with cloudfox privesc paths, S3, EC2/IMDS, Lambda, RDS, secrets manager. Optional prowler compliance.",
        minutes: 60,
        difficulty: "advanced",
        scripts: ["aws-enum.sh"],
      },
      {
        id: "azure-gcp-enum",
        title: "Azure / Entra & GCP Enumeration",
        summary:
          "Users + MFA status, directory roles, app registrations, RBAC. GCP IAM privesc paths, GCS, compute, secrets.",
        minutes: 60,
        difficulty: "advanced",
        scripts: ["azure-enum.sh", "gcp-enum.sh"],
      },
      {
        id: "k8s-recon",
        title: "Kubernetes Recon & Container Escape",
        summary:
          "Cluster info, RBAC, privileged pods, host mounts, NetworkPolicies. Caps / mounts / kernel CVE audit from inside a pod.",
        minutes: 60,
        difficulty: "advanced",
        scripts: ["k8s-enum.sh", "container-escape-check.sh"],
      },
    ],
  },
  {
    id: "ai-security",
    number: "08",
    track: "exploit",
    title: "AI / LLM Red-Teaming",
    summary:
      "Probing LLMs and AI-integrated apps for prompt injection, jailbreaks, data leakage, and unsafe output handling. garak as the scanning engine; OWASP LLM Top 10 + MITRE ATLAS as the map.",
    prerequisites: ["foundations", "web-app"],
    mode: "active",
    lessons: [
      {
        id: "llm-attack-surface",
        title: "The LLM Attack Surface",
        summary:
          "Model-behavioral vs application-integration risk. Trust boundaries: system prompt vs user prompt vs retrieved content. Authorization and provider ToS before any probe.",
        minutes: 40,
        difficulty: "core",
        docs: ["data/references/ai-security-checklist.md"],
      },
      {
        id: "garak-ai-redteam",
        title: "Scanning LLMs with garak + ai-redteam.sh",
        summary:
          "Running the garak vulnerability scanner through the toolkit wrapper: probe selection, the auth/ToS gate, normalizing report.jsonl into findings, and the report pipeline.",
        minutes: 55,
        difficulty: "core",
        scripts: ["ai-redteam.sh", "report-generator.py"],
        hasLab: true,
        labId: "09-ai-redteam",
      },
      {
        id: "owasp-llm-atlas",
        title: "OWASP LLM Top 10 & MITRE ATLAS",
        summary:
          "Mapping findings to LLM01–LLM10 and the ATLAS adversarial-ML matrix. Where garak covers the model-behavioral half and what stays manual: RAG poisoning, tool-calling abuse, supply chain.",
        minutes: 40,
        difficulty: "advanced",
        docs: ["data/references/ai-security-checklist.md"],
      },
    ],
  },
  {
    id: "soc-hunt",
    number: "09",
    track: "soc",
    title: "SOC Detection & Hunt Hypotheses",
    summary:
      "The 64-hypothesis catalog as a hunting methodology — H-001 through H-064 across endpoint, AD, web, AiTM, and ICS.",
    prerequisites: ["foundations"],
    mode: "defense",
    lessons: [
      {
        id: "hypothesis-framework",
        title: "The Hunt Hypothesis Framework",
        summary:
          "Building a falsifiable hypothesis. Telemetry-first thinking. Why 'hunt for evil' is not a hypothesis.",
        minutes: 40,
        difficulty: "core",
        docs: ["docs/soc-reference.md §2.3"],
      },
      {
        id: "sigma-rules",
        title: "Authoring Sigma Rules",
        summary:
          "26 IT + 6 ICS techniques covered by sigma-rule-builder.sh — UAC bypass, DLL hijack, Kerberoasting, AiTM token replay.",
        minutes: 60,
        difficulty: "core",
        scripts: ["sigma-rule-builder.sh"],
        attck: ["T1548.002", "T1574.001", "T1558.003"],
        hasLab: true,
        labId: "07-sigma-lab",
      },
      {
        id: "aitm-detection",
        title: "AiTM Phishing Detection",
        summary:
          "Session token replay, datacenter ASN sign-in, OAuth consent abuse, MFA self-enrollment. H-059 → H-064.",
        minutes: 50,
        difficulty: "advanced",
        docs: ["data/references/aitm-defense-checklist.md"],
        attck: ["T1539", "T1078.004", "T1556.006"],
      },
    ],
  },
  {
    id: "ir-core",
    number: "10",
    track: "ir",
    title: "Incident Response Core",
    summary:
      "Evidence-before-remediation discipline, containment without destroying volatile data, persistence audit, timeline reconstruction.",
    prerequisites: ["foundations"],
    mode: "defense",
    lessons: [
      {
        id: "forensics-collect",
        title: "Forensic Collection (PB-016)",
        summary:
          "Volatile-first order, chain-of-custody hashing, remote collection over SSH, Linux+Windows artifact inventory.",
        minutes: 60,
        difficulty: "core",
        scripts: ["forensics-collect.sh"],
        attck: ["T1070", "T1059"],
        hasLab: true,
        labId: "08-ir-lab",
      },
      {
        id: "persistence-audit",
        title: "Persistence Audit",
        summary:
          "Linux: cron, systemd, init.d, capabilities, world-writable PATH. Windows: scheduled tasks, registry Run keys, services, IFEO debugger, COM hijacking, ADS.",
        minutes: 60,
        difficulty: "core",
        scripts: ["persistence-audit.sh"],
      },
      {
        id: "containment",
        title: "Containment with Reversibility",
        summary:
          "Host isolation, C2 disruption, container containment (stop/pause/kill/disconnect). Generate-only by default — review before --execute.",
        minutes: 45,
        difficulty: "core",
        scripts: ["containment.sh"],
      },
      {
        id: "pcap-analysis",
        title: "PCAP Analysis & Late-Arriving IOCs",
        summary:
          "Zeek + tshark for C2/beacon/tunnel detection. Re-hunting stored PCAPs when new IOCs land.",
        minutes: 50,
        difficulty: "core",
        scripts: ["pcap-analysis.sh", "pcap-hunt.sh", "ioc-enrich.sh"],
      },
    ],
  },
  {
    id: "ot-ics",
    number: "11",
    track: "ot",
    title: "ICS / OT Safety & Response",
    summary:
      "Purdue model, three-stakeholder gate, OT-safe containment, ICS ATT&CK (T0xxx), passive-only protocol analysis.",
    prerequisites: ["foundations", "ir-core"],
    mode: "defense",
    lessons: [
      {
        id: "purdue-safety",
        title: "Purdue Model & Safety-First Priorities",
        summary:
          "Human safety > Process safety > Mission > Investigation. Why active scanning in OT can shut down a plant.",
        minutes: 40,
        difficulty: "core",
        docs: ["docs/ics-ir-reference.md"],
      },
      {
        id: "ot-protocols",
        title: "OT Protocol Analysis (Passive)",
        summary:
          "Modbus, DNP3, EtherNet/IP, OPC UA, S7comm, BACnet, IEC-104. Zeek ICS analyzers + tshark dissectors.",
        minutes: 60,
        difficulty: "advanced",
        scripts: ["ics-protocol-analysis.sh"],
        attck: ["T0855", "T0846"],
      },
      {
        id: "ot-containment",
        title: "OT Containment & Three-Stakeholder Gate",
        summary:
          "Zone isolation by firewall ACL, protocol blocking. Generate-only — execution requires IR Lead + NetO + process engineer.",
        minutes: 45,
        difficulty: "advanced",
        scripts: ["ics-containment.sh"],
      },
    ],
  },
  {
    id: "reporting",
    number: "12",
    track: "report",
    title: "Reporting, Coverage & Handoff",
    summary:
      "DOCX deliverable, AI-assisted summary, VECTR detection coverage sync, STIX 2.1 CTI export.",
    prerequisites: ["foundations"],
    mode: "report",
    lessons: [
      {
        id: "docx-reports",
        title: "Reports: DOCX & Interactive HTML",
        summary:
          "Findings JSON → DOCX or self-contained interactive HTML (--format docx|html|both) with --summarize. HTML can embed the network topology diagram inline.",
        minutes: 45,
        difficulty: "core",
        scripts: ["report-generator.py", "network-diagram.py"],
      },
      {
        id: "vectr-coverage",
        title: "VECTR Coverage & Purple Team",
        summary:
          "Push findings into VECTR, pull coverage scoring, fold detection gaps into the next report.",
        minutes: 40,
        difficulty: "core",
        scripts: ["vectr-sync.sh"],
      },
      {
        id: "cti-export",
        title: "STIX 2.1 CTI Export",
        summary:
          "Turning incident IOCs into a STIX bundle the broader community can ingest.",
        minutes: 30,
        difficulty: "core",
        scripts: ["cti-export.sh"],
      },
    ],
  },
];

export const labs: Lab[] = [
  {
    id: "01-workspace",
    title: "Workspace Scaffold",
    summary: "Stand up the SecOps toolkit container locally and scaffold an engagement workspace.",
    targets: ["secops-toolkit (container)"],
    requires: ["docker or podman"],
    isolation: "host-only",
    authorization: "self-hosted",
    composeFile: "labs/01-workspace/docker-compose.yml",
  },
  {
    id: "02-osint",
    title: "Passive OSINT Lab",
    summary: "Run osint-passive.sh against a fictitious target domain. Zero external interaction required.",
    targets: ["fictitious-domain.local"],
    requires: ["secops-toolkit container"],
    isolation: "host-only",
    authorization: "self-hosted",
    composeFile: "labs/02-osint/docker-compose.yml",
  },
  {
    id: "03-scan-lab",
    title: "Active Scan Lab",
    summary: "Vulnerable target network you control end-to-end. Practice nmap + service enum + CVE pipeline.",
    targets: ["metasploitable3-ub1404", "vuln-services-mini"],
    requires: ["docker compose", "8 GB RAM minimum"],
    isolation: "private-net",
    authorization: "self-hosted",
    composeFile: "labs/03-scan-lab/docker-compose.yml",
  },
  {
    id: "04-dvwa-juice",
    title: "Web App Lab — DVWA + Juice Shop",
    summary: "Two classic vulnerable web apps + a small custom API with JWT/IDOR/SSRF flaws.",
    targets: ["DVWA", "Juice Shop", "vuln-api"],
    requires: ["docker compose"],
    isolation: "private-net",
    authorization: "self-hosted",
    composeFile: "labs/04-dvwa-juice/docker-compose.yml",
  },
  {
    id: "05-adlab",
    title: "Active Directory Lab",
    summary:
      "GOAD-derived or vagrant-based Windows domain. Practice Kerberoasting / AS-REP / BloodHound paths. Heavyweight — read the lab README first.",
    targets: ["DC01 (Win Server)", "WS01 (Win 10)", "FS01 (file server)"],
    requires: ["vagrant or terraform", "32 GB RAM recommended"],
    isolation: "private-net",
    authorization: "self-hosted",
    hasVagrant: true,
  },
  {
    id: "06-msf-lab",
    title: "Metasploit Practice Lab",
    summary:
      "Metasploitable3 + a small Windows target you control. Run the full chain: scan → db_import → handler → payload → session → post-exploit recipes.",
    targets: ["metasploitable3-ub1404", "vuln-win-target", "kali-toolkit"],
    requires: ["docker compose", "8 GB RAM"],
    isolation: "private-net",
    authorization: "self-hosted",
    composeFile: "labs/06-msf-lab/docker-compose.yml",
  },
  {
    id: "07-sigma-lab",
    title: "Sigma Rule Authoring Lab",
    summary: "Pre-loaded ELK/OpenSearch with synthetic Windows + Linux logs covering the 26+6 templates.",
    targets: ["OpenSearch + Logstash + Kibana"],
    requires: ["docker compose", "6 GB RAM"],
    isolation: "host-only",
    authorization: "self-hosted",
    composeFile: "labs/07-sigma-lab/docker-compose.yml",
  },
  {
    id: "08-ir-lab",
    title: "IR Practice Lab",
    summary: "Pre-compromised Linux + Windows VMs with persistence and lateral movement artifacts to discover.",
    targets: ["compromised-ubuntu", "compromised-win10"],
    requires: ["docker compose + WSL2 or Hyper-V"],
    isolation: "private-net",
    authorization: "self-hosted",
    composeFile: "labs/08-ir-lab/docker-compose.yml",
  },
  {
    id: "09-ai-redteam",
    title: "AI / LLM Red-Team Lab",
    summary:
      "A local Ollama model behind a deliberately under-guarded chat app. Run ai-redteam.sh against a target you fully control — no provider ToS, no API cost.",
    targets: ["ollama (local LLM)", "vuln-chat (system-prompt-leaky app)"],
    requires: ["docker compose", "8 GB RAM (model dependent)"],
    isolation: "host-only",
    authorization: "self-hosted",
    composeFile: "labs/09-ai-redteam/docker-compose.yml",
  },
];

export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}
export function getLesson(moduleId: string, lessonId: string) {
  const mod = getModule(moduleId);
  if (!mod) return undefined;
  const lesson = mod.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return { module: mod, lesson };
}
export function getLab(id: string): Lab | undefined {
  return labs.find((l) => l.id === id);
}

export function trackTitle(t: Module["track"]): string {
  switch (t) {
    case "foundations": return "Foundations";
    case "recon": return "Reconnaissance";
    case "exploit": return "Exploitation";
    case "soc": return "SOC & Hunt";
    case "ir": return "Incident Response";
    case "ot": return "ICS / OT";
    case "report": return "Reporting";
  }
}
