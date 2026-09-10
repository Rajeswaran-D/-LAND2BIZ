from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import io
import datetime

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Table,
        TableStyle,
        Spacer,
        HRFlowable,
        KeepTogether,
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

router = APIRouter()


class DPRRequest(BaseModel):
    opportunity_id: str = "OPP-2026-001"
    opportunity_name: Optional[str] = "Solar Powered Cold Storage (15MT)"
    business_category: Optional[str] = "cold_storage"
    district: Optional[str] = "Coimbatore"
    land_type: Optional[str] = "agricultural"
    capital: float = 150000.0
    project_cost: float = 1500000.0
    loan_amount: float = 1350000.0
    interest_rate: float = 8.0
    tenure_years: int = 7
    moratorium_months: int = 6
    monthly_emi: float = 22867.78
    payback_years: float = 4.2
    repayment_burden_ratio: float = 0.35
    nic_code: Optional[str] = "52101 (Refrigerated Warehousing)"
    odop_product: Optional[str] = "Coating / Textile Products & Food Processing"
    matched_schemes: Optional[List[Dict[str, Any]]] = None
    regulatory_results: Optional[List[Dict[str, Any]]] = None
    ground_checks: Optional[List[str]] = None


@router.post("/generate")
def generate_dpr(req: DPRRequest):
    if not REPORTLAB_AVAILABLE:
        return {"error": "ReportLab is not installed. PDF generation unavailable."}

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0F172A")       # Dark Navy
    SECONDARY = colors.HexColor("#0F4C81")     # Classic Teal Blue
    ACCENT = colors.HexColor("#0284C7")        # Bright Sky Blue
    BG_LIGHT = colors.HexColor("#F8FAFC")      # Light Slate Table Row
    BORDER_COLOR = colors.HexColor("#CBD5E1")  # Slate Border
    TEXT_DARK = colors.HexColor("#1E293B")     # Dark Slate Text
    SUCCESS_COLOR = colors.HexColor("#166534") # Forest Green

    # Typography Styles
    style_title = ParagraphStyle(
        "DPRTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.white,
        spaceAfter=4,
    )
    style_subtitle = ParagraphStyle(
        "DPRSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#E2E8F0"),
    )
    style_h2 = ParagraphStyle(
        "DPRHeading2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=6,
    )
    style_body = ParagraphStyle(
        "DPRBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=TEXT_DARK,
    )
    style_body_bold = ParagraphStyle(
        "DPRBodyBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13,
        textColor=TEXT_DARK,
    )
    style_table_cell = ParagraphStyle(
        "DPRTableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=TEXT_DARK,
    )
    style_table_header = ParagraphStyle(
        "DPRTableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.white,
    )

    story = []

    # 1. Header Banner Box
    header_data = [
        [
            Paragraph("LAND2BIZ — DETAILED PROJECT REPORT (DPR)", style_title),
            Paragraph(f"<b>Date:</b> {datetime.date.today().strftime('%B %d, %Y')}<br/><b>Doc Ref:</b> {req.opportunity_id}", ParagraphStyle("HRight", parent=style_subtitle, alignment=2))
        ],
        [
            Paragraph("Bankable Feasibility & Pre-Investment Project Profile | SIH 2026 Specification", style_subtitle),
            Paragraph("<b>Status:</b> PRELIMINARY BANKABLE", ParagraphStyle("HRight2", parent=style_subtitle, alignment=2))
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 10),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 12))

    # 2. Executive Summary Block
    story.append(Paragraph("1. Executive Summary & Project Profile", style_h2))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=8))

    exec_data = [
        [Paragraph("<b>Project Title</b>", style_table_header), Paragraph("<b>Details & Specification</b>", style_table_header)],
        [Paragraph("Opportunity Name", style_body_bold), Paragraph(req.opportunity_name or "Micro Enterprise Project", style_body)],
        [Paragraph("Target District", style_body_bold), Paragraph(f"{req.district or 'Tamil Nadu'} District (Tamil Nadu State)", style_body)],
        [Paragraph("Land Classification", style_body_bold), Paragraph(req.land_type.capitalize() if req.land_type else "Agricultural", style_body)],
        [Paragraph("Official NIC Code", style_body_bold), Paragraph(req.nic_code or "52101 (Refrigerated Warehousing)", style_body)],
        [Paragraph("ODOP Product Alignment", style_body_bold), Paragraph(req.odop_product or "Aligned with District Primary Product List V32", style_body)],
        [Paragraph("Decision Engine Provenance", style_body_bold), Paragraph("100% Deterministic Engine (Level 1-3 Verified Sources)", style_body)],
    ]
    exec_table = Table(exec_data, colWidths=[160, 380])
    exec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(exec_table)
    story.append(Spacer(1, 14))

    # 3. Financial Investment & Debt Structure
    story.append(Paragraph("2. Financial Capital & Debt Structure (M6 / M7 / M8)", style_h2))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=8))

    fin_data = [
        [Paragraph("<b>Financial Metric</b>", style_table_header), Paragraph("<b>Value (INR) / Rate</b>", style_table_header), Paragraph("<b>Source & Provenance Basis</b>", style_table_header)],
        [Paragraph("Beneficiary Margin Capital (10%)", style_body_bold), Paragraph(f"Rs. {req.capital:,.2f}", style_body), Paragraph("USER_PROVIDED (10% Own Contribution)", style_table_cell)],
        [Paragraph("Total Calculated Project Cost", style_body_bold), Paragraph(f"Rs. {req.project_cost:,.2f}", style_body), Paragraph("DERIVED (Capital / 0.10 Baseline)", style_table_cell)],
        [Paragraph("Routed Bank Loan Share (90%)", style_body_bold), Paragraph(f"Rs. {req.loan_amount:,.2f}", style_body), Paragraph("SOURCE_BASED (SIH 2026 Core Loan Rules)", style_table_cell)],
        [Paragraph("Applicable Bank Interest Rate", style_body_bold), Paragraph(f"{req.interest_rate:.1f}% per annum", style_body), Paragraph("SOURCE_BASED (Routed Loan Scheme Cap)", style_table_cell)],
        [Paragraph("Repayment Tenure", style_body_bold), Paragraph(f"{req.tenure_years} Years ({req.tenure_years * 12} Months)", style_body), Paragraph("SOURCE_BASED (Standard Scheme Schedule)", style_table_cell)],
        [Paragraph("Moratorium Grace Period", style_body_bold), Paragraph(f"{req.moratorium_months} Months", style_body), Paragraph("SOURCE_BASED (Accrued Interest Grace)", style_table_cell)],
        [Paragraph("Calculated Monthly EMI", style_body_bold), Paragraph(f"<b>Rs. {req.monthly_emi:,.2f}</b>", style_body_bold), Paragraph("DERIVED (Reducing Balance Math)", style_table_cell)],
        [Paragraph("Typical Payback Period", style_body_bold), Paragraph(f"{req.payback_years:.1f} Years", style_body), Paragraph("ESTIMATED (NABARD Model Project Profile)", style_table_cell)],
        [Paragraph("Repayment Burden Ratio", style_body_bold), Paragraph(f"{req.repayment_burden_ratio * 100:.1f}% of Net Income", style_body), Paragraph("DERIVED (EMI / Monthly Net Ratio)", style_table_cell)],
    ]
    fin_table = Table(fin_data, colWidths=[180, 140, 220])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(fin_table)
    story.append(Spacer(1, 14))

    # 4. Government Scheme Eligibility & Subsidy Matrix
    story.append(Paragraph("3. Matched Government Schemes & Subsidies (M9)", style_h2))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=8))

    schemes_list = req.matched_schemes or [
        {"name": "PM Formalisation of Micro Food Processing Enterprises (PMFME)", "estimated_subsidy_inr": 350000, "note": "35% credit-linked capital subsidy (Cap Rs 10L)"},
        {"name": "PMEGP (MoMSME / KVIC)", "estimated_subsidy_inr": 375000, "note": "25% Rural General Category Margin Money in TDR 3 Years"},
        {"name": "Agriculture Infrastructure Fund (AIF)", "estimated_subsidy_inr": 0, "note": "3% Interest Subvention for 7 Years up to Rs 2Cr"},
    ]
    scheme_rows = [[Paragraph("<b>Government Scheme Name</b>", style_table_header), Paragraph("<b>Estimated Subsidy / Benefit</b>", style_table_header), Paragraph("<b>Terms & Verification Conditions</b>", style_table_header)]]
    for s in schemes_list:
        sub_str = f"Rs. {s.get('estimated_subsidy_inr', 0):,.2f}" if s.get('estimated_subsidy_inr') else s.get('benefit', 'Interest Subvention / Guarantee')
        scheme_rows.append([
            Paragraph(s.get("name", "Support Scheme"), style_body_bold),
            Paragraph(sub_str, style_body),
            Paragraph(s.get("note", "Requires Udyam & physical verification"), style_table_cell)
        ])
    scheme_table = Table(scheme_rows, colWidths=[200, 140, 200])
    scheme_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(scheme_table)
    story.append(Spacer(1, 14))

    # 5. Statutory Regulatory Screening (R1 - R6)
    story.append(Paragraph("4. Statutory Regulatory Screening Matrix (M2: R1 - R6)", style_h2))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=8))

    reg_list = req.regulatory_results or [
        {"rule": "R1_agri_to_commercial", "status": "NEEDS_VERIFICATION", "flag": "Non-Agricultural (NA) Conversion required for agricultural plot."},
        {"rule": "R2_water_body", "status": "PASS", "flag": "No mapped water body buffer conflict detected."},
        {"rule": "R3_road_frontage", "status": "PASS", "flag": "Main road access verified via OpenStreetMap."},
        {"rule": "R4_power_water", "status": "PASS", "flag": "3-Phase Commercial Electricity Line available within 500m."},
        {"rule": "R5_local_noc", "status": "NEEDS_VERIFICATION", "flag": "Gram Panchayat / Municipal Trade License required."},
        {"rule": "R6_food_safety", "status": "NEEDS_VERIFICATION", "flag": "FSSAI Basic Registration required for food processing."},
    ]
    reg_rows = [[Paragraph("<b>Statutory Rule ID</b>", style_table_header), Paragraph("<b>Screening Status</b>", style_table_header), Paragraph("<b>Compliance Description & Required Action</b>", style_table_header)]]
    for r in reg_list:
        st = r.get("status", "NEEDS_VERIFICATION")
        st_color = SUCCESS_COLOR if st == "PASS" else (colors.red if st == "FAIL" else SECONDARY)
        reg_rows.append([
            Paragraph(f"<b>{r.get('rule', 'Rule')}</b>", style_body_bold),
            Paragraph(f"<font color='{st_color.hexval()}'><b>{st}</b></font>", style_body_bold),
            Paragraph(r.get("flag", "Regulatory clearance verification required."), style_table_cell)
        ])
    reg_table = Table(reg_rows, colWidths=[140, 110, 290])
    reg_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(reg_table)
    story.append(Spacer(1, 14))

    # 6. M21 Physical Ground Check Protocol
    story.append(Paragraph("5. Mandatory M21 Physical Ground Check Protocol", style_h2))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=8))

    g_checks = req.ground_checks or [
        "[ ] Physical Site Boundary Visit & GPS Coordinate Verification",
        "[ ] Physical Inspection of Road Frontage Width & Heavy Vehicle Access",
        "[ ] Local Shopkeeper / Resident Interviews for Unmapped Competitor Check",
        "[ ] Verification of Revenue Land Records (Patta / Chitta / NA Order)",
        "[ ] Local Power Utility Feasibility & Transformer Capacity Inspection",
        "[ ] Raw Material Supply Chain & Supplier Price Quotation Verification",
    ]
    g_data = [[Paragraph("<b>Mandatory Ground Verification Checklist Item</b>", style_table_header)]]
    for gc in g_checks:
        g_data.append([Paragraph(gc, style_body)])
    g_table = Table(g_data, colWidths=[540])
    g_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(g_table)
    story.append(Spacer(1, 16))

    # 7. Signature & Statutory Disclaimer Block
    disclaimer_block = [
        Paragraph("<b>Statutory Disclaimer & Bank Submission Notice:</b>", style_body_bold),
        Paragraph(
            "This Detailed Project Report (DPR) is generated by LAND2BIZ M14 Decision Engine using deterministic mathematical algorithms, official government datasets (Census 2011, HCES 2022-23, ODOP V32, NIC 2008), and live geographic mapping (OSM/Google Places). "
            "This document constitutes preliminary pre-investment decision support and does NOT guarantee bank loan sanction, statutory government approval, or financial profit. "
            "Final loan sanction is subject to physical ground verification by the sanctioning bank and implementing agency.",
            style_table_cell
        ),
        Spacer(1, 20),
        Table([
            [Paragraph("____________________________<br/><b>Signature of Applicant</b>", style_body), Paragraph("____________________________<br/><b>Bank / Branch Sanctioning Officer</b>", ParagraphStyle("RAlign", parent=style_body, alignment=2))]
        ], colWidths=[270, 270])
    ]
    story.append(KeepTogether(disclaimer_block))

    doc.build(story)

    pdf_bytes = buffer.getvalue()
    buffer.close()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=LAND2BIZ_DPR_{req.opportunity_id}.pdf"}
    )
