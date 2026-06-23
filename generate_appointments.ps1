
# ============================================================
# Genera appointments.json con alta ocupación para junio completo
# + 2 semanas futuras dinámicas (dayOffset)
# Respeta: Domingo=cerrado, Laura libre martes, Javier libre miércoles,
# Alejandro libre lunes (propietario).
# ============================================================

$laura  = @{ name="Laura Gómez";    dayOff=2; lunch="13:30"; lunchEnd="14:30" }
$javier = @{ name="Javier Ruiz";    dayOff=3; lunch="14:30"; lunchEnd="15:30" }
$alej   = @{ name="Alejandro Mora"; dayOff=1; lunch="14:00"; lunchEnd="15:00" }

# Clientes asignados a cada profesional (rotan cíclicamente)
$clientsLaura  = @(
    @{id=1;  name="Marta García"},
    @{id=3;  name="Ana Martínez"},
    @{id=4;  name="Lucía Fernández"},
    @{id=6;  name="Isabel Romero"},
    @{id=8;  name="Elena Vidal"},
    @{id=10; name="Carla Vega"},
    @{id=12; name="Sofía Iglesias"},
    @{id=901;name="Marta Sánchez"}
)
$clientsJavier = @(
    @{id=2;  name="Carlos López"},
    @{id=5;  name="Miguel Sanz"},
    @{id=7;  name="Roberto Fuentes"},
    @{id=9;  name="David Reyes"},
    @{id=11; name="Pablo Mora"},
    @{id=902;name="Ricardo Mendoza"}
)
$clientsAlej = @(
    @{id=3;  name="Ana Martínez"},
    @{id=4;  name="Lucía Fernández"},
    @{id=7;  name="Roberto Fuentes"},
    @{id=10; name="Carla Vega"},
    @{id=11; name="Pablo Mora"},
    @{id=1;  name="Marta García"}
)

# Template de servicios por profesional (alta ocupacion ~85%)
# Laura: 7 citas/dia = ~420 min
$slotsLaura = @(
    @{time="10:00";dur=120;svc="Tinte y Mechas";         icon="gota"},
    @{time="12:00";dur=45; svc="Corte y Peinado";        icon="tijeras"},
    @{time="13:00";dur=45; svc="Peinado y Recogido";     icon="tijeras"},
    @{time="14:30";dur=90; svc="Coloracion";             icon="gota"},
    @{time="16:00";dur=60; svc="Manicura Semipermanente";icon="gota"},
    @{time="17:30";dur=60; svc="Tratamiento Capilar";    icon="gota"},
    @{time="19:00";dur=45; svc="Lavado y Marcado";       icon="tijeras"}
)
$slotsLauraB = @(   # Alternativa semanal
    @{time="10:00";dur=150;svc="Balayage";               icon="gota"},
    @{time="12:30";dur=45; svc="Corte y Peinado";        icon="tijeras"},
    @{time="13:30";dur=45; svc="Lavado y Marcado";       icon="tijeras"},
    @{time="14:30";dur=90; svc="Tratamiento Facial";     icon="gota"},
    @{time="16:30";dur=60; svc="Manicura Semipermanente";icon="gota"},
    @{time="18:00";dur=60; svc="Tratamiento Capilar";    icon="gota"},
    @{time="19:15";dur=45; svc="Peinado y Recogido";     icon="tijeras"}
)
# Javier: 10 citas/dia = ~295 min
$slotsJavier = @(
    @{time="10:00";dur=45; svc="Corte + Barba";          icon="cuchilla"},
    @{time="11:00";dur=20; svc="Arreglo Barba";          icon="cuchilla"},
    @{time="11:30";dur=20; svc="Corte Express";          icon="tijeras"},
    @{time="12:00";dur=30; svc="Corte Clasico";          icon="tijeras"},
    @{time="13:00";dur=45; svc="Corte + Barba";          icon="cuchilla"},
    @{time="14:00";dur=20; svc="Arreglo Barba";          icon="cuchilla"},
    @{time="15:30";dur=45; svc="Corte + Barba";          icon="cuchilla"},
    @{time="17:00";dur=20; svc="Arreglo Barba";          icon="cuchilla"},
    @{time="18:00";dur=30; svc="Corte Clasico";          icon="tijeras"},
    @{time="19:00";dur=20; svc="Corte Express";          icon="tijeras"}
)
# Alejandro: 8 citas/dia = ~280 min
$slotsAlej = @(
    @{time="10:00";dur=45; svc="Corte y Peinado";        icon="tijeras"},
    @{time="11:00";dur=20; svc="Corte Express";          icon="tijeras"},
    @{time="11:30";dur=30; svc="Corte Clasico";          icon="tijeras"},
    @{time="12:30";dur=45; svc="Lavado y Marcado";       icon="tijeras"},
    @{time="13:30";dur=20; svc="Corte Express";          icon="tijeras"},
    @{time="15:00";dur=45; svc="Corte y Peinado";        icon="tijeras"},
    @{time="17:00";dur=30; svc="Corte Clasico";          icon="tijeras"},
    @{time="18:30";dur=45; svc="Lavado y Marcado";       icon="tijeras"}
)

$allAppts   = [System.Collections.Generic.List[object]]::new()
$idCounter  = 500
$lcIdx = 0; $jcIdx = 0; $acIdx = 0   # índices de clientes

function Add-Appointments {
    param($date, $prof, $slots, [ref]$clientList, [ref]$clientIdx, $source, $status)
    $dateStr    = $date.ToString("yyyy-MM-dd")
    $created    = $date.AddDays(-[math]::Round((Get-Random -Min 2 -Max 8))).ToString("yyyy-MM-dd")
    foreach ($slot in $slots) {
        $client = $clientList.Value[$clientIdx.Value % $clientList.Value.Count]
        $clientIdx.Value++
        $script:idCounter++
        [void]$script:allAppts.Add([PSCustomObject]@{
            id          = $script:idCounter
            clientId    = $client.id
            clientName  = $client.name
            rawDate     = $dateStr
            formattedDate = $date.ToString("dd/MM")
            time        = $slot.time
            duration    = $slot.dur
            service     = $slot.svc
            icon        = $slot.icon
            prof        = $prof.name
            status      = $status
            createdAt   = $created
            source      = $source
        })
    }
}

# ---- HISTÓRICO: junio 1-21 (citas completadas, rawDate fijo) ----
$start  = [DateTime]"2026-06-01"
$cutoff = [DateTime]"2026-06-22"   # día 22 = dayOffset 0 (dinámico)

$datePtr = $start
while ($datePtr -lt $cutoff) {
    $dow = [int]$datePtr.DayOfWeek   # 0=Dom,1=Lun,2=Mar,...,6=Sab
    if ($dow -ne 0) {   # No domingo
        $useAlt = ($datePtr.Day % 3 -eq 0)   # Alternar plantilla A/B para variedad
        # Laura trabaja todos menos Martes (dow=2)
        if ($dow -ne 2) {
            $template = if ($useAlt) { $slotsLauraB } else { $slotsLaura }
            Add-Appointments $datePtr $laura $template ([ref]$clientsLaura) ([ref]$lcIdx) "Alia" "completed"
        }
        # Javier trabaja todos menos Miércoles (dow=3)
        if ($dow -ne 3) {
            Add-Appointments $datePtr $javier $slotsJavier ([ref]$clientsJavier) ([ref]$jcIdx) "Manual" "completed"
        }
        # Alejandro trabaja todos menos Lunes (dow=1)
        if ($dow -ne 1) {
            Add-Appointments $datePtr $alej $slotsAlej ([ref]$clientsAlej) ([ref]$acIdx) "Alia" "completed"
        }
    }
    $datePtr = $datePtr.AddDays(1)
}

# ---- DINÁMICO: citas actuales + futuras con dayOffset ----
$dynamic = @(
  @{id=101;clientId=4; clientName="Lucía Fernández"; dayOffset=0; time="10:00";duration=150;service="Balayage";               icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-19";source="Alia"   },
  @{id=102;clientId=1; clientName="Marta García";    dayOffset=0; time="12:30";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-19";source="Alia"   },
  @{id=103;clientId=6; clientName="Isabel Romero";   dayOffset=0; time="14:30";duration=90; service="Coloración";             icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-18";source="Alia"   },
  @{id=104;clientId=3; clientName="Ana Martínez";    dayOffset=0; time="16:00";duration=60; service="Manicura Semipermanente";icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=105;clientId=8; clientName="Elena Vidal";     dayOffset=0; time="17:30";duration=60; service="Tratamiento Capilar";   icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=106;clientId=10;clientName="Carla Vega";      dayOffset=0; time="19:00";duration=45; service="Lavado y Marcado";      icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=107;clientId=2; clientName="Carlos López";    dayOffset=0; time="10:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-19";source="Alia"   },
  @{id=108;clientId=5; clientName="Miguel Sanz";     dayOffset=0; time="11:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-20";source="Manual" },
  @{id=109;clientId=9; clientName="David Reyes";     dayOffset=0; time="11:30";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-20";source="Manual" },
  @{id=110;clientId=7; clientName="Roberto Fuentes"; dayOffset=0; time="12:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=111;clientId=11;clientName="Pablo Mora";      dayOffset=0; time="13:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=112;clientId=902;clientName="Ricardo Mendoza";dayOffset=0; time="14:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=113;clientId=2; clientName="Carlos López";    dayOffset=0; time="15:30";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=114;clientId=5; clientName="Miguel Sanz";     dayOffset=0; time="17:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=115;clientId=9; clientName="David Reyes";     dayOffset=0; time="18:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=116;clientId=7; clientName="Roberto Fuentes"; dayOffset=0; time="19:00";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },

  @{id=121;clientId=2; clientName="Carlos López";    dayOffset=1; time="10:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=122;clientId=5; clientName="Miguel Sanz";     dayOffset=1; time="11:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-19";source="Manual" },
  @{id=123;clientId=9; clientName="David Reyes";     dayOffset=1; time="11:30";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-20";source="Manual" },
  @{id=124;clientId=7; clientName="Roberto Fuentes"; dayOffset=1; time="12:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=125;clientId=11;clientName="Pablo Mora";      dayOffset=1; time="13:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=126;clientId=902;clientName="Ricardo Mendoza";dayOffset=1; time="14:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=127;clientId=2; clientName="Carlos López";    dayOffset=1; time="15:30";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=128;clientId=5; clientName="Miguel Sanz";     dayOffset=1; time="17:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=129;clientId=9; clientName="David Reyes";     dayOffset=1; time="19:00";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },

  @{id=130;clientId=3; clientName="Ana Martínez";    dayOffset=1; time="10:00";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-18";source="Alia"   },
  @{id=131;clientId=1; clientName="Marta García";    dayOffset=1; time="11:30";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-19";source="Alia"   },
  @{id=132;clientId=4; clientName="Lucía Fernández"; dayOffset=1; time="12:30";duration=45; service="Lavado y Marcado";       icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=133;clientId=10;clientName="Carla Vega";      dayOffset=1; time="15:00";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=134;clientId=7; clientName="Roberto Fuentes"; dayOffset=1; time="17:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=135;clientId=11;clientName="Pablo Mora";      dayOffset=1; time="18:30";duration=45; service="Lavado y Marcado";       icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=141;clientId=1; clientName="Marta García";    dayOffset=2; time="10:00";duration=120;service="Tinte y Mechas";         icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-17";source="Alia"   },
  @{id=142;clientId=6; clientName="Isabel Romero";   dayOffset=2; time="12:00";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=143;clientId=12;clientName="Sofía Iglesias";  dayOffset=2; time="14:30";duration=90; service="Tratamiento Facial";     icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=144;clientId=3; clientName="Ana Martínez";    dayOffset=2; time="16:00";duration=60; service="Manicura Semipermanente";icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=145;clientId=8; clientName="Elena Vidal";     dayOffset=2; time="17:30";duration=60; service="Tratamiento Capilar";   icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=146;clientId=4; clientName="Lucía Fernández"; dayOffset=2; time="19:00";duration=45; service="Lavado y Marcado";      icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=147;clientId=7; clientName="Roberto Fuentes"; dayOffset=2; time="10:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=148;clientId=11;clientName="Pablo Mora";      dayOffset=2; time="11:30";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=149;clientId=3; clientName="Ana Martínez";    dayOffset=2; time="12:30";duration=45; service="Lavado y Marcado";       icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=150;clientId=10;clientName="Carla Vega";      dayOffset=2; time="15:00";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=152;clientId=4; clientName="Lucía Fernández"; dayOffset=2; time="17:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=153;clientId=1; clientName="Marta García";    dayOffset=2; time="18:30";duration=45; service="Lavado y Marcado";       icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=161;clientId=4; clientName="Lucía Fernández"; dayOffset=3; time="10:00";duration=150;service="Balayage";               icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=162;clientId=3; clientName="Ana Martínez";    dayOffset=3; time="12:30";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=163;clientId=8; clientName="Elena Vidal";     dayOffset=3; time="14:30";duration=90; service="Tratamiento Facial";     icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=164;clientId=12;clientName="Sofía Iglesias";  dayOffset=3; time="16:00";duration=60; service="Manicura Semipermanente";icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=165;clientId=6; clientName="Isabel Romero";   dayOffset=3; time="17:30";duration=60; service="Tratamiento Capilar";   icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=166;clientId=901;clientName="Marta Sánchez";  dayOffset=3; time="19:00";duration=45; service="Lavado y Marcado";      icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=167;clientId=2; clientName="Carlos López";    dayOffset=3; time="10:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-19";source="Alia"   },
  @{id=168;clientId=5; clientName="Miguel Sanz";     dayOffset=3; time="11:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-20";source="Manual" },
  @{id=169;clientId=9; clientName="David Reyes";     dayOffset=3; time="11:30";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=170;clientId=7; clientName="Roberto Fuentes"; dayOffset=3; time="12:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=171;clientId=11;clientName="Pablo Mora";      dayOffset=3; time="13:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=172;clientId=902;clientName="Ricardo Mendoza";dayOffset=3; time="14:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=173;clientId=2; clientName="Carlos López";    dayOffset=3; time="15:30";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=174;clientId=5; clientName="Miguel Sanz";     dayOffset=3; time="17:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=175;clientId=9; clientName="David Reyes";     dayOffset=3; time="18:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=176;clientId=7; clientName="Roberto Fuentes"; dayOffset=3; time="19:00";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },

  @{id=177;clientId=10;clientName="Carla Vega";      dayOffset=3; time="11:00";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=178;clientId=1; clientName="Marta García";    dayOffset=3; time="12:30";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=179;clientId=4; clientName="Lucía Fernández"; dayOffset=3; time="15:30";duration=45; service="Lavado y Marcado";       icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=180;clientId=11;clientName="Pablo Mora";      dayOffset=3; time="17:30";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=181;clientId=1; clientName="Marta García";    dayOffset=4; time="10:00";duration=120;service="Tinte y Mechas";         icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=182;clientId=6; clientName="Isabel Romero";   dayOffset=4; time="12:00";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-18";source="Alia"   },
  @{id=183;clientId=4; clientName="Lucía Fernández"; dayOffset=4; time="14:30";duration=90; service="Coloración";             icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=184;clientId=8; clientName="Elena Vidal";     dayOffset=4; time="16:00";duration=60; service="Manicura Semipermanente";icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=185;clientId=12;clientName="Sofía Iglesias";  dayOffset=4; time="17:30";duration=60; service="Tratamiento Capilar";   icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=186;clientId=3; clientName="Ana Martínez";    dayOffset=4; time="19:00";duration=45; service="Lavado y Marcado";      icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=187;clientId=2; clientName="Carlos López";    dayOffset=4; time="10:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=188;clientId=5; clientName="Miguel Sanz";     dayOffset=4; time="11:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=189;clientId=9; clientName="David Reyes";     dayOffset=4; time="11:30";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=190;clientId=7; clientName="Roberto Fuentes"; dayOffset=4; time="12:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=191;clientId=11;clientName="Pablo Mora";      dayOffset=4; time="13:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=192;clientId=902;clientName="Ricardo Mendoza";dayOffset=4; time="14:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=193;clientId=2; clientName="Carlos López";    dayOffset=4; time="15:30";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=194;clientId=5; clientName="Miguel Sanz";     dayOffset=4; time="17:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=195;clientId=9; clientName="David Reyes";     dayOffset=4; time="18:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=196;clientId=7; clientName="Roberto Fuentes"; dayOffset=4; time="19:00";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },

  @{id=197;clientId=3; clientName="Ana Martínez";    dayOffset=4; time="11:00";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=198;clientId=10;clientName="Carla Vega";      dayOffset=4; time="12:30";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=199;clientId=1; clientName="Marta García";    dayOffset=4; time="15:30";duration=45; service="Lavado y Marcado";       icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=200;clientId=4; clientName="Lucía Fernández"; dayOffset=4; time="18:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Alejandro Mora";status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=201;clientId=901;clientName="Marta Sánchez";  dayOffset=5; time="10:00";duration=90; service="Tratamiento Facial";     icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-20";source="Alia"   },
  @{id=202;clientId=4; clientName="Lucía Fernández"; dayOffset=5; time="11:30";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=203;clientId=3; clientName="Ana Martínez";    dayOffset=5; time="12:30";duration=45; service="Peinado y Recogido";     icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=204;clientId=6; clientName="Isabel Romero";   dayOffset=5; time="14:30";duration=90; service="Coloración";             icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=205;clientId=1; clientName="Marta García";    dayOffset=5; time="16:30";duration=60; service="Manicura Semipermanente";icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=206;clientId=8; clientName="Elena Vidal";     dayOffset=5; time="18:30";duration=45; service="Lavado y Marcado";      icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=207;clientId=2; clientName="Carlos López";    dayOffset=5; time="10:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-19";source="Alia"   },
  @{id=208;clientId=5; clientName="Miguel Sanz";     dayOffset=5; time="11:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=209;clientId=9; clientName="David Reyes";     dayOffset=5; time="11:30";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=210;clientId=7; clientName="Roberto Fuentes"; dayOffset=5; time="12:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=211;clientId=11;clientName="Pablo Mora";      dayOffset=5; time="13:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=212;clientId=902;clientName="Ricardo Mendoza";dayOffset=5; time="14:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=213;clientId=2; clientName="Carlos López";    dayOffset=5; time="15:30";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=214;clientId=5; clientName="Miguel Sanz";     dayOffset=5; time="17:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=215;clientId=9; clientName="David Reyes";     dayOffset=5; time="18:00";duration=30; service="Corte Clásico";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=216;clientId=7; clientName="Roberto Fuentes"; dayOffset=5; time="19:00";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },

  @{id=221;clientId=4; clientName="Lucía Fernández"; dayOffset=7; time="10:00";duration=120;service="Tinte y Mechas";         icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=222;clientId=3; clientName="Ana Martínez";    dayOffset=7; time="12:00";duration=45; service="Corte y Peinado";        icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=223;clientId=8; clientName="Elena Vidal";     dayOffset=7; time="14:30";duration=90; service="Coloración";             icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=224;clientId=6; clientName="Isabel Romero";   dayOffset=7; time="16:00";duration=60; service="Manicura Semipermanente";icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=225;clientId=1; clientName="Marta García";    dayOffset=7; time="17:30";duration=60; service="Tratamiento Capilar";   icon="gota";    prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=226;clientId=10;clientName="Carla Vega";      dayOffset=7; time="19:00";duration=45; service="Lavado y Marcado";      icon="tijeras"; prof="Laura Gómez";   status="pending";createdAt="2026-06-21";source="Alia"   },

  @{id=227;clientId=2; clientName="Carlos López";    dayOffset=7; time="10:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=228;clientId=5; clientName="Miguel Sanz";     dayOffset=7; time="11:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=229;clientId=9; clientName="David Reyes";     dayOffset=7; time="12:00";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=230;clientId=7; clientName="Roberto Fuentes"; dayOffset=7; time="13:00";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=231;clientId=11;clientName="Pablo Mora";      dayOffset=7; time="14:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=232;clientId=2; clientName="Carlos López";    dayOffset=7; time="15:30";duration=45; service="Corte + Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Alia"   },
  @{id=233;clientId=5; clientName="Miguel Sanz";     dayOffset=7; time="17:00";duration=20; service="Arreglo Barba";          icon="cuchilla";prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" },
  @{id=234;clientId=9; clientName="David Reyes";     dayOffset=7; time="19:00";duration=20; service="Corte Express";          icon="tijeras"; prof="Javier Ruiz";   status="pending";createdAt="2026-06-21";source="Manual" }
)

# Añadir dinámicos a la lista (con dayOffset, sin rawDate)
foreach ($d in $dynamic) {
    $obj = [PSCustomObject]$d
    [void]$allAppts.Add($obj)
}

# Calcular minutos ocupados reales (solo rawDate en mes de junio)
$totalMins = 0
$allAppts | Where-Object { $_.rawDate -and $_.rawDate.StartsWith("2026-06") } | ForEach-Object {
    $totalMins += [int]$_.duration
}
$base = 84 * 45
$totalMinsMes = 3 * 20 * 8 * 60
$pct = [math]::Round(($base + $totalMins) / $totalMinsMes * 100)
Write-Host "Minutos generados en Junio: $totalMins (+ base $base = $($base+$totalMins))"
Write-Host "Capacidad total mes: $totalMinsMes min"
Write-Host "Ocupacion estimada: $pct%"
Write-Host "Total citas: $($allAppts.Count)"

# Verificar errores
$errors = 0
$allAppts | Where-Object { $_.rawDate } | ForEach-Object {
    $h,$m = $_.time -split ":"
    $s = [int]$h*60+[int]$m; $e = $s+[int]$_.duration
    if ($s -lt 600 -or $e -gt 1200) { Write-Host "HORARIO: id=$($_.id) $($_.rawDate) $($_.time)+$($_.duration) $($_.prof)" -ForegroundColor Red; $errors++ }
    $d = [DateTime]::Parse($_.rawDate)
    $dow = [int]$d.DayOfWeek
    if ($dow -eq 0) { Write-Host "DOMINGO: id=$($_.id) $($_.rawDate) $($_.prof)" -ForegroundColor Red; $errors++ }
    if ($dow -eq 2 -and $_.prof -eq "Laura Gómez") { Write-Host "LAURA OFF: id=$($_.id) $($_.rawDate)" -ForegroundColor Red; $errors++ }
    if ($dow -eq 3 -and $_.prof -eq "Javier Ruiz") { Write-Host "JAVIER OFF: id=$($_.id) $($_.rawDate)" -ForegroundColor Red; $errors++ }
    if ($dow -eq 1 -and $_.prof -eq "Alejandro Mora") { Write-Host "ALEJ OFF: id=$($_.id) $($_.rawDate)" -ForegroundColor Red; $errors++ }
}
if ($errors -eq 0) { Write-Host "Sin errores de validacion OK" -ForegroundColor Green }

# Serializar a JSON
$json = $allAppts | ConvertTo-Json -Depth 5
Set-Content -Path "Data\appointments.json" -Value $json -Encoding UTF8
Write-Host "Archivo escrito correctamente." -ForegroundColor Cyan
