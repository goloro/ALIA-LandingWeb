import os

html_path = r'C:\Users\golor\Desktop\Goloro_Workspace\ALIA-LandingWeb\HTML\prototipo.html'
css_path = r'C:\Users\golor\Desktop\Goloro_Workspace\ALIA-LandingWeb\CSS\Prototipo\prototipo.css'

with open(html_path, 'r', encoding='utf-8') as f:
    html_lines = f.readlines()

with open(css_path, 'r', encoding='utf-8') as f:
    css_lines = f.readlines()

# Clean HTML
new_html = []
for i, line in enumerate(html_lines):
    if i < 93: # 0 to 92 (lines 1 to 93)
        new_html.append(line)
    elif i == 93:
        new_html.append(line) # line 94: <div class="portal-content">
        new_html.append('                        </div>\n')
        new_html.append('                    </div>\n')
        new_html.append('                </div>\n')
    elif i >= 1196: # From line 1197 onwards
        new_html.append(line)

with open(html_path, 'w', encoding='utf-8') as f:
    f.writelines(new_html)

# Clean CSS
new_css = []
for i, line in enumerate(css_lines):
    if "/* Dashboard Layout */" in line:
        break
    new_css.append(line)

with open(css_path, 'w', encoding='utf-8') as f:
    f.writelines(new_css)

print("Restored original structures successfully.")
