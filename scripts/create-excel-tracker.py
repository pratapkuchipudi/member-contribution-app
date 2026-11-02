from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

OUT = r"c:\Users\Pratap Kumar\Desktop\member-contribution-app-starter\Member-Contribution-Tracker.xlsx"
ROWS = 150
TARGET = 4_000_000

BLUE = "1D4ED8"
GREEN = "15803D"
RED = "B91C1C"
NAVY = "0F172A"
SLATE = "334155"
HEADER = "0F172A"
CARD = "F8FAFC"
LINE = "CBD5E1"
WHITE = "FFFFFF"

thin = Border(
    left=Side(style="thin", color=LINE),
    right=Side(style="thin", color=LINE),
    top=Side(style="thin", color=LINE),
    bottom=Side(style="thin", color=LINE),
)
money = '₹#,##,##0.00'


def fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)


def font(bold=False, color=NAVY, size=11):
    return Font(name="Calibri", bold=bold, color=color, size=size)


def header_row(ws, row, titles, widths):
    for i, title in enumerate(titles, 1):
        cell = ws.cell(row, i, title)
        cell.fill = fill(HEADER)
        cell.font = font(True, WHITE, 11)
        cell.alignment = Alignment(horizontal="center", wrap_text=True, vertical="center")
        cell.border = thin
        ws.column_dimensions[get_column_letter(i)].width = widths[i - 1]
    ws.row_dimensions[row].height = 22
    ws.auto_filter.ref = f"A{row}:{get_column_letter(len(titles))}{ROWS + row}"
    ws.freeze_panes = f"A{row + 1}"


def style_range(ws, min_row, max_row, max_col, money_cols=(), center_cols=()):
    for r in range(min_row, max_row + 1):
        for c in range(1, max_col + 1):
            cell = ws.cell(r, c)
            cell.border = thin
            cell.alignment = Alignment(vertical="center")
            if c in money_cols:
                cell.number_format = money
            if c in center_cols:
                cell.alignment = Alignment(horizontal="center", vertical="center")


wb = Workbook()

# --- How to use ---
how = wb.active
how.title = "How to use"
how["A1"] = "58 National Convention 2027 — Member Contribution Tracker"
how["A1"].font = font(True, NAVY, 18)
how.merge_cells("A1:F1")
how["A2"] = "Vijayawada · Finance Committee · Excel version of the same rules as the web app"
how["A2"].font = font(False, SLATE, 12)
how.merge_cells("A2:F2")
steps = [
    "",
    "1. Open Dashboard first. Totals fill themselves. Do not type over the blue/green/red numbers.",
    "2. On Members, type one row per member. Give each person a Login ID in column A. Fill Date of Meet when you contact them. Payments attach to the Login ID.",
    "2b. Open Reports for an as-on-today list: how many members contacted, date of meet, proposed amount and given amount.",
    "3. On Member Payments, pick the Member Login ID from the dropdown. It must match Members column A. The name fills itself. Paid / Pending / Status on that member row then update.",
    "4. On Sponsors, pick Referred by Member from the dropdown of member names only.",
    "5. On Sponsor Payments, pick the sponsor name from the dropdown.",
    "6. If you delete a payment, remove the row or set Amount to 0 and write the reason in Notes.",
    "7. Admins / Login IDs is only a list to share IDs if someone forgets theirs.",
    "",
    "Colour key: blue = proposed / expected / target    green = paid / received    red = pending / still required",
    "Add rows inside the table (it is already prepared down to row 150).",
]
for i, line in enumerate(steps, 4):
    how[f"A{i}"] = line
    how[f"A{i}"].font = font(False, NAVY if line[:1].isdigit() else SLATE, 12)
    how.merge_cells(f"A{i}:F{i}")
how.column_dimensions["A"].width = 120
how.row_dimensions[1].height = 26

# --- Members ---
members = wb.create_sheet("Members")
header_row(
    members,
    1,
    ["Login ID", "Name", "Phone", "Proposed Amount", "Date of Meet", "Promised Date", "Notes", "Paid", "Pending", "Status", "Contacted as on today"],
    [14, 28, 16, 18, 16, 16, 28, 16, 16, 14, 22],
)
for r in range(2, ROWS + 2):
    members[f"H{r}"] = f'=IF(A{r}="","",SUMIF(\'Member Payments\'!A:A,A{r},\'Member Payments\'!D:D))'
    members[f"I{r}"] = f'=IF(A{r}="","",MAX(D{r}-H{r},0))'
    members[f"J{r}"] = f'=IF(A{r}="","",IF(H{r}<=0,"Not Paid",IF(H{r}<D{r},"Partial","Fully Paid")))'
    members[f"K{r}"] = f'=IF(OR(A{r}="",E{r}=""),"",IF(E{r}<=TODAY(),"Yes","No"))'
    members[f"D{r}"].number_format = money
    members[f"E{r}"].number_format = "YYYY-MM-DD"
    members[f"F{r}"].number_format = "YYYY-MM-DD"
    members[f"H{r}"].number_format = money
    members[f"I{r}"].number_format = money
    members[f"H{r}"].font = font(True, GREEN)
    members[f"I{r}"].font = font(True, RED)
    members[f"D{r}"].font = font(True, BLUE)
style_range(members, 2, ROWS + 1, 11, money_cols=(4, 8, 9), center_cols=(1, 5, 6, 10, 11))
members["B2"] = "Example Member"
members["C2"] = "9000000001"
members["D2"] = 50000
members["E2"] = "2026-09-15"
members["F2"] = "2026-10-01"
members["G2"] = "Sample row — replace or delete"
members["A2"] = "k3m9a"

# --- Member Payments ---
mp = wb.create_sheet("Member Payments")
header_row(mp, 1, ["Member Login ID", "Member Name", "Payment Date", "Amount", "Method", "Notes / Delete reason"], [18, 28, 16, 16, 16, 40])
member_id_dv = DataValidation(type="list", formula1=f"=Members!$A$2:$A${ROWS + 1}", allow_blank=True)
member_id_dv.error = "Pick a Login ID from the Members sheet"
member_id_dv.errorTitle = "Member Login ID"
member_id_dv.prompt = "Select the member Login ID"
member_id_dv.promptTitle = "Member"
member_id_dv.add(f"A2:A{ROWS + 1}")
mp.add_data_validation(member_id_dv)
for r in range(2, ROWS + 2):
    mp[f"B{r}"] = f'=IF(A{r}="","",IFERROR(VLOOKUP(A{r},Members!A:B,2,FALSE),""))'
    mp[f"C{r}"].number_format = "YYYY-MM-DD"
    mp[f"D{r}"].number_format = money
    mp[f"D{r}"].font = font(True, GREEN)
style_range(mp, 2, ROWS + 1, 6, money_cols=(4,), center_cols=(1, 3, 5))
mp["A2"] = "k3m9a"
mp["C2"] = "2026-09-01"
mp["D2"] = 10000
mp["E2"] = "UPI"
mp["F2"] = "First installment"

# --- Sponsors ---
sponsors = wb.create_sheet("Sponsors")
header_row(
    sponsors,
    1,
    ["Name", "Phone", "Address", "Referred by Member", "Expected Amount", "Meeting Date", "Status", "Notes", "Paid", "Pending", "Payment Status", "Contacted as on today"],
    [24, 16, 28, 22, 18, 16, 20, 28, 16, 16, 16, 22],
)
status_dv = DataValidation(
    type="list",
    formula1='"New,Contacted,Meeting Scheduled,Interested,Confirmed,Paid,Not Interested"',
    allow_blank=True,
)
status_dv.add(f"G2:G{ROWS + 1}")
sponsors.add_data_validation(status_dv)
member_name_dv = DataValidation(type="list", formula1=f"=Members!$B$2:$B${ROWS + 1}", allow_blank=True)
member_name_dv.error = "Pick a member name from the Members sheet"
member_name_dv.errorTitle = "Referred by"
member_name_dv.prompt = "Select a member name"
member_name_dv.promptTitle = "Member"
member_name_dv.add(f"D2:D{ROWS + 1}")
sponsors.add_data_validation(member_name_dv)
for r in range(2, ROWS + 2):
    sponsors[f"I{r}"] = f'=IF(A{r}="","",SUMIF(\'Sponsor Payments\'!A:A,A{r},\'Sponsor Payments\'!C:C))'
    sponsors[f"J{r}"] = f'=IF(A{r}="","",MAX(E{r}-I{r},0))'
    sponsors[f"K{r}"] = f'=IF(A{r}="","",IF(I{r}<=0,"Not Paid",IF(I{r}<E{r},"Partial","Fully Paid")))'
    sponsors[f"L{r}"] = f'=IF(OR(A{r}="",F{r}=""),"",IF(F{r}<=TODAY(),"Yes","No"))'
    sponsors[f"E{r}"].number_format = money
    sponsors[f"F{r}"].number_format = "YYYY-MM-DD"
    sponsors[f"I{r}"].number_format = money
    sponsors[f"J{r}"].number_format = money
    sponsors[f"E{r}"].font = font(True, BLUE)
    sponsors[f"I{r}"].font = font(True, GREEN)
    sponsors[f"J{r}"].font = font(True, RED)
style_range(sponsors, 2, ROWS + 1, 12, money_cols=(5, 9, 10), center_cols=(6, 7, 11, 12))
sponsors["A2"] = "Example Sponsor"
sponsors["B2"] = "9000000099"
sponsors["C2"] = "Vijayawada"
sponsors["D2"] = "Example Member"
sponsors["E2"] = 25000
sponsors["F2"] = "2026-09-30"
sponsors["G2"] = "New"

# --- Sponsor Payments ---
sp = wb.create_sheet("Sponsor Payments")
header_row(sp, 1, ["Sponsor Name", "Payment Date", "Amount", "Method", "Notes / Delete reason"], [28, 16, 16, 16, 40])
sponsor_name_dv = DataValidation(type="list", formula1=f"=Sponsors!$A$2:$A${ROWS + 1}", allow_blank=True)
sponsor_name_dv.add(f"A2:A{ROWS + 1}")
sp.add_data_validation(sponsor_name_dv)
for r in range(2, ROWS + 2):
    sp[f"B{r}"].number_format = "YYYY-MM-DD"
    sp[f"C{r}"].number_format = money
    sp[f"C{r}"].font = font(True, GREEN)
style_range(sp, 2, ROWS + 1, 5, money_cols=(3,), center_cols=(2, 4))

# --- Admins ---
admins = wb.create_sheet("Admins and Login IDs")
header_row(admins, 1, ["ID", "Name", "Role"], [16, 28, 14])
starter = [
    ("8191", "Ratnakumar", "admin"),
    ("45190", "Sudhakar", "admin"),
    ("5795", "Dr.Joe", "admin"),
    ("60783", "Pratap", "admin"),
    ("9414", "Dr.Paul", "admin"),
]
for i, (aid, name, role) in enumerate(starter, 2):
    admins[f"A{i}"] = aid
    admins[f"B{i}"] = name
    admins[f"C{i}"] = role
admins["A8"] = "Member login IDs live on the Members sheet (column A). If someone forgets theirs, read it from there."
admins.merge_cells("A8:C8")
admins["A8"].font = font(False, SLATE, 11)
style_range(admins, 2, 6, 3, center_cols=(1, 3))

# --- Dashboard ---
dash = wb.create_sheet("Dashboard", 1)
dash.sheet_view.showGridLines = False
dash["A1"] = "58_National_Convention_2027"
dash["A1"].font = font(True, "4338CA", 12)
dash["A2"] = "Vijayawada  ·  Finance Committee"
dash["A2"].font = font(True, NAVY, 22)
dash["A3"] = "First page — all totals come from the Members and Sponsors sheets. Enter data there, not here."
dash["A3"].font = font(False, SLATE, 11)
dash.merge_cells("A1:F1")
dash.merge_cells("A2:F2")
dash.merge_cells("A3:F3")
dash.row_dimensions[2].height = 28

# Named calc cells on the right (hidden-ish column H)
# H1 target, H2 member proposed, etc.
dash["H1"] = TARGET
dash["H2"] = f"=SUM(Members!D2:D{ROWS + 1})"
dash["H3"] = f"=SUM(Members!H2:H{ROWS + 1})"
dash["H4"] = f"=SUM(Members!I2:I{ROWS + 1})"
dash["H5"] = f"=SUM(Sponsors!E2:E{ROWS + 1})"
dash["H6"] = f"=SUM(Sponsors!I2:I{ROWS + 1})"
dash["H7"] = f"=SUM(Sponsors!J2:J{ROWS + 1})"
dash["H8"] = "=H2+H5"
dash["H9"] = "=H3+H6"
dash["H10"] = "=H4+H7"
dash["H11"] = f"=MAX({TARGET}-H8,0)"
dash["H12"] = f"=MAX({TARGET}-H9,0)"
dash["H13"] = f'=COUNTA(Members!B2:B{ROWS + 1})'
dash["H14"] = f'=COUNTA(Sponsors!A2:A{ROWS + 1})'
dash["H15"] = f'=COUNTIF(Members!J2:J{ROWS + 1},"Fully Paid")'
dash["H16"] = f'=COUNTIF(Members!J2:J{ROWS + 1},"Partial")'
dash["H17"] = f'=COUNTIF(Sponsors!K2:K{ROWS + 1},"Fully Paid")'
dash["H18"] = f'=COUNTIF(Sponsors!K2:K{ROWS + 1},"Partial")'
for r in range(1, 19):
    dash[f"H{r}"].number_format = money if r <= 12 else "0"

def card(ws, row, col, label, formula_or_ref, color, span=1):
    start = get_column_letter(col)
    end = get_column_letter(col + span - 1)
    label_cell = ws.cell(row, col, label)
    label_cell.font = font(True, SLATE, 10)
    label_cell.fill = fill(CARD)
    ws.merge_cells(start_row=row, start_column=col, end_row=row, end_column=col + span - 1)
    value_cell = ws.cell(row + 1, col, formula_or_ref)
    value_cell.font = font(True, color, 18)
    value_cell.fill = fill(CARD)
    if isinstance(formula_or_ref, str) and formula_or_ref.startswith("=") and "COUNT" not in formula_or_ref.upper() and "H13" not in formula_or_ref and "H14" not in formula_or_ref and "H15" not in formula_or_ref and "H16" not in formula_or_ref and "H17" not in formula_or_ref and "H18" not in formula_or_ref:
        value_cell.number_format = money
    ws.merge_cells(start_row=row + 1, start_column=col, end_row=row + 1, end_column=col + span - 1)
    for r in (row, row + 1):
        for c in range(col, col + span):
            ws.cell(r, c).border = thin
            ws.cell(r, c).alignment = Alignment(vertical="center", horizontal="left")
            ws.cell(r, c).fill = fill(CARD)
    ws.row_dimensions[row + 1].height = 28


dash["A5"] = "OVERALL"
dash["A5"].font = font(True, NAVY, 14)
card(dash, 6, 1, "TARGET FUND", "=H1", BLUE)
card(dash, 6, 3, "ALL PROPOSED (members and sponsors)", "=H8", BLUE)
card(dash, 6, 5, "REQUIRED STILL", "=H11", RED)
card(dash, 9, 1, "ALL RECEIVED", "=H9", GREEN)
card(dash, 9, 3, "ALL PENDING", "=H10", RED)
card(dash, 9, 5, "PENDING VS TARGET", "=H12", RED)
card(dash, 12, 1, "PEOPLE", '=H13&" members  ·  "&H14&" sponsors"', NAVY)
card(dash, 12, 3, "FULLY PAID (members + sponsors)", "=H15+H17", NAVY)

dash["A15"] = "MEMBERS"
dash["A15"].font = font(True, BLUE, 14)
card(dash, 16, 1, "MEMBERS", "=H13", NAVY)
card(dash, 16, 3, "PROPOSED", "=H2", BLUE)
card(dash, 16, 5, "RECEIVED", "=H3", GREEN)
card(dash, 19, 1, "PENDING", "=H4", RED)
card(dash, 19, 3, "FULLY PAID", "=H15", NAVY)
card(dash, 19, 5, "PARTIAL", "=H16", NAVY)

dash["A22"] = "SPONSORS"
dash["A22"].font = font(True, GREEN, 14)
card(dash, 23, 1, "SPONSORS", "=H14", NAVY)
card(dash, 23, 3, "EXPECTED", "=H5", BLUE)
card(dash, 23, 5, "RECEIVED", "=H6", GREEN)
card(dash, 26, 1, "PENDING", "=H7", RED)
card(dash, 26, 3, "FULLY PAID", "=H17", NAVY)
card(dash, 26, 5, "PARTIAL", "=H18", NAVY)

dash["A29"] = "Open Members / Sponsors / Payments sheets to enter data. This page only shows totals."
dash["A29"].font = font(False, SLATE, 11)
dash.merge_cells("A29:F29")

for col, width in zip("ABCDEF", [28, 16, 28, 16, 28, 18]):
    dash.column_dimensions[col].width = width
dash.column_dimensions["H"].hidden = True
dash.sheet_properties.tabColor = "1D4ED8"

# --- Reports ---
rep = wb.create_sheet("Reports", 2)
rep.sheet_view.showGridLines = False
rep["A1"] = "CONTACT REPORT"
rep["A1"].font = font(True, NAVY, 18)
rep.merge_cells("A1:G1")
rep["A2"] = 'As on'
rep["A2"].font = font(True, SLATE, 12)
rep["B2"] = "=TODAY()"
rep["B2"].number_format = "DD-MMM-YYYY"
rep["B2"].font = font(True, NAVY, 16)
rep["A3"] = "Members and sponsors with a Date of Meet on or before today. Proposed and given amounts come from the Members and Sponsors sheets."
rep["A3"].font = font(False, SLATE, 11)
rep.merge_cells("A3:G3")

rep["H2"] = f'=COUNTIF(Members!K2:K{ROWS + 1},"Yes")'
rep["H3"] = f'=SUMIF(Members!K2:K{ROWS + 1},"Yes",Members!D2:D{ROWS + 1})'
rep["H4"] = f'=SUMIF(Members!K2:K{ROWS + 1},"Yes",Members!H2:H{ROWS + 1})'
rep["H5"] = f'=SUMIF(Members!K2:K{ROWS + 1},"Yes",Members!I2:I{ROWS + 1})'
rep["H6"] = f'=COUNTIF(Sponsors!L2:L{ROWS + 1},"Yes")'
rep["H7"] = f'=SUMIF(Sponsors!L2:L{ROWS + 1},"Yes",Sponsors!E2:E{ROWS + 1})'
rep["H8"] = f'=SUMIF(Sponsors!L2:L{ROWS + 1},"Yes",Sponsors!I2:I{ROWS + 1})'
rep["H9"] = f'=SUMIF(Sponsors!L2:L{ROWS + 1},"Yes",Sponsors!J2:J{ROWS + 1})'
for cell in ("H3", "H4", "H5", "H7", "H8", "H9"):
    rep[cell].number_format = money
rep.column_dimensions["H"].hidden = True

rep["A4"] = "MEMBERS"
rep["A4"].font = font(True, BLUE, 14)
card(rep, 5, 1, "MEMBERS CONTACTED", "=H2", NAVY)
card(rep, 5, 3, "PROPOSED AMOUNT", "=H3", BLUE)
card(rep, 5, 5, "GIVEN AMOUNT", "=H4", GREEN)
card(rep, 8, 1, "PENDING", "=H5", RED)

rep["A11"] = "Contacted members (as on today)"
rep["A11"].font = font(True, NAVY, 13)
for i, title in enumerate(["Login ID", "Name", "Phone", "Date of Meet", "Proposed Amount", "Given Amount", "Pending", "Status"], 1):
    cell = rep.cell(12, i, title)
    cell.fill = fill(HEADER)
    cell.font = font(True, WHITE, 11)
    cell.alignment = Alignment(horizontal="center", wrap_text=True)
    cell.border = thin
rep.row_dimensions[12].height = 22

rep["A13"] = (
    f'=IFERROR(FILTER(CHOOSECOLS(Members!A2:J{ROWS + 1},1,2,3,5,4,8,9,10),'
    f'Members!K2:K{ROWS + 1}="Yes"),"No members contacted as on today")'
)

rep["A28"] = "SPONSORS"
rep["A28"].font = font(True, GREEN, 14)
card(rep, 29, 1, "SPONSORS CONTACTED", "=H6", NAVY)
card(rep, 29, 3, "PROPOSED AMOUNT", "=H7", BLUE)
card(rep, 29, 5, "GIVEN AMOUNT", "=H8", GREEN)
card(rep, 32, 1, "PENDING", "=H9", RED)

rep["A35"] = "Contacted sponsors (as on today)"
rep["A35"].font = font(True, NAVY, 13)
for i, title in enumerate(["Name", "Phone", "Referred by", "Date of Meet", "Proposed Amount", "Given Amount", "Pending", "Status"], 1):
    cell = rep.cell(36, i, title)
    cell.fill = fill(HEADER)
    cell.font = font(True, WHITE, 11)
    cell.alignment = Alignment(horizontal="center", wrap_text=True)
    cell.border = thin
rep.row_dimensions[36].height = 22
rep["A37"] = (
    f'=IFERROR(FILTER(CHOOSECOLS(Sponsors!A2:K{ROWS + 1},1,2,4,6,5,9,10,11),'
    f'Sponsors!L2:L{ROWS + 1}="Yes"),"No sponsors contacted as on today")'
)

for col, width in zip("ABCDEFG", [16, 28, 16, 16, 18, 16, 16]):
    rep.column_dimensions[col].width = width
rep.column_dimensions["H"].width = 14
rep["A52"] = "Fill Date of Meet on Members and Sponsors when you meet someone. This report then includes them if that date is today or earlier."
rep["A52"].font = font(False, SLATE, 11)
rep.merge_cells("A52:G52")
rep.sheet_properties.tabColor = "7C3AED"

for ws, color in (
    ("How to use", "64748B"),
    ("Members", "1D4ED8"),
    ("Member Payments", "1D4ED8"),
    ("Sponsors", "15803D"),
    ("Sponsor Payments", "15803D"),
    ("Admins and Login IDs", "0F172A"),
):
    wb[ws].sheet_properties.tabColor = color

try:
    wb.save(OUT)
except PermissionError:
    OUT = r"c:\Users\Pratap Kumar\Desktop\member-contribution-app-starter\Member-Contribution-Tracker-v2.xlsx"
    wb.save(OUT)
print(OUT)
