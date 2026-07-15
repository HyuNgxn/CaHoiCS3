# -*- coding: utf-8 -*-
"""Tạo file đăng ký BUỔI RẢNH — Cơ sở 3 (gọn, chỉ báo rảnh/bận)."""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

DOW  = ['T2','T3','T4','T5','T6','T7','CN']
PERS = ['Sáng','Chiều','Tối']
NDATA = 18
HR = 4            # dòng tiêu đề bảng
DR = HR + 1
LR = DR + NDATA - 1

BRAND='9A461C'; CREAM='FBF5EC'; TAN_A='F1E4D2'; TAN_B='FBF4E7'
GREEN='CDE9D5'; HEADTXT='3A2A1E'
thin = Side(style='thin', color='E3D6C4')
border = Border(left=thin,right=thin,top=thin,bottom=thin)

wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Đăng ký'

ws['A1'] = 'ĐĂNG KÝ BUỔI RẢNH — CƠ SỞ 3'
ws['A1'].font = Font(size=16, bold=True, color=BRAND)
ws['A2'] = ('Gõ chữ  x  vào buổi bạn RẢNH (đi làm được). Để trống = bận. '
            'Rảnh buổi nào tick buổi đó — càng nhiều càng dễ được xếp đủ ca. Chủ quán sẽ tự xếp lịch.')
ws['A2'].font = Font(size=10, italic=True, color='6B5B4C')

# ---- header row ----
ws.cell(HR,1,'Tên'); ws.cell(HR,2,'Vị trí')
for c in (1,2):
    cell=ws.cell(HR,c); cell.font=Font(bold=True,color=HEADTXT)
    cell.fill=PatternFill('solid',fgColor=CREAM); cell.border=border
    cell.alignment=Alignment(horizontal='center',vertical='center')

col=3; claim_cols=[]
for d,dow in enumerate(DOW):
    tint = TAN_A if d%2 else TAN_B
    for pl in PERS:
        cell=ws.cell(HR,col,f'{dow} {pl}')
        cell.font=Font(bold=True,size=10,color=HEADTXT)
        cell.fill=PatternFill('solid',fgColor=tint)
        cell.border=border
        cell.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True)
        claim_cols.append(col); col+=1
last_col=col-1
total_col=col
tc=ws.cell(HR,total_col,'Tổng rảnh')
tc.font=Font(bold=True,size=10,color=BRAND); tc.fill=PatternFill('solid',fgColor=CREAM)
tc.border=border; tc.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True)

# ---- data rows ----
for r in range(DR,LR+1):
    ws.cell(r,1).border=border
    ws.cell(r,2).border=border; ws.cell(r,2).alignment=Alignment(horizontal='center')
    for cc in claim_cols:
        cell=ws.cell(r,cc); cell.border=border; cell.alignment=Alignment(horizontal='center')
        d=(cc-3)//3
        cell.fill=PatternFill('solid',fgColor=(TAN_A if d%2 else TAN_B))
    # tổng rảnh
    fL=get_column_letter(claim_cols[0]); lL=get_column_letter(last_col)
    tcell=ws.cell(r,total_col,f'=COUNTIF({fL}{r}:{lL}{r},"x")')
    tcell.border=border; tcell.alignment=Alignment(horizontal='center')
    tcell.font=Font(bold=True,color=BRAND)

# ---- data validation ----
dv_role=DataValidation(type='list',formula1='"Pha chế,Phục vụ"',allow_blank=True)
ws.add_data_validation(dv_role); dv_role.add(f'B{DR}:B{LR}')
dv_x=DataValidation(type='list',formula1='"x"',allow_blank=True)
ws.add_data_validation(dv_x)
dv_x.add(f'{get_column_letter(3)}{DR}:{get_column_letter(last_col)}{LR}')

# ---- xanh khi tick x ----
green=PatternFill('solid',fgColor=GREEN)
for cc in claim_cols:
    L=get_column_letter(cc); rng=f'{L}{DR}:{L}{LR}'
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'LOWER({L}{DR})="x"'], fill=green))

# ---- kích thước / freeze ----
ws.column_dimensions['A'].width=15
ws.column_dimensions['B'].width=11
for cc in claim_cols:
    ws.column_dimensions[get_column_letter(cc)].width=8
ws.column_dimensions[get_column_letter(total_col)].width=8
ws.row_dimensions[HR].height=30
ws.freeze_panes='C5'

wb.save('DangKyCa-CoSo3.xlsx')
print('SAVED  cols:',total_col,' rows:',LR)
