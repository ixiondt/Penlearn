"""
Seed OpenSearch with synthetic logs for the Sigma authoring lab.
Mixes benign baseline with labeled malicious events.
Idempotent — recreates the indices if they exist.
"""
from __future__ import annotations

import json
import random
import time
import uuid
from datetime import datetime, timedelta, timezone

import requests

OS_URL = "http://opensearch:9200"
NOW = datetime.now(tz=timezone.utc)
SESSION = requests.Session()

INDICES = [
    "penlearn-windows-4688",
    "penlearn-windows-4663",
    "penlearn-windows-7045",
    "penlearn-windows-4625",
    "penlearn-linux-audit",
    "penlearn-azure-signin",
]


def wait_for_opensearch(retries: int = 30) -> None:
    for _ in range(retries):
        try:
            r = SESSION.get(f"{OS_URL}/_cluster/health", timeout=5)
            if r.status_code == 200:
                return
        except requests.RequestException:
            pass
        time.sleep(2)
    raise SystemExit("OpenSearch did not become reachable")


def reset_indices() -> None:
    for idx in INDICES:
        SESSION.delete(f"{OS_URL}/{idx}", timeout=10)
        SESSION.put(f"{OS_URL}/{idx}", timeout=10)


def bulk_index(index: str, docs: list[dict]) -> None:
    body_lines: list[str] = []
    for d in docs:
        body_lines.append(json.dumps({"index": {"_index": index}}))
        body_lines.append(json.dumps(d))
    body = "\n".join(body_lines) + "\n"
    r = SESSION.post(
        f"{OS_URL}/_bulk", data=body,
        headers={"Content-Type": "application/x-ndjson"}, timeout=30,
    )
    if r.status_code >= 300:
        raise SystemExit(f"Bulk index failed: {r.status_code} {r.text[:400]}")


def ts(minus_seconds: float) -> str:
    return (NOW - timedelta(seconds=minus_seconds)).isoformat()


def gen_4688(n: int) -> list[dict]:
    docs: list[dict] = []
    benign_images = [
        r"C:\Windows\System32\svchost.exe",
        r"C:\Windows\System32\cmd.exe",
        r"C:\Windows\System32\powershell.exe",
        r"C:\Program Files\Common Files\Microsoft Shared\edge.exe",
    ]
    for i in range(n):
        is_malicious = False
        image = random.choice(benign_images)
        cmdline = image
        user = "NT AUTHORITY\\SYSTEM" if i % 5 == 0 else "CORP\\jane.doe"
        if random.random() < 0.004:
            image = r"C:\Windows\System32\powershell.exe"
            cmdline = (
                "powershell.exe -nop -w hidden -EncodedCommand "
                "JABjAGwAaQBlAG4AdAA9AE4AZQB3AC0AT..."
            )
            user = "CORP\\jane.doe"
            is_malicious = True
        docs.append({
            "@timestamp": ts(random.randint(0, 60 * 60 * 24)),
            "EventID": 4688,
            "Image": image,
            "CommandLine": cmdline,
            "User": user,
            "ParentImage": r"C:\Windows\explorer.exe",
            "Hostname": random.choice(["WS01", "WS02", "WS03"]),
            "_meta": {"malicious": is_malicious},
        })
    return docs


def gen_4663() -> list[dict]:
    docs: list[dict] = []
    for _ in range(180):
        docs.append({
            "@timestamp": ts(random.randint(0, 60 * 60 * 24)),
            "EventID": 4663,
            "ObjectType": "File",
            "AccessMask": "0x1",
            "ProcessName": r"C:\Program Files\MyApp\app.exe",
            "Hostname": "WS01",
            "_meta": {"malicious": False},
        })
    docs.append({
        "@timestamp": ts(3600),
        "EventID": 4663,
        "ObjectType": "Process",
        "ObjectName": r"\Device\HarddiskVolume\Windows\System32\lsass.exe",
        "AccessMask": "0x1410",
        "ProcessName": r"C:\Users\jane.doe\AppData\Local\Temp\dump.exe",
        "Hostname": "WS01",
        "_meta": {"malicious": True},
    })
    return docs


def gen_7045() -> list[dict]:
    docs: list[dict] = []
    for i in range(40):
        signed = i != 7
        docs.append({
            "@timestamp": ts(random.randint(0, 60 * 60 * 48)),
            "EventID": 7045,
            "ServiceName": f"Win32Update{i}" if not signed else f"OEMSvc{i}",
            "ImagePath": r"C:\Windows\System32\svchost.exe -k netsvcs" if signed
                         else r"C:\ProgramData\update\u.exe",
            "ServiceType": "user mode service",
            "StartType": "auto start",
            "_meta": {"malicious": not signed},
        })
    return docs


def gen_4625() -> list[dict]:
    docs: list[dict] = []
    # baseline
    for _ in range(60):
        docs.append({
            "@timestamp": ts(random.randint(0, 60 * 60 * 24)),
            "EventID": 4625,
            "TargetUserName": random.choice(["alice", "bob", "carol"]),
            "WorkstationName": "WS-EXT",
            "IpAddress": "10.0.0.42",
            "FailureReason": "Bad password",
            "_meta": {"malicious": False},
        })
    # password spray burst
    burst_users = [f"user{i}" for i in range(60)]
    burst_ts = NOW - timedelta(hours=2)
    for u in burst_users:
        docs.append({
            "@timestamp": (burst_ts + timedelta(seconds=random.randint(0, 60))).isoformat(),
            "EventID": 4625,
            "TargetUserName": u,
            "WorkstationName": "WS-EXT",
            "IpAddress": "185.55.32.10",
            "FailureReason": "Bad password",
            "_meta": {"malicious": True},
        })
    return docs


def gen_linux_audit() -> list[dict]:
    docs: list[dict] = []
    for _ in range(120):
        docs.append({
            "@timestamp": ts(random.randint(0, 60 * 60 * 24)),
            "type": "EXECVE",
            "exe": "/usr/bin/ls",
            "comm": "ls",
            "uid": 1000,
            "_meta": {"malicious": False},
        })
    docs.append({
        "@timestamp": ts(1800),
        "type": "EXECVE",
        "exe": "/usr/bin/history",
        "comm": "bash",
        "argv": ["history", "-c"],
        "uid": 1000,
        "_meta": {"malicious": True},
    })
    docs.append({
        "@timestamp": ts(1700),
        "type": "EXECVE",
        "exe": "/usr/bin/chmod",
        "comm": "chmod",
        "argv": ["chmod", "u+s", "/tmp/sh"],
        "uid": 1000,
        "_meta": {"malicious": True},
    })
    return docs


def gen_azure_signin() -> list[dict]:
    docs: list[dict] = []
    benign_asns = [3215, 7922, 12389]
    for _ in range(80):
        docs.append({
            "@timestamp": ts(random.randint(0, 60 * 60 * 24)),
            "userPrincipalName": "jane.doe@corp.com",
            "appDisplayName": "Microsoft Office 365 Portal",
            "ipAddress": f"10.0.{random.randint(0,255)}.{random.randint(0,255)}",
            "asn": random.choice(benign_asns),
            "country": "GB",
            "deviceDetail": {"isCompliant": True},
            "_meta": {"malicious": False},
        })
    chain_user = "jane.doe@corp.com"
    chain_id = str(uuid.uuid4())
    docs.append({
        "@timestamp": ts(60 * 60 * 2),
        "userPrincipalName": chain_user,
        "appDisplayName": "Microsoft Office 365 Portal",
        "ipAddress": "5.180.40.10",
        "asn": 24940,  # Hetzner — datacenter
        "country": "DE",
        "deviceDetail": {"isCompliant": False},
        "correlationId": chain_id,
        "_meta": {"malicious": True, "attck": "T1078.004"},
    })
    docs.append({
        "@timestamp": ts(60 * 60 * 2 - 60),
        "userPrincipalName": chain_user,
        "appDisplayName": "OAuth Consent",
        "scopes": ["Mail.Read", "Files.Read.All"],
        "verifiedPublisher": False,
        "ipAddress": "5.180.40.10",
        "correlationId": chain_id,
        "_meta": {"malicious": True, "attck": "T1539"},
    })
    docs.append({
        "@timestamp": ts(60 * 60 * 2 - 120),
        "userPrincipalName": chain_user,
        "activity": "New-InboxRule",
        "parameters": {"ForwardTo": "exfil@attacker.example"},
        "_meta": {"malicious": True, "attck": "T1556.006"},
    })
    return docs


def main() -> None:
    wait_for_opensearch()
    reset_indices()
    bulk_index("penlearn-windows-4688", gen_4688(3000))
    bulk_index("penlearn-windows-4663", gen_4663())
    bulk_index("penlearn-windows-7045", gen_7045())
    bulk_index("penlearn-windows-4625", gen_4625())
    bulk_index("penlearn-linux-audit", gen_linux_audit())
    bulk_index("penlearn-azure-signin", gen_azure_signin())
    print("Seed complete.")


if __name__ == "__main__":
    main()
