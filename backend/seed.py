#!/usr/bin/env python3
"""Seed the Resonate database with demo data."""
import asyncio
from datetime import datetime, timedelta, timezone
import uuid
from app.database import engine, Base
from app.auth import hash_password
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
# Import all models
from app.models.user import User
from app.models.client import Client
from app.models.technician import Technician
from app.models.ticket import Ticket, TicketStatus
from app.models.threat import Threat
from app.models.invoice import Invoice
from app.models.contract import Contract

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

now = datetime.now(timezone.utc)


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # ------------------------------------------------------------------ #
        # Admin user
        # ------------------------------------------------------------------ #
        admin = User(
            id=uuid.uuid4(),
            email="demo@resonate.msp",
            hashed_password=hash_password("demo"),
            full_name="Demo Admin",
            is_active=True,
            is_superuser=True,
            created_at=now,
        )
        session.add(admin)

        # ------------------------------------------------------------------ #
        # Clients
        # ------------------------------------------------------------------ #
        clients_data = [
            {
                "name": "Acme Corp",
                "domain": "acme.com",
                "industry": "Manufacturing",
                "mrr": 12500.00,
                "seat_count": 85,
                "city": "San Francisco",
                "state": "CA",
                "contact_name": "Diane Torres",
                "contact_email": "dtorres@acme.com",
                "contact_phone": "415-555-0101",
                "status": "active",
            },
            {
                "name": "Pacific Dental Group",
                "domain": "pacificdental.com",
                "industry": "Healthcare",
                "mrr": 4800.00,
                "seat_count": 32,
                "city": "Oakland",
                "state": "CA",
                "contact_name": "Dr. Kevin Lam",
                "contact_email": "klam@pacificdental.com",
                "contact_phone": "510-555-0202",
                "status": "active",
            },
            {
                "name": "Marin County Law",
                "domain": "marinlaw.com",
                "industry": "Legal",
                "mrr": 6200.00,
                "seat_count": 41,
                "city": "San Rafael",
                "state": "CA",
                "contact_name": "Patricia Nguyen",
                "contact_email": "pnguyen@marinlaw.com",
                "contact_phone": "415-555-0303",
                "status": "active",
            },
            {
                "name": "Bay Area Realty",
                "domain": "bayarearealty.com",
                "industry": "Real Estate",
                "mrr": 2100.00,
                "seat_count": 14,
                "city": "San Jose",
                "state": "CA",
                "contact_name": "Marcus Webb",
                "contact_email": "mwebb@bayarearealty.com",
                "contact_phone": "408-555-0404",
                "status": "active",
            },
            {
                "name": "TechStart Inc",
                "domain": "techstart.io",
                "industry": "Technology",
                "mrr": 15000.00,
                "seat_count": 110,
                "city": "Palo Alto",
                "state": "CA",
                "contact_name": "Sophia Chen",
                "contact_email": "schen@techstart.io",
                "contact_phone": "650-555-0505",
                "status": "active",
            },
        ]

        clients = []
        for cd in clients_data:
            c = Client(
                id=uuid.uuid4(),
                created_at=now - timedelta(days=180),
                **cd,
            )
            session.add(c)
            clients.append(c)

        # ------------------------------------------------------------------ #
        # Technicians
        # ------------------------------------------------------------------ #
        techs_data = [
            {
                "full_name": "Jordan Rivera",
                "email": "jrivera@resonate.msp",
                "skills": ["networking", "firewall", "cisco", "windows-server"],
                "tier": 2,
                "is_active": True,
            },
            {
                "full_name": "Aisha Patel",
                "email": "apatel@resonate.msp",
                "skills": ["azure", "m365", "entra-id", "intune", "autopilot"],
                "tier": 3,
                "is_active": True,
            },
            {
                "full_name": "Chris Okafor",
                "email": "cokafor@resonate.msp",
                "skills": ["linux", "scripting", "backup", "vmware", "monitoring"],
                "tier": 2,
                "is_active": True,
            },
        ]

        technicians = []
        for td in techs_data:
            t = Technician(
                id=uuid.uuid4(),
                created_at=now - timedelta(days=90),
                **td,
            )
            session.add(t)
            technicians.append(t)

        # Flush so FKs resolve
        await session.flush()

        # ------------------------------------------------------------------ #
        # Tickets
        # ------------------------------------------------------------------ #
        tickets_data = [
            {
                "title": "Firewall failing over intermittently — production impact",
                "description": (
                    "ASA 5516-X at Acme HQ is randomly switching to failover unit. "
                    "Logs show LACP negotiation errors on trunk uplink. Client reports "
                    "5-minute outages twice today."
                ),
                "priority": "P1",
                "status": TicketStatus.in_progress,
                "client": clients[0],
                "assignee": technicians[0],
                "created_at": now - timedelta(hours=3),
                "updated_at": now - timedelta(hours=1),
            },
            {
                "title": "Ransomware alert — isolated endpoint, awaiting forensics",
                "description": (
                    "EDR quarantined workstation PDG-WS-07 at 08:42. Threat actor "
                    "attempted lateral movement via SMB. Endpoint isolated. Awaiting "
                    "IR runbook completion."
                ),
                "priority": "P1",
                "status": TicketStatus.open,
                "client": clients[1],
                "assignee": technicians[1],
                "created_at": now - timedelta(hours=5),
                "updated_at": now - timedelta(hours=2),
            },
            {
                "title": "MFA enrollment campaign — 12 users remaining",
                "description": (
                    "Marin County Law rollout of Entra ID MFA. 29/41 users enrolled. "
                    "12 users require assisted onboarding session."
                ),
                "priority": "P3",
                "status": TicketStatus.in_progress,
                "client": clients[2],
                "assignee": technicians[1],
                "created_at": now - timedelta(days=3),
                "updated_at": now - timedelta(hours=6),
            },
            {
                "title": "Printer offline — HP LaserJet on floor 2",
                "description": "HP LJ M507 showing offline in print queue. IP conflict suspected.",
                "priority": "P3",
                "status": TicketStatus.open,
                "client": clients[3],
                "assignee": technicians[2],
                "created_at": now - timedelta(hours=2),
                "updated_at": now - timedelta(hours=2),
            },
            {
                "title": "Azure AD Conditional Access — new policy deployment",
                "description": (
                    "TechStart requested block-legacy-auth CA policy. Tested in "
                    "report-only mode for 7 days — zero breakage. Ready to enforce."
                ),
                "priority": "P2",
                "status": TicketStatus.in_progress,
                "client": clients[4],
                "assignee": technicians[1],
                "created_at": now - timedelta(days=1),
                "updated_at": now - timedelta(hours=4),
            },
            {
                "title": "Veeam backup job failing — repo full",
                "description": (
                    "Nightly backup for Acme file server has failed 3 nights running. "
                    "Repo at 98% capacity. Need to archive or expand."
                ),
                "priority": "P2",
                "status": TicketStatus.open,
                "client": clients[0],
                "assignee": technicians[2],
                "created_at": now - timedelta(days=2),
                "updated_at": now - timedelta(days=1),
            },
            {
                "title": "SSL certificate renewed — pacificdental.com",
                "description": "Annual wildcard cert renewed via DigiCert. Deployed to IIS and F5.",
                "priority": "P2",
                "status": TicketStatus.resolved,
                "client": clients[1],
                "assignee": technicians[0],
                "created_at": now - timedelta(days=7),
                "updated_at": now - timedelta(days=6),
            },
            {
                "title": "New hire onboarding — 3 TechStart employees",
                "description": (
                    "Provision M365 accounts, Intune enroll devices, assign licences "
                    "and security groups for Q1 hires: A. Malik, T. Johansson, R. Obi."
                ),
                "priority": "P3",
                "status": TicketStatus.resolved,
                "client": clients[4],
                "assignee": technicians[1],
                "created_at": now - timedelta(days=5),
                "updated_at": now - timedelta(days=4),
            },
        ]

        for td in tickets_data:
            client = td.pop("client")
            assignee = td.pop("assignee")
            t = Ticket(
                id=uuid.uuid4(),
                client_id=client.id,
                assignee_id=assignee.id,
                **td,
            )
            session.add(t)

        # ------------------------------------------------------------------ #
        # Threats
        # ------------------------------------------------------------------ #
        threats_data = [
            {
                "title": "Brute-force SSH — 847 attempts from 185.220.101.x",
                "severity": "high",
                "category": "brute_force",
                "client": clients[4],
                "source_ip": "185.220.101.47",
                "destination": "10.0.0.22:22",
                "auto_remediated": True,
                "remediation_action": "Blocked /24 via firewall ACL. Fail2ban rule added.",
                "created_at": now - timedelta(hours=8),
            },
            {
                "title": "Phishing link clicked — credential harvest page",
                "severity": "critical",
                "category": "phishing",
                "client": clients[1],
                "source_ip": "203.0.113.55",
                "destination": "pdg-ws-07",
                "auto_remediated": False,
                "remediation_action": None,
                "created_at": now - timedelta(hours=5),
            },
            {
                "title": "Lateral movement via SMB — EternalBlue signature",
                "severity": "critical",
                "category": "lateral_movement",
                "client": clients[1],
                "source_ip": "192.168.10.47",
                "destination": "192.168.10.0/24",
                "auto_remediated": False,
                "remediation_action": None,
                "created_at": now - timedelta(hours=4, minutes=50),
            },
            {
                "title": "Outbound C2 beacon — domain generation algorithm",
                "severity": "high",
                "category": "c2",
                "client": clients[0],
                "source_ip": "10.10.5.88",
                "destination": "xn--wgbh1c.xn--p1ai:443",
                "auto_remediated": True,
                "remediation_action": "DNS sinkholed. Host quarantined pending review.",
                "created_at": now - timedelta(days=1, hours=3),
            },
            {
                "title": "Admin account login from unexpected country (RU)",
                "severity": "medium",
                "category": "anomalous_login",
                "client": clients[2],
                "source_ip": "91.108.4.33",
                "destination": "marinlaw.com — M365",
                "auto_remediated": True,
                "remediation_action": "Session revoked. Conditional Access geofence triggered.",
                "created_at": now - timedelta(days=2),
            },
            {
                "title": "Port scan — 65535 ports in 4 seconds",
                "severity": "low",
                "category": "reconnaissance",
                "client": clients[3],
                "source_ip": "198.51.100.12",
                "destination": "bayarearealty.com",
                "auto_remediated": True,
                "remediation_action": "Source blocked at perimeter. No services exposed.",
                "created_at": now - timedelta(days=3),
            },
            {
                "title": "Malware dropper detected — EICAR variant",
                "severity": "medium",
                "category": "malware",
                "client": clients[4],
                "source_ip": None,
                "destination": "techstart-ws-044",
                "auto_remediated": True,
                "remediation_action": "File quarantined by EDR. Hash added to blocklist.",
                "created_at": now - timedelta(days=4),
            },
            {
                "title": "Expired service account used — legacy LDAP bind",
                "severity": "low",
                "category": "policy_violation",
                "client": clients[0],
                "source_ip": "10.0.1.15",
                "destination": "acme-dc-01:389",
                "auto_remediated": False,
                "remediation_action": None,
                "created_at": now - timedelta(days=5),
            },
            {
                "title": "Mass email send from compromised mailbox",
                "severity": "high",
                "category": "account_compromise",
                "client": clients[2],
                "source_ip": None,
                "destination": "pnguyen@marinlaw.com — M365",
                "auto_remediated": True,
                "remediation_action": (
                    "Password reset forced. MFA re-enrolled. "
                    "Sent items purged. Mail flow rules reviewed."
                ),
                "created_at": now - timedelta(days=6),
            },
            {
                "title": "Unpatched RDP exposed to internet — CVE-2024-38077",
                "severity": "critical",
                "category": "vulnerability",
                "client": clients[3],
                "source_ip": None,
                "destination": "67.203.14.91:3389",
                "auto_remediated": False,
                "remediation_action": None,
                "created_at": now - timedelta(days=7),
            },
        ]

        for td in threats_data:
            client = td.pop("client")
            t = Threat(
                id=uuid.uuid4(),
                client_id=client.id,
                **td,
            )
            session.add(t)

        # ------------------------------------------------------------------ #
        # Invoices
        # ------------------------------------------------------------------ #
        invoices_data = [
            {
                "client": clients[0],
                "invoice_number": "INV-2026-0041",
                "amount": 12500.00,
                "status": "paid",
                "period_start": now.replace(day=1) - timedelta(days=28),
                "period_end": now.replace(day=1) - timedelta(days=1),
                "due_date": now - timedelta(days=15),
                "paid_at": now - timedelta(days=10),
                "created_at": now - timedelta(days=30),
            },
            {
                "client": clients[4],
                "invoice_number": "INV-2026-0042",
                "amount": 15000.00,
                "status": "paid",
                "period_start": now.replace(day=1) - timedelta(days=28),
                "period_end": now.replace(day=1) - timedelta(days=1),
                "due_date": now - timedelta(days=15),
                "paid_at": now - timedelta(days=12),
                "created_at": now - timedelta(days=30),
            },
            {
                "client": clients[1],
                "invoice_number": "INV-2026-0043",
                "amount": 4800.00,
                "status": "pending",
                "period_start": now.replace(day=1),
                "period_end": now,
                "due_date": now + timedelta(days=15),
                "paid_at": None,
                "created_at": now - timedelta(days=2),
            },
            {
                "client": clients[2],
                "invoice_number": "INV-2026-0044",
                "amount": 6200.00,
                "status": "pending",
                "period_start": now.replace(day=1),
                "period_end": now,
                "due_date": now + timedelta(days=15),
                "paid_at": None,
                "created_at": now - timedelta(days=2),
            },
            {
                "client": clients[3],
                "invoice_number": "INV-2026-0039",
                "amount": 2100.00,
                "status": "overdue",
                "period_start": now.replace(day=1) - timedelta(days=58),
                "period_end": now.replace(day=1) - timedelta(days=30),
                "due_date": now - timedelta(days=20),
                "paid_at": None,
                "created_at": now - timedelta(days=60),
            },
        ]

        for inv in invoices_data:
            client = inv.pop("client")
            i = Invoice(
                id=uuid.uuid4(),
                client_id=client.id,
                **inv,
            )
            session.add(i)

        # ------------------------------------------------------------------ #
        # Contracts
        # ------------------------------------------------------------------ #
        contracts_data = [
            {
                "client": clients[0],
                "contract_type": "MSA",
                "title": "Acme Corp — Managed Services Agreement",
                "start_date": now - timedelta(days=365),
                "end_date": now + timedelta(days=365),
                "auto_renew": True,
                "mrr": 12500.00,
                "status": "active",
                "signed_at": now - timedelta(days=365),
            },
            {
                "client": clients[1],
                "contract_type": "SLA",
                "title": "Pacific Dental Group — SLA (4h P1 response)",
                "start_date": now - timedelta(days=180),
                "end_date": now + timedelta(days=185),
                "auto_renew": True,
                "mrr": 4800.00,
                "status": "active",
                "signed_at": now - timedelta(days=180),
            },
            {
                "client": clients[2],
                "contract_type": "MSA",
                "title": "Marin County Law — Managed Services Agreement",
                "start_date": now - timedelta(days=270),
                "end_date": now + timedelta(days=95),
                "auto_renew": False,
                "mrr": 6200.00,
                "status": "active",
                "signed_at": now - timedelta(days=270),
            },
            {
                "client": clients[3],
                "contract_type": "MSA",
                "title": "Bay Area Realty — Managed Services Agreement",
                "start_date": now - timedelta(days=400),
                "end_date": now - timedelta(days=35),
                "auto_renew": False,
                "mrr": 2100.00,
                "status": "expired",
                "signed_at": now - timedelta(days=400),
            },
            {
                "client": clients[4],
                "contract_type": "SLA",
                "title": "TechStart Inc — SLA (2h P1, 99.9% uptime)",
                "start_date": now - timedelta(days=90),
                "end_date": now + timedelta(days=275),
                "auto_renew": True,
                "mrr": 15000.00,
                "status": "active",
                "signed_at": now - timedelta(days=90),
            },
        ]

        for cd in contracts_data:
            client = cd.pop("client")
            c = Contract(
                id=uuid.uuid4(),
                client_id=client.id,
                **cd,
            )
            session.add(c)

        await session.commit()
        print("Seed complete.")
        print(f"  Admin user:    demo@resonate.msp / demo")
        print(f"  Clients:       {len(clients_data)}")
        print(f"  Technicians:   {len(techs_data)}")
        print(f"  Tickets:       {len(tickets_data)}")
        print(f"  Threats:       {len(threats_data)}")
        print(f"  Invoices:      {len(invoices_data)}")
        print(f"  Contracts:     {len(contracts_data)}")


if __name__ == "__main__":
    asyncio.run(seed())
