def gen_month_grid():
    days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"]
    html = []
    html.append('                                    <!-- Month View Grid -->')
    html.append('                                    <div class="agenda-month-grid" style="display: none;">')
    
    # Headers
    html.append('                                        <div class="month-grid-header">')
    for d in days:
        html.append(f'                                            <div class="month-header-cell">{d}</div>')
    html.append('                                        </div>')
    
    # Body
    html.append('                                        <div class="month-grid-body">')
    
    # 35 days for April 2026 starting from Monday. 
    # March 30, 31 are Monday, Tuesday. April 1 is Wednesday.
    # So: 30, 31 (prev month). 1..30 (current month). 1, 2, 3 (next month).
    # Total = 2 + 30 + 3 = 35 cells.
    
    current_month_days = list(range(1, 31))
    
    cells = [("30", "prev"), ("31", "prev")]
    for d in current_month_days:
        if d == 20:
            cells.append((str(d), "current"))
        else:
            cells.append((str(d).zfill(2), "normal"))
            
    cells.extend([("01", "next"), ("02", "next"), ("03", "next")])
    
    for day, ctype in cells:
        classes = "month-cell"
        if ctype in ("prev", "next"):
            classes += " other-month"
        elif ctype == "current":
            classes += " today-cell"
            
        html.append(f'                                            <div class="{classes}">')
        html.append(f'                                                <span class="month-day-num">{day}</span>')
        html.append('                                            </div>')
        
    html.append('                                        </div>')
    html.append('                                    </div>')
    
    with open("month_grid.html", "w", encoding="utf-8") as f:
        f.write("\n".join(html))

if __name__ == "__main__":
    gen_month_grid()
