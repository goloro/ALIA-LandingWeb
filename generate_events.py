def gen_events(prof_name, lunch_start_idx, lunch_len):
    html = []
    html.append(f'                                            <!-- Eventos {prof_name} -->')
    html.append(f'                                            <div class="agenda-prof-col">')
    times = ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','13:00 PM','13:30 PM','14:00 PM','14:30 PM','15:00 PM','15:30 PM','16:00 PM','16:30 PM','17:00 PM','17:30 PM','18:00 PM','18:30 PM']
    for i in range(18):
        if i >= lunch_start_idx and i < lunch_start_idx + lunch_len:
            if i == lunch_start_idx:
                top = i * 48
                height = lunch_len * 48 - 6
                html.append(f'                                                <div class="agenda-event event-lunch" style="top: {top}px; height: {height}px;">PAUSA ALMUERZO</div>')
        else:
            top = i * 48
            height = 48 - 6
            html.append(f'                                                <div class="agenda-event event-blue" style="top: {top}px; height: {height}px;">{times[i].split(" ")[0]} - Jorge</div>')
    html.append(f'                                            </div>')
    return '\n'.join(html)

print(gen_events('Jesús', 10, 2))
print(gen_events('Marcos', 8, 3))
print(gen_events('Sofía', 7, 2))
print(gen_events('Elena', 9, 2))
