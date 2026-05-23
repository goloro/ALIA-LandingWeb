import os

with open("HTML/prototipo.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

with open("month_grid.html", "r", encoding="utf-8") as f:
    month_lines = f.readlines()

for i, line in enumerate(lines):
    if '</div>' in line and '</div> <!-- Fin de page-agenda-semanal -->' in "".join(lines[i:i+10]):
        pass # just checking

# Actually, the agenda-grid closing div is at line 541 (0-indexed 540)
# We can find the exact match for '<div class="agenda-new-container">' and find its closing div.
# But it's easier to find:
insert_idx = -1
for i, line in enumerate(lines):
    if '<!-- Eventos Elena -->' in line:
        # Search forward for the end of agenda-grid
        for j in range(i, len(lines)):
            if '</div>' in lines[j] and '</div>' in lines[j+1] and '<!-- Modal Global: Nueva Cita (Limitado al portal-container) -->' in "".join(lines[j:j+20]):
                # the second </div> closes agenda-grid, the third closes agenda-new-container
                insert_idx = j
                break

if insert_idx == -1:
    print("Could not find insertion point!")
else:
    # insert before the div that closes agenda-new-container
    lines = lines[:insert_idx] + month_lines + lines[insert_idx:]
    with open("HTML/prototipo.html", "w", encoding="utf-8") as f:
        f.writelines(lines)
    print("Injected month grid!")
