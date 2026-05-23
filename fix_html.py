import re

with open("HTML/prototipo.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Find the month grid block
month_start = content.find('<!-- Month View Grid -->')
month_end_str = '                                    </div>'
# We know the broken line is:
broken_line = '                                    </div>                                                    <div class="agenda-event event-blue" style="top: 528px; height: 42px;">15:30 - Diego</div>'
month_end = content.find(broken_line)

if month_start != -1 and month_end != -1:
    # Extract the month grid text (excluding the broken line's second half)
    month_grid_html = content[month_start:month_end + len('                                    </div>')] + '\n'
    
    # Remove it from its current location
    # The new content without the month grid at the wrong place
    # We replace the month grid + the first half of the broken line with just the second half
    content = content[:month_start] + '                                                    <div class="agenda-event event-blue" style="top: 528px; height: 42px;">15:30 - Diego</div>' + content[month_end + len(broken_line):]
    
    # 2. Find the CORRECT insertion point.
    # The correct insertion point is right after:
    #                                     </div>
    #                                 </div>
    #                             </div>
    # 
    #                         </div>
    #                     </div>
    #                     
    #                     <!-- Modal Global: Nueva Cita (Limitado al portal-container) -->
    
    # Let's find the Modal Global line
    modal_idx = content.find('<!-- Modal Global: Nueva Cita')
    
    # We want to insert the month grid right after the end of the agenda-grid.
    # The agenda-grid ends with:
    #                                     </div>
    #                                 </div>
    #                             </div>
    
    # Let's find the end of agenda-grid by searching backwards from the Modal Global
    # It's better to just look for:
    #                                     </div>
    #                                 </div>
    #                             </div>
    
    target_pattern = """                                        </div>
                                    </div>
                                </div>
                            </div>"""
    
    # Search backwards from modal
    insert_pos = content.rfind('                                    </div>\n                                </div>\n                            </div>', 0, modal_idx)
    
    if insert_pos != -1:
        # We want to insert AFTER the closing div of agenda-grid which is the FIRST '</div>' in that pattern
        # The pattern is:
        #                                     </div> (closes agenda-grid)
        #                                 </div> (closes agenda-new-container)
        end_of_agenda_grid = insert_pos + len('                                    </div>')
        content = content[:end_of_agenda_grid] + '\n' + month_grid_html + content[end_of_agenda_grid:]
        
        with open("HTML/prototipo.html", "w", encoding="utf-8") as f:
            f.write(content)
        print("Fix successful!")
    else:
        print("Could not find insertion point!")
else:
    print("Could not find the broken block!")
