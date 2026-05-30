const Data = {

  DIETS: {
    keto: {
      name: 'Keto', icon: '🥑', color: '#F97316', bgColor: '#FFF7ED', textColor: '#C2410C',
      tagline: 'Alta en grasa, muy baja en carbohidratos',
      description: 'Induce cetosis: tu cuerpo quema grasa como combustible principal. Reduce insulina y acelera la pérdida de peso.',
      principles: ['Menos de 20g de carbohidratos netos/día', '70% grasas · 25% proteínas · 5% carbos', 'Sin cereales, legumbres, azúcar ni frutas dulces', 'Ayuno natural entre comidas'],
      macros: { p: 25, c: 5, f: 70 },
      days: [
        { day: 'Lunes', meals: {
          breakfast: { name:'Huevos revueltos con bacon y aguacate', desc:'3 huevos, 3 tiras de bacon, ½ aguacate', kcal:480, p:28, c:4, f:38, emoji:'🥚' },
          lunch: { name:'Ensalada César con pollo y queso parmesano', desc:'Pollo a la plancha, lechuga romana, queso parm, aderezo César', kcal:520, p:38, c:5, f:36, emoji:'🥗' },
          dinner: { name:'Salmón a la plancha con espinacas salteadas', desc:'180g salmón, espinacas con ajo y mantequilla', kcal:490, p:42, c:6, f:32, emoji:'🐟' },
          snack: { name:'Nueces y queso cheddar', desc:'30g nueces, 40g queso cheddar', kcal:220, p:9, c:3, f:19, emoji:'🧀' }
        }},
        { day: 'Martes', meals: {
          breakfast: { name:'Tortilla de queso y espinacas', desc:'3 huevos, 50g queso, puñado de espinacas', kcal:430, p:30, c:3, f:34, emoji:'🍳' },
          lunch: { name:'Bowl de atún con aguacate y pepino', desc:'1 lata de atún, 1 aguacate, pepino, aceite de oliva', kcal:480, p:36, c:5, f:32, emoji:'🥑' },
          dinner: { name:'Chuletas de cerdo con coliflor asada', desc:'200g chuletas, ½ coliflor asada con queso', kcal:540, p:44, c:7, f:36, emoji:'🥩' },
          snack: { name:'Pepperoni y aceitunas', desc:'30g pepperoni, 10 aceitunas', kcal:190, p:8, c:1, f:17, emoji:'🫒' }
        }},
        { day: 'Miércoles', meals: {
          breakfast: { name:'Panqueques de queso crema y huevo', desc:'2 huevos, 60g queso crema, canela', kcal:380, p:22, c:4, f:30, emoji:'🥞' },
          lunch: { name:'Wraps de lechuga con carne picada', desc:'150g carne picada, lechuga, queso, crema agria', kcal:510, p:36, c:5, f:38, emoji:'🌮' },
          dinner: { name:'Pollo al horno con brócoli al ajo', desc:'200g muslos de pollo, brócoli con mantequilla y ajo', kcal:500, p:46, c:8, f:30, emoji:'🍗' },
          snack: { name:'Chips de queso parmesano', desc:'Hornea 40g parmesano hasta crujiente', kcal:180, p:16, c:1, f:12, emoji:'🧀' }
        }},
        { day: 'Jueves', meals: {
          breakfast: { name:'Huevos fritos con aguacate y salmón ahumado', desc:'2 huevos fritos, ½ aguacate, 80g salmón ahumado', kcal:460, p:32, c:4, f:36, emoji:'🐠' },
          lunch: { name:'Ensalada Cobb', desc:'Pollo, bacon, huevo duro, queso azul, aguacate, lechuga', kcal:550, p:40, c:6, f:40, emoji:'🥗' },
          dinner: { name:'Gambas al ajillo con calabacín a la plancha', desc:'200g gambas, 1 calabacín, aceite de oliva, ajo', kcal:420, p:36, c:7, f:26, emoji:'🦐' },
          snack: { name:'Mantequilla de almendras en apio', desc:'2 ramas de apio, 2 cucharadas mantequilla de almendras', kcal:200, p:6, c:4, f:17, emoji:'🥜' }
        }},
        { day: 'Viernes', meals: {
          breakfast: { name:'Revuelto de chorizo con pimientos', desc:'2 huevos, 60g chorizo, pimiento verde', kcal:500, p:28, c:5, f:40, emoji:'🌶️' },
          lunch: { name:'Bowl de salmón con guacamole', desc:'150g salmón, guacamole casero, pepino, tomate cherry', kcal:530, p:38, c:6, f:38, emoji:'🥑' },
          dinner: { name:'Entrecot con espárragos a la mantequilla', desc:'180g entrecot, 8 espárragos, mantequilla compuesta', kcal:580, p:48, c:4, f:42, emoji:'🥩' },
          snack: { name:'Yogur griego entero con nueces', desc:'100g yogur griego entero, 20g nueces', kcal:210, p:12, c:5, f:16, emoji:'🥛' }
        }},
        { day: 'Sábado', meals: {
          breakfast: { name:'Omelette de queso brie y champiñones', desc:'3 huevos, 50g brie, 6 champiñones', kcal:450, p:30, c:4, f:36, emoji:'🍄' },
          lunch: { name:'Hamburguesa sin pan con doble queso', desc:'200g hamburguesa, 2 lonchas queso, lechuga, tomate, bacon', kcal:620, p:46, c:6, f:46, emoji:'🍔' },
          dinner: { name:'Costillas al horno con ensalada verde', desc:'300g costillas de cerdo, ensalada mixta con aceite', kcal:560, p:44, c:5, f:40, emoji:'🍖' },
          snack: { name:'Frambuesas con nata', desc:'60g frambuesas, 50ml nata líquida', kcal:160, p:2, c:7, f:14, emoji:'🫐' }
        }},
        { day: 'Domingo', meals: {
          breakfast: { name:'Huevos Benedict keto con jamón', desc:'2 huevos pochados, jamón york, salsa holandesa, sin muffin', kcal:490, p:30, c:3, f:40, emoji:'🍳' },
          lunch: { name:'Pollo asado con verduras de raíz keto', desc:'Cuartos de pollo, nabo, coliflor, aceite de oliva', kcal:540, p:48, c:8, f:34, emoji:'🍗' },
          dinner: { name:'Bacalao al horno con aceitunas y alcaparras', desc:'200g bacalao, aceitunas, alcaparras, tomate keto', kcal:420, p:40, c:5, f:26, emoji:'🐟' },
          snack: { name:'Dark chocolate 85% con almendras', desc:'20g chocolate 85%, 15g almendras', kcal:190, p:4, c:6, f:16, emoji:'🍫' }
        }}
      ],
      shopping: {
        'Proteínas': [{name:'Huevos camperos',qty:'18 uds',icon:'🥚'},{name:'Pechuga de pollo',qty:'600g',icon:'🍗'},{name:'Salmón fresco',qty:'400g',icon:'🐟'},{name:'Bacon ahumado',qty:'200g',icon:'🥓'},{name:'Carne picada',qty:'400g',icon:'🥩'},{name:'Atún en aceite',qty:'3 latas',icon:'🐠'}],
        'Grasas buenas': [{name:'Aguacates',qty:'6 uds',icon:'🥑'},{name:'Aceite de oliva virgen',qty:'1 botella',icon:'🫒'},{name:'Mantequilla',qty:'250g',icon:'🧈'},{name:'Nueces',qty:'200g',icon:'🌰'},{name:'Queso cheddar',qty:'200g',icon:'🧀'}],
        'Verduras bajas en carbs': [{name:'Espinacas',qty:'200g',icon:'🥬'},{name:'Brócoli',qty:'2 cabezas',icon:'🥦'},{name:'Coliflor',qty:'1 cabeza',icon:'🥦'},{name:'Calabacín',qty:'3 uds',icon:'🥒'},{name:'Pepino',qty:'2 uds',icon:'🥒'},{name:'Champiñones',qty:'250g',icon:'🍄'}]
      }
    },

    mediterranean: {
      name: 'Mediterránea', icon: '🫒', color: '#3B82F6', bgColor: '#EFF6FF', textColor: '#1D4ED8',
      tagline: 'Equilibrada, deliciosa y respaldada por la ciencia',
      description: 'La dieta más estudiada del mundo. Rica en grasas saludables, fibra y antioxidantes. Reduce el riesgo cardiovascular y favorece la pérdida de peso sostenida.',
      principles: ['Aceite de oliva como grasa principal', 'Pescado 3+ veces por semana', 'Legumbres y cereales integrales', 'Frutas y verduras en abundancia', 'Carne roja máximo 1 vez por semana'],
      macros: { p: 20, c: 50, f: 30 },
      days: [
        { day: 'Lunes', meals: {
          breakfast: { name:'Yogur griego con miel, nueces y arándanos', desc:'200g yogur griego, 1 cdta miel, 20g nueces, arándanos', kcal:320, p:18, c:28, f:14, emoji:'🫐' },
          lunch: { name:'Ensalada griega con feta y aceitunas', desc:'Tomate, pepino, cebolla, feta, aceitunas, orégano, AOVE', kcal:380, p:12, c:16, f:28, emoji:'🥗' },
          dinner: { name:'Bacalao al horno con tomate y alcaparras', desc:'200g bacalao, tomate, alcaparras, aceitunas, AOVE', kcal:420, p:40, c:14, f:18, emoji:'🐟' },
          snack: { name:'Hummus con crudités', desc:'3 cdas hummus, zanahoria, pepino, pimiento', kcal:180, p:7, c:20, f:8, emoji:'🥕' }
        }},
        { day: 'Martes', meals: {
          breakfast: { name:'Tostada integral con tomate y AOVE', desc:'2 tostadas integrales, tomate rallado, aceite de oliva, sal', kcal:300, p:8, c:42, f:12, emoji:'🍞' },
          lunch: { name:'Lentejas estofadas con verduras', desc:'200g lentejas, zanahoria, apio, tomate, comino', kcal:420, p:22, c:58, f:6, emoji:'🫘' },
          dinner: { name:'Pollo al limón con orégano y patatas al horno', desc:'180g pollo, patatas, limón, orégano, AOVE', kcal:480, p:36, c:40, f:16, emoji:'🍗' },
          snack: { name:'Naranja y almendras', desc:'1 naranja grande, 20g almendras crudas', kcal:200, p:5, c:26, f:10, emoji:'🍊' }
        }},
        { day: 'Miércoles', meals: {
          breakfast: { name:'Porridge de avena con fruta y semillas', desc:'60g avena, leche, plátano, semillas de chía', kcal:380, p:14, c:58, f:10, emoji:'🥣' },
          lunch: { name:'Ensalada de garbanzos con atún y pimiento', desc:'200g garbanzos cocidos, atún, pimiento rojo, perejil, AOVE', kcal:440, p:28, c:46, f:14, emoji:'🥗' },
          dinner: { name:'Lubina a la plancha con espinacas y limón', desc:'200g lubina, espinacas salteadas con ajo, zumo de limón', kcal:380, p:42, c:8, f:18, emoji:'🐠' },
          snack: { name:'Dátiles con queso ricotta', desc:'3 dátiles, 2 cdas ricotta', kcal:190, p:6, c:32, f:6, emoji:'🍮' }
        }},
        { day: 'Jueves', meals: {
          breakfast: { name:'Tortilla española de patata light', desc:'2 huevos, ½ patata, cebolla, AOVE', kcal:340, p:16, c:28, f:16, emoji:'🍳' },
          lunch: { name:'Pasta integral con pesto y tomates cherry', desc:'80g pasta integral, pesto casero, tomates cherry, parmesano', kcal:480, p:16, c:64, f:18, emoji:'🍝' },
          dinner: { name:'Dorada al horno con verduras mediterráneas', desc:'200g dorada, berenjenas, calabacín, pimiento, AOVE, hierbas', kcal:420, p:38, c:16, f:20, emoji:'🐟' },
          snack: { name:'Higos frescos con queso manchego', desc:'2 higos, 30g queso manchego curado', kcal:180, p:7, c:22, f:8, emoji:'🧀' }
        }},
        { day: 'Viernes', meals: {
          breakfast: { name:'Smoothie verde mediterráneo', desc:'Espinacas, plátano, leche de almendras, semillas de lino', kcal:300, p:8, c:44, f:10, emoji:'🥤' },
          lunch: { name:'Cuscús con verduras asadas y garbanzos', desc:'80g cuscús, pimiento, calabacín, garbanzos, comino', kcal:420, p:16, c:68, f:10, emoji:'🫙' },
          dinner: { name:'Gambas con ajo, guindilla y perejil', desc:'200g gambas, ajo, guindilla, perejil, AOVE, pan integral', kcal:380, p:32, c:18, f:18, emoji:'🦐' },
          snack: { name:'Macedonia de frutas con menta', desc:'Fresa, melón, uva, kiwi, menta', kcal:140, p:2, c:34, f:1, emoji:'🍓' }
        }},
        { day: 'Sábado', meals: {
          breakfast: { name:'Shakshuka (huevos en salsa de tomate)', desc:'2 huevos, tomates, pimiento, comino, pimentón, pan integral', kcal:380, p:20, c:34, f:18, emoji:'🍳' },
          lunch: { name:'Paella de verduras', desc:'Arroz integral, judías verdes, alcachofas, pimiento, azafrán', kcal:460, p:12, c:80, f:10, emoji:'🥘' },
          dinner: { name:'Atún a la plancha con tabulé', desc:'180g atún fresco, tabulé de quinoa, menta, limón', kcal:440, p:42, c:36, f:14, emoji:'🥗' },
          snack: { name:'Pan con aceite de oliva y tomate', desc:'1 tostada, tomate rallado, AOVE, escamas de sal', kcal:180, p:4, c:24, f:8, emoji:'🫒' }
        }},
        { day: 'Domingo', meals: {
          breakfast: { name:'Huevos benedictinos con salmón', desc:'2 huevos pochados, salmón ahumado, pan integral, salsa de yogur', kcal:420, p:28, c:32, f:18, emoji:'🐠' },
          lunch: { name:'Cordero al horno con romero y patatas', desc:'200g pierna de cordero, patatas asadas, romero, ajo, AOVE', kcal:560, p:44, c:38, f:24, emoji:'🍖' },
          dinner: { name:'Sopa de tomate con albahaca y pan integral', desc:'Sopa de tomate casera, albahaca fresca, tostada integral', kcal:320, p:10, c:48, f:10, emoji:'🍅' },
          snack: { name:'Baklava casero (porción pequeña)', desc:'1 porción pequeña de baklava', kcal:200, p:4, c:30, f:8, emoji:'🍮' }
        }}
      ],
      shopping: {
        'Proteínas': [{name:'Huevos camperos',qty:'12 uds',icon:'🥚'},{name:'Pechuga de pollo',qty:'400g',icon:'🍗'},{name:'Bacalao fresco',qty:'400g',icon:'🐟'},{name:'Atún en lata',qty:'3 latas',icon:'🐠'},{name:'Gambas',qty:'300g',icon:'🦐'}],
        'Verduras y frutas': [{name:'Tomates',qty:'1kg',icon:'🍅'},{name:'Pimientos',qty:'4 uds',icon:'🌶️'},{name:'Berenjenas',qty:'2 uds',icon:'🍆'},{name:'Espinacas',qty:'300g',icon:'🥬'},{name:'Naranjas y limones',qty:'6 uds',icon:'🍊'}],
        'Legumbres y cereales': [{name:'Garbanzos cocidos',qty:'2 botes',icon:'🫘'},{name:'Lentejas',qty:'500g',icon:'🫘'},{name:'Pasta integral',qty:'500g',icon:'🍝'},{name:'Arroz integral',qty:'500g',icon:'🍚'},{name:'Pan integral',qty:'1 barra',icon:'🍞'}]
      }
    },

    intermittent_fasting: {
      name: 'Ayuno 16:8', icon: '⏱️', color: '#8B5CF6', bgColor: '#F5F3FF', textColor: '#6D28D9',
      tagline: 'Come en 8 horas, ayuna 16 horas',
      description: 'Sin cambiar lo que comes, cambias CUÁNDO comes. El ayuno activa la autofagia, mejora la sensibilidad a la insulina y acelera la pérdida de grasa.',
      principles: ['Ventana de comida: 12:00 – 20:00', 'Solo agua, café o té sin azúcar en ayunas', 'Dieta equilibrada dentro de la ventana', 'Empezar gradual: 12h → 14h → 16h'],
      macros: { p: 25, c: 45, f: 30 },
      fastingWindow: { start: '20:00', end: '12:00', hours: 16 },
      days: [
        { day: 'Lunes', meals: {
          breakfast: { name:'Primera comida 12:00 — Bowl de proteínas', desc:'2 huevos, 100g pollo, aguacate, espinacas, tomate', kcal:480, p:38, c:16, f:26, emoji:'🥗' },
          lunch: { name:'Comida 15:00 — Pasta integral con pollo y pesto', desc:'80g pasta, 150g pollo, pesto, parmesano', kcal:540, p:36, c:58, f:18, emoji:'🍝' },
          dinner: { name:'Última comida 19:30 — Salmón con quinoa', desc:'180g salmón, 80g quinoa, brócoli al vapor', kcal:480, p:42, c:40, f:18, emoji:'🐟' },
          snack: { name:'Snack 17:00 — Yogur griego con nueces', desc:'150g yogur griego, 20g nueces, canela', kcal:220, p:14, c:12, f:14, emoji:'🥛' }
        }},
        { day: 'Martes', meals: {
          breakfast: { name:'Primera comida 12:00 — Tortilla con verduras', desc:'3 huevos, pimiento, tomate, queso, pan integral', kcal:450, p:30, c:28, f:22, emoji:'🍳' },
          lunch: { name:'Comida 15:00 — Arroz con legumbres', desc:'70g arroz integral, 150g garbanzos, espinacas, comino', kcal:480, p:20, c:74, f:8, emoji:'🫘' },
          dinner: { name:'Última comida 19:30 — Pollo al limón con patatas', desc:'200g pollo, 150g patatas al horno, ensalada', kcal:500, p:44, c:42, f:14, emoji:'🍗' },
          snack: { name:'Snack 17:00 — Fruta con mantequilla de almendras', desc:'1 manzana, 1 cda mantequilla de almendras', kcal:200, p:4, c:30, f:9, emoji:'🍎' }
        }},
        { day: 'Miércoles', meals: {
          breakfast: { name:'Primera comida 12:00 — Tostadas con aguacate y huevo', desc:'2 tostadas integrales, 1 aguacate, 2 huevos pochados', kcal:460, p:22, c:40, f:24, emoji:'🥑' },
          lunch: { name:'Comida 15:00 — Ensalada de quinoa y atún', desc:'80g quinoa, atún, pepino, tomate, pimiento, AOVE', kcal:440, p:30, c:48, f:14, emoji:'🥗' },
          dinner: { name:'Última comida 19:30 — Merluza con verduras', desc:'200g merluza, judías verdes, zanahoria, patata pequeña', kcal:420, p:40, c:34, f:10, emoji:'🐟' },
          snack: { name:'Snack 17:00 — Plátano con cacao', desc:'1 plátano, 1 cda cacao puro en polvo, leche', kcal:210, p:6, c:40, f:4, emoji:'🍌' }
        }},
        { day: 'Jueves', meals: {
          breakfast: { name:'Primera comida 12:00 — Smoothie proteico', desc:'Proteína de suero, avena, leche, plátano, mantequilla de cacahuete', kcal:500, p:36, c:56, f:12, emoji:'🥤' },
          lunch: { name:'Comida 15:00 — Wrap de pollo y verduras', desc:'Tortilla integral, 150g pollo, aguacate, lechuga, tomate', kcal:520, p:38, c:48, f:18, emoji:'🌮' },
          dinner: { name:'Última comida 19:30 — Ternera con arroz y brócoli', desc:'150g ternera magra, 70g arroz, brócoli al vapor', kcal:480, p:40, c:46, f:12, emoji:'🥩' },
          snack: { name:'Snack 17:00 — Queso cottage con frutas del bosque', desc:'150g queso cottage, arándanos, frambuesas', kcal:180, p:20, c:16, f:3, emoji:'🫐' }
        }},
        { day: 'Viernes', meals: {
          breakfast: { name:'Primera comida 12:00 — Bowl de açaí', desc:'Açaí, granola, plátano, fresas, miel', kcal:420, p:10, c:72, f:12, emoji:'🫐' },
          lunch: { name:'Comida 15:00 — Pizza integral con verduras', desc:'Base integral, tomate, mozzarella light, verduras variadas', kcal:480, p:22, c:64, f:14, emoji:'🍕' },
          dinner: { name:'Última comida 19:30 — Bacalao con tomillo', desc:'200g bacalao, tomates cherry, olivas, alcaparras', kcal:380, p:42, c:12, f:16, emoji:'🐠' },
          snack: { name:'Snack 17:00 — Puñado de frutos secos mixtos', desc:'30g nueces, almendras y anacardos', kcal:200, p:6, c:8, f:18, emoji:'🌰' }
        }},
        { day: 'Sábado', meals: {
          breakfast: { name:'Primera comida 12:00 — Brunch completo', desc:'2 huevos, bacon de pavo, aguacate, tostada integral, zumo', kcal:520, p:30, c:40, f:24, emoji:'🥚' },
          lunch: { name:'Comida 15:00 — Hamburguesa saludable', desc:'Pan integral, 150g pavo, aguacate, tomate, lechuga', kcal:540, p:40, c:46, f:18, emoji:'🍔' },
          dinner: { name:'Última comida 19:30 — Sushi casero', desc:'Arroz de sushi, salmón, pepino, aguacate, alga nori', kcal:480, p:26, c:68, f:12, emoji:'🍣' },
          snack: { name:'Snack 17:00 — Palomitas con especias', desc:'40g palomitas caseras, comino, pimentón', kcal:160, p:4, c:30, f:4, emoji:'🍿' }
        }},
        { day: 'Domingo', meals: {
          breakfast: { name:'Primera comida 12:00 — Pancakes de avena', desc:'60g avena, 2 huevos, plátano, sirope de arce', kcal:460, p:20, c:72, f:10, emoji:'🥞' },
          lunch: { name:'Comida 15:00 — Paella mixta', desc:'Arroz, gambas, mejillones, calamares, verduras, azafrán', kcal:560, p:32, c:76, f:12, emoji:'🥘' },
          dinner: { name:'Última comida 19:30 — Crema de verduras', desc:'Crema de calabaza, zanahoria y jengibre, pan integral', kcal:340, p:8, c:54, f:10, emoji:'🍲' },
          snack: { name:'Snack 17:00 — Chocolate negro con naranja', desc:'25g chocolate 70%, 1 naranja', kcal:190, p:3, c:30, f:9, emoji:'🍫' }
        }}
      ],
      shopping: {
        'Proteínas': [{name:'Huevos camperos',qty:'18 uds',icon:'🥚'},{name:'Pechuga de pollo',qty:'600g',icon:'🍗'},{name:'Salmón',qty:'400g',icon:'🐟'},{name:'Atún en lata',qty:'4 latas',icon:'🐠'},{name:'Yogur griego',qty:'4 botes',icon:'🥛'}],
        'Carbohidratos': [{name:'Avena',qty:'500g',icon:'🥣'},{name:'Arroz integral',qty:'1kg',icon:'🍚'},{name:'Pan integral',qty:'1 barra',icon:'🍞'},{name:'Quinoa',qty:'400g',icon:'🌾'},{name:'Pasta integral',qty:'500g',icon:'🍝'}],
        'Frutas y verduras': [{name:'Plátanos',qty:'6 uds',icon:'🍌'},{name:'Aguacates',qty:'4 uds',icon:'🥑'},{name:'Espinacas',qty:'300g',icon:'🥬'},{name:'Frutos del bosque',qty:'300g',icon:'🫐'}]
      }
    },

    dash: {
      name: 'Dieta DASH', icon: '💙', color: '#06B6D4', bgColor: '#ECFEFF', textColor: '#0E7490',
      tagline: 'Baja en sodio, alta en nutrientes',
      description: 'Diseñada para controlar la presión arterial, también es muy efectiva para perder peso. Rica en potasio, magnesio y calcio naturales.',
      principles: ['Máximo 2300mg de sodio/día', 'Sin alimentos procesados ni embutidos', 'Rica en frutas, verduras y lácteos bajos en grasa', 'Granos integrales en cada comida'],
      macros: { p: 18, c: 55, f: 27 },
      days: [
        { day: 'Lunes', meals: {
          breakfast: { name:'Avena con fruta y leche desnatada', desc:'60g avena, leche desnatada, manzana, canela, sin azúcar', kcal:340, p:14, c:58, f:6, emoji:'🥣' },
          lunch: { name:'Ensalada de pollo con quinoa', desc:'150g pollo a la plancha, quinoa, espinacas, tomate, limón', kcal:440, p:38, c:44, f:10, emoji:'🥗' },
          dinner: { name:'Merluza al vapor con verduras', desc:'200g merluza, judías verdes, zanahoria, limón, hierbas', kcal:380, p:40, c:22, f:8, emoji:'🐟' },
          snack: { name:'Yogur natural con nueces y melocotón', desc:'150g yogur sin azúcar, 15g nueces, 1 melocotón', kcal:200, p:12, c:22, f:8, emoji:'🍑' }
        }},
        { day: 'Martes', meals: {
          breakfast: { name:'Tostadas con requesón y tomate', desc:'2 tostadas integrales, 100g requesón, tomate, pimienta negra', kcal:320, p:18, c:40, f:8, emoji:'🍞' },
          lunch: { name:'Sopa de lentejas con verduras', desc:'200g lentejas, zanahoria, apio, tomate, comino, sin sal extra', kcal:400, p:22, c:58, f:4, emoji:'🍲' },
          dinner: { name:'Pechuga de pollo al horno con patata', desc:'180g pechuga, 150g patata, ajo, romero, sin sal', kcal:440, p:42, c:40, f:8, emoji:'🍗' },
          snack: { name:'Manzana con mantequilla de almendras', desc:'1 manzana, 1 cda mantequilla de almendras sin sal', kcal:190, p:4, c:28, f:8, emoji:'🍎' }
        }},
        { day: 'Miércoles', meals: {
          breakfast: { name:'Batido de frutas con semillas de chía', desc:'Leche de soja, plátano, fresas, chía, espinacas', kcal:310, p:12, c:46, f:8, emoji:'🥤' },
          lunch: { name:'Ensalada Nicoise sin sal', desc:'Atún, huevo duro, judías verdes, tomate, aceitunas, AOVE', kcal:420, p:30, c:26, f:20, emoji:'🥗' },
          dinner: { name:'Trucha al horno con limón y hierbas', desc:'200g trucha, limón, perejil, eneldo, arroz integral', kcal:460, p:40, c:44, f:12, emoji:'🐟' },
          snack: { name:'Puñado de almendras y kiwi', desc:'20g almendras, 2 kiwis', kcal:190, p:6, c:24, f:10, emoji:'🥝' }
        }},
        { day: 'Jueves', meals: {
          breakfast: { name:'Yogur con granola casera y frutas', desc:'150g yogur 0%, granola sin azúcar, fresas, arándanos', kcal:340, p:16, c:52, f:8, emoji:'🫐' },
          lunch: { name:'Buddha bowl de garbanzos', desc:'Garbanzos, boniato asado, kale, tahini sin sal, limón', kcal:460, p:18, c:66, f:14, emoji:'🫘' },
          dinner: { name:'Pavo a la plancha con puré de coliflor', desc:'180g pavo, puré de coliflor con ajo, judías verdes', kcal:400, p:44, c:22, f:10, emoji:'🦃' },
          snack: { name:'Naranja y nueces', desc:'1 naranja grande, 15g nueces', kcal:170, p:4, c:24, f:8, emoji:'🍊' }
        }},
        { day: 'Viernes', meals: {
          breakfast: { name:'Tortitas de plátano (2 ingredientes)', desc:'2 huevos, 1 plátano maduro, canela. Sin sal', kcal:300, p:14, c:38, f:10, emoji:'🥞' },
          lunch: { name:'Pasta integral con verduras y pavo', desc:'80g pasta, 120g pavo, pimiento, tomate, ajo, albahaca', kcal:480, p:34, c:62, f:8, emoji:'🍝' },
          dinner: { name:'Gambas al vapor con ajo y perejil', desc:'200g gambas sin sal, ajo, perejil, limón, pan integral', kcal:360, p:32, c:24, f:10, emoji:'🦐' },
          snack: { name:'Pera con queso fresco batido', desc:'1 pera, 100g queso fresco batido 0%', kcal:170, p:10, c:26, f:2, emoji:'🍐' }
        }},
        { day: 'Sábado', meals: {
          breakfast: { name:'Huevos revueltos con espinacas y tostada', desc:'2 huevos, espinacas, 1 tostada integral, sin sal', kcal:360, p:22, c:34, f:14, emoji:'🍳' },
          lunch: { name:'Caldo de pollo casero con verduras', desc:'Pollo, zanahoria, apio, puerro, nabo. Sin sal extra', kcal:380, p:36, c:28, f:10, emoji:'🍲' },
          dinner: { name:'Besugo al horno con limón', desc:'200g besugo, limón, ajo, perejil, patata pequeña', kcal:420, p:40, c:32, f:12, emoji:'🐟' },
          snack: { name:'Smoothie de mango y jengibre', desc:'100g mango, jengibre, leche de avena, cúrcuma', kcal:160, p:4, c:34, f:2, emoji:'🥭' }
        }},
        { day: 'Domingo', meals: {
          breakfast: { name:'Porridge de quinoa con frutos rojos', desc:'60g quinoa cocida, leche de almendras, frutos rojos, miel', kcal:360, p:14, c:62, f:8, emoji:'🍓' },
          lunch: { name:'Pollo asado con patatas y ensalada', desc:'200g pollo, patatas al horno, ensalada verde con limón', kcal:520, p:44, c:44, f:14, emoji:'🍗' },
          dinner: { name:'Crema de zanahoria y jengibre', desc:'Zanahoria, jengibre, leche de coco light, comino', kcal:280, p:6, c:44, f:8, emoji:'🥕' },
          snack: { name:'Compota de manzana casera', desc:'2 manzanas cocinadas con canela, sin azúcar', kcal:140, p:1, c:36, f:1, emoji:'🍎' }
        }}
      ],
      shopping: {
        'Proteínas bajas en grasa': [{name:'Pechuga de pollo',qty:'600g',icon:'🍗'},{name:'Merluza',qty:'400g',icon:'🐟'},{name:'Gambas',qty:'300g',icon:'🦐'},{name:'Huevos',qty:'12 uds',icon:'🥚'},{name:'Pavo en filetes',qty:'400g',icon:'🦃'}],
        'Lácteos bajos en grasa': [{name:'Yogur natural 0%',qty:'4 botes',icon:'🥛'},{name:'Requesón',qty:'250g',icon:'🧀'},{name:'Leche desnatada',qty:'1L',icon:'🥛'}],
        'Frutas y verduras': [{name:'Manzanas y peras',qty:'6 uds',icon:'🍎'},{name:'Plátanos',qty:'4 uds',icon:'🍌'},{name:'Espinacas',qty:'300g',icon:'🥬'},{name:'Zanahoria',qty:'1kg',icon:'🥕'},{name:'Frutos rojos',qty:'300g',icon:'🍓'}]
      }
    },

    plant_based: {
      name: 'Plant-Based', icon: '🌱', color: '#22C55E', bgColor: '#F0FDF4', textColor: '#15803D',
      tagline: '100% vegetal, completa y deliciosa',
      description: 'Basada en alimentos de origen vegetal. Alta en fibra, antioxidantes y fitoquímicos. Reduce la inflamación y favorece la pérdida de peso gradual y sostenida.',
      principles: ['Sin productos animales', 'Combina legumbres + cereales para proteína completa', 'Suplementa Vitamina B12', 'Prioriza alimentos mínimamente procesados'],
      macros: { p: 15, c: 60, f: 25 },
      days: [
        { day: 'Lunes', meals: {
          breakfast: { name:'Tostadas de aguacate con tomate y semillas', desc:'2 tostadas integrales, aguacate, tomate, semillas de cáñamo', kcal:380, p:12, c:44, f:18, emoji:'🥑' },
          lunch: { name:'Bowl de lentejas con arroz y curry', desc:'200g lentejas, arroz integral, espinacas, curry, cúrcuma', kcal:460, p:22, c:74, f:8, emoji:'🍛' },
          dinner: { name:'Tofu salteado con verduras y soja', desc:'200g tofu firme, brócoli, pimiento, salsa de soja, jengibre', kcal:400, p:24, c:30, f:18, emoji:'🥦' },
          snack: { name:'Hummus casero con palitos de zanahoria', desc:'4 cdas hummus, zanahoria, apio, pepino', kcal:180, p:8, c:22, f:8, emoji:'🥕' }
        }},
        { day: 'Martes', meals: {
          breakfast: { name:'Smoothie bowl verde con granola', desc:'Espinacas, plátano, leche de avena, granola, kiwi, semillas', kcal:420, p:10, c:72, f:12, emoji:'🥤' },
          lunch: { name:'Ensalada de garbanzos y aguacate', desc:'200g garbanzos, aguacate, tomate, maíz, cilantro, limón', kcal:440, p:16, c:52, f:18, emoji:'🥗' },
          dinner: { name:'Pasta con salsa boloñesa de soja texturizada', desc:'80g pasta, 100g soja texturizada, tomate, hierbas', kcal:480, p:28, c:70, f:8, emoji:'🍝' },
          snack: { name:'Manzana con mantequilla de cacahuete', desc:'1 manzana, 2 cdas mantequilla cacahuete natural', kcal:230, p:6, c:30, f:10, emoji:'🍎' }
        }},
        { day: 'Miércoles', meals: {
          breakfast: { name:'Porridge de avena con frutas del bosque', desc:'70g avena, leche de almendras, arándanos, frambuesas, semillas chía', kcal:380, p:12, c:60, f:10, emoji:'🥣' },
          lunch: { name:'Burrito vegano de frijoles', desc:'Tortilla integral, frijoles negros, arroz, aguacate, pico de gallo', kcal:520, p:18, c:82, f:12, emoji:'🌯' },
          dinner: { name:'Curry de garbanzos con leche de coco', desc:'200g garbanzos, leche de coco, tomate, espinacas, curry', kcal:460, p:16, c:56, f:18, emoji:'🍛' },
          snack: { name:'Dátiles con almendras', desc:'4 dátiles, 20g almendras', kcal:200, p:4, c:36, f:8, emoji:'🌴' }
        }},
        { day: 'Jueves', meals: {
          breakfast: { name:'Pancakes de plátano y avena', desc:'2 plátanos maduros, 60g avena, leche vegetal, canela', kcal:400, p:10, c:76, f:6, emoji:'🥞' },
          lunch: { name:'Poke bowl de edamame y quinoa', desc:'Quinoa, edamame, mango, pepino, aguacate, salsa de soja', kcal:480, p:20, c:68, f:14, emoji:'🥗' },
          dinner: { name:'Hamburguesa de lentejas y remolacha', desc:'Hamburguesa vegana, pan integral, lechuga, tomate, mostaza', kcal:460, p:20, c:70, f:12, emoji:'🍔' },
          snack: { name:'Chips de kale al horno', desc:'Kale, aceite de oliva, sal, levadura nutricional', kcal:140, p:6, c:14, f:6, emoji:'🥬' }
        }},
        { day: 'Viernes', meals: {
          breakfast: { name:'Yogur de soja con granola y fruta', desc:'150g yogur soja, granola sin miel, plátano, fresas', kcal:360, p:12, c:60, f:8, emoji:'🍓' },
          lunch: { name:'Buddha bowl de tempeh asado', desc:'Tempeh marinado, arroz, kale, boniato, tahini, sésamo', kcal:520, p:26, c:66, f:16, emoji:'🫘' },
          dinner: { name:'Pizza vegana con verduras y queso cashew', desc:'Base integral, tomate, mozzarella de anacardo, verduras', kcal:480, p:14, c:76, f:14, emoji:'🍕' },
          snack: { name:'Zumo verde con jengibre', desc:'Manzana, apio, espinacas, jengibre, limón', kcal:130, p:2, c:30, f:1, emoji:'🥤' }
        }},
        { day: 'Sábado', meals: {
          breakfast: { name:'Full English vegano', desc:'Tofu scrambled, champiñones, tomate, alubias, tostada integral', kcal:460, p:24, c:56, f:14, emoji:'🍳' },
          lunch: { name:'Ramen vegano con champiñones shiitake', desc:'Caldo de miso, fideos soba, tofu, alga nori, bambú, sésamo', kcal:480, p:20, c:72, f:12, emoji:'🍜' },
          dinner: { name:'Tacos de jackfruit al pastor', desc:'Jackfruit macerado, tortilla de maíz, cebolla, cilantro, piña', kcal:440, p:10, c:80, f:10, emoji:'🌮' },
          snack: { name:'Batido de cacao y plátano', desc:'Plátano congelado, cacao, leche de almendras, proteína vegetal', kcal:260, p:18, c:38, f:6, emoji:'🍫' }
        }},
        { day: 'Domingo', meals: {
          breakfast: { name:'Tostadas de crema de cacahuete y plátano', desc:'2 tostadas integrales, crema cacahuete natural, plátano, canela', kcal:400, p:14, c:58, f:14, emoji:'🥜' },
          lunch: { name:'Paella vegana de verduras y legumbres', desc:'Arroz, garbanzos, judías verdes, pimiento, alcachofa, azafrán', kcal:480, p:14, c:86, f:6, emoji:'🥘' },
          dinner: { name:'Lasaña vegana de soja y verduras', desc:'Placas integrales, soja texturizada, tomate, bechamel de avena', kcal:500, p:24, c:72, f:14, emoji:'🍝' },
          snack: { name:'Naranja y nueces de Brasil', desc:'1 naranja, 15g nueces de Brasil', kcal:160, p:4, c:22, f:8, emoji:'🍊' }
        }}
      ],
      shopping: {
        'Proteínas vegetales': [{name:'Tofu firme',qty:'400g',icon:'🫙'},{name:'Tempeh',qty:'300g',icon:'🫘'},{name:'Garbanzos cocidos',qty:'3 botes',icon:'🫘'},{name:'Lentejas',qty:'500g',icon:'🫘'},{name:'Edamame congelado',qty:'300g',icon:'🌱'}],
        'Granos y cereales': [{name:'Avena integral',qty:'500g',icon:'🥣'},{name:'Quinoa',qty:'400g',icon:'🌾'},{name:'Arroz integral',qty:'1kg',icon:'🍚'},{name:'Pan integral',qty:'1 barra',icon:'🍞'},{name:'Pasta integral',qty:'500g',icon:'🍝'}],
        'Frutas y verduras': [{name:'Plátanos',qty:'6 uds',icon:'🍌'},{name:'Aguacates',qty:'4 uds',icon:'🥑'},{name:'Espinacas y kale',qty:'400g',icon:'🥬'},{name:'Frutas del bosque',qty:'400g',icon:'🫐'},{name:'Brócoli',qty:'2 cabezas',icon:'🥦'}]
      }
    }
  },

  WORKOUTS: {
    gym: {
      name: 'Gimnasio', icon: '🏋️',
      weekly: [
        { day: 'Lunes', focus: 'Pecho + Tríceps', icon: '💪', exercises: [
          { name:'Press de banca plano', sets:4, reps:'10-12', rest:90, muscles:'Pecho, tríceps, hombros', tip:'Baja la barra hasta el pecho, codos a 45°', anim:'press', emoji:'🏋️' },
          { name:'Press inclinado con mancuernas', sets:3, reps:'12', rest:75, muscles:'Pecho superior', tip:'Inclina el banco 30-45°, baja hasta estirar bien', anim:'press', emoji:'💪' },
          { name:'Aperturas en polea alta', sets:3, reps:'15', rest:60, muscles:'Pecho, tensión constante', tip:'Mantén codos ligeramente flexionados, junta las manos abajo', anim:'row', emoji:'🔄' },
          { name:'Extensiones tríceps en polea', sets:3, reps:'15', rest:60, muscles:'Tríceps (3 cabezas)', tip:'Codos pegados al cuerpo, extiende completamente', anim:'curl', emoji:'💪' },
          { name:'Fondos en paralelas', sets:3, reps:'10-12', rest:75, muscles:'Tríceps, pecho inferior', tip:'Inclínate ligeramente hacia adelante para activar pecho', anim:'pushup', emoji:'🤸' }
        ]},
        { day: 'Martes', focus: 'Espalda + Bíceps', icon: '🔙', exercises: [
          { name:'Dominadas o jalón al pecho', sets:4, reps:'8-10', rest:90, muscles:'Espalda, bíceps, romboides', tip:'Pecho al frente, codos hacia atrás y abajo', anim:'deadlift', emoji:'⬆️' },
          { name:'Remo con barra', sets:4, reps:'10', rest:90, muscles:'Espalda media, bíceps', tip:'Espalda plana, lleva la barra al ombligo', anim:'row', emoji:'🏋️' },
          { name:'Remo en polea baja sentado', sets:3, reps:'12', rest:60, muscles:'Espalda, bíceps', tip:'Pecho erguido, tira con los codos hacia atrás', anim:'row', emoji:'💪' },
          { name:'Curl de bíceps con barra', sets:3, reps:'12', rest:60, muscles:'Bíceps', tip:'Sin balanceo, codos fijos a los costados', anim:'curl', emoji:'💪' },
          { name:'Curl martillo con mancuernas', sets:3, reps:'12', rest:60, muscles:'Bíceps, braquial', tip:'Pulgar arriba durante todo el movimiento', anim:'curl', emoji:'🔨' }
        ]},
        { day: 'Miércoles', focus: 'Cardio + Core', icon: '🏃', exercises: [
          { name:'Carrera en cinta (moderada)', sets:1, reps:'25 min', rest:0, muscles:'Cardiovascular, piernas', tip:'Ritmo al que puedas hablar, zona 2', anim:'run', emoji:'🏃' },
          { name:'Plancha frontal', sets:3, reps:'45 seg', rest:45, muscles:'Core, transverso', tip:'Cuerpo recto como tabla, respira', anim:'plank', emoji:'🧘' },
          { name:'Crunch abdominal', sets:3, reps:'20', rest:45, muscles:'Recto abdominal', tip:'No tires del cuello, contrae el ombligo', anim:'squat', emoji:'💪' },
          { name:'Mountain climbers', sets:3, reps:'30 seg', rest:30, muscles:'Core, cardio', tip:'Caderas abajo, ritmo controlado', anim:'run', emoji:'⛰️' },
          { name:'Plancha lateral', sets:3, reps:'30 seg', rest:30, muscles:'Oblicuos, core lateral', tip:'Cuerpo en línea recta, cadera arriba', anim:'plank', emoji:'↔️' }
        ]},
        { day: 'Jueves', focus: 'Piernas + Glúteos', icon: '🦵', exercises: [
          { name:'Sentadilla con barra', sets:4, reps:'8-10', rest:120, muscles:'Cuádriceps, glúteos, isquios', tip:'Rodillas sobre pies, baja hasta paralelo o más', anim:'squat', emoji:'🏋️' },
          { name:'Prensa de piernas', sets:3, reps:'12', rest:90, muscles:'Cuádriceps, glúteos', tip:'Pies separados a la anchura de hombros, rodillas sin bloquear', anim:'press', emoji:'🦵' },
          { name:'Extensiones de cuádriceps', sets:3, reps:'15', rest:60, muscles:'Cuádriceps', tip:'Sube hasta extensión completa, baja controlado', anim:'squat', emoji:'⬆️' },
          { name:'Hip thrust con barra', sets:4, reps:'12', rest:90, muscles:'Glúteos, isquios', tip:'Empuja con los talones, contrae glúteos arriba', anim:'deadlift', emoji:'🍑' },
          { name:'Elevación de pantorrillas en máquina', sets:4, reps:'20', rest:45, muscles:'Gastrocnemio, sóleo', tip:'Rango completo, pausa arriba y abajo', anim:'jump', emoji:'⬆️' }
        ]},
        { day: 'Viernes', focus: 'Hombros + Core', icon: '💫', exercises: [
          { name:'Press militar con barra', sets:4, reps:'10', rest:90, muscles:'Hombros, tríceps', tip:'Sin arquear la espalda, empuja vertical', anim:'press', emoji:'🏋️' },
          { name:'Elevaciones laterales', sets:3, reps:'15', rest:60, muscles:'Deltoides medios', tip:'Codos ligeramente flexionados, muñecas neutras', anim:'row', emoji:'↔️' },
          { name:'Elevaciones frontales', sets:3, reps:'12', rest:60, muscles:'Deltoides anteriores', tip:'Peso ligero, movimiento controlado', anim:'press', emoji:'⬆️' },
          { name:'Pájaros (posteriores)', sets:3, reps:'15', rest:60, muscles:'Deltoides posterior, romboides', tip:'Mancuernas ligeras, codos ligeramente flexionados', anim:'row', emoji:'🦅' },
          { name:'Rueda abdominal', sets:3, reps:'10-12', rest:60, muscles:'Core completo', tip:'Espalda plana en todo momento, vuelve controlado', anim:'plank', emoji:'⭕' }
        ]},
        { day: 'Sábado', focus: 'Full Body ligero', icon: '🌟', exercises: [
          { name:'Peso muerto', sets:3, reps:'10', rest:90, muscles:'Espalda, glúteos, isquios', tip:'Espalda neutral, empuja el suelo con los pies', anim:'deadlift', emoji:'🏋️' },
          { name:'Sentadilla búlgara', sets:3, reps:'10 c/lado', rest:75, muscles:'Cuádriceps, glúteos, equilibrio', tip:'Pie trasero en banco, rodilla delantera no sobrepasa el pie', anim:'squat', emoji:'🦵' },
          { name:'Remo con mancuerna a una mano', sets:3, reps:'12 c/lado', rest:60, muscles:'Espalda unilateral', tip:'Rodilla y mano en banco, tira del codo hacia atrás', anim:'row', emoji:'💪' },
          { name:'Press de hombro con mancuernas', sets:3, reps:'12', rest:60, muscles:'Deltoides', tip:'Sentado, empuja hacia arriba controlando bajada', anim:'press', emoji:'💫' },
          { name:'Burpees', sets:3, reps:'10', rest:60, muscles:'Full body, cardio', tip:'Ritmo que puedas mantener, aterriza suave', anim:'jump', emoji:'🏃' }
        ]},
        { day: 'Domingo', focus: 'Descanso activo', icon: '🧘', isRest: true, restTip: 'Camina 30 minutos, estira o haz yoga suave. La recuperación es parte del entrenamiento.' }
      ]
    },

    home: {
      name: 'En casa', icon: '🏠',
      weekly: [
        { day: 'Lunes', focus: 'Upper Body', icon: '💪', exercises: [
          { name:'Flexiones estándar', sets:4, reps:'15-20', rest:60, muscles:'Pecho, tríceps, hombros', tip:'Manos bajo hombros, cuerpo recto, toca el suelo con pecho', anim:'pushup', emoji:'💪' },
          { name:'Flexiones diamante', sets:3, reps:'12', rest:60, muscles:'Tríceps, pecho interior', tip:'Índices y pulgares formando diamante', anim:'pushup', emoji:'💎' },
          { name:'Flexiones en pica', sets:3, reps:'10', rest:75, muscles:'Hombros, tríceps', tip:'Caderas arriba en forma de V invertida', anim:'pushup', emoji:'🔺' },
          { name:'Dips en silla', sets:3, reps:'15', rest:60, muscles:'Tríceps, pecho inferior', tip:'Manos en borde de silla, baja doblando codos a 90°', anim:'squat', emoji:'🪑' },
          { name:'Superman', sets:3, reps:'15', rest:45, muscles:'Espalda baja, glúteos', tip:'Boca abajo, levanta brazos y piernas simultáneamente', anim:'deadlift', emoji:'🦸' }
        ]},
        { day: 'Martes', focus: 'Lower Body', icon: '🦵', exercises: [
          { name:'Sentadillas', sets:4, reps:'20', rest:60, muscles:'Cuádriceps, glúteos', tip:'Baja hasta paralelo, rodillas siguiendo pies', anim:'squat', emoji:'🏋️' },
          { name:'Zancadas alternas', sets:3, reps:'12 c/lado', rest:60, muscles:'Cuádriceps, glúteos, equilibrio', tip:'Paso grande, rodilla trasera casi toca el suelo', anim:'squat', emoji:'🚶' },
          { name:'Glute bridge', sets:4, reps:'20', rest:45, muscles:'Glúteos, isquios', tip:'Empuja con talones, aprieta glúteos arriba', anim:'deadlift', emoji:'🍑' },
          { name:'Sentadilla sumo', sets:3, reps:'15', rest:60, muscles:'Aductores, glúteos', tip:'Pies anchos, puntas hacia afuera, baja recto', anim:'squat', emoji:'🦵' },
          { name:'Elevaciones de pantorrilla de pie', sets:4, reps:'25', rest:30, muscles:'Pantorrillas', tip:'Puedes apoyarte en la pared, sube de puntillas', anim:'jump', emoji:'⬆️' }
        ]},
        { day: 'Miércoles', focus: 'Cardio + Core', icon: '🔥', exercises: [
          { name:'Jumping jacks', sets:3, reps:'40', rest:30, muscles:'Cardio, full body', tip:'Ritmo constante, aterriza suave', anim:'jump', emoji:'⭐' },
          { name:'Plancha frontal', sets:3, reps:'45 seg', rest:45, muscles:'Core completo', tip:'Cuerpo recto, no subas la cadera', anim:'plank', emoji:'🧘' },
          { name:'Crunches bicicleta', sets:3, reps:'20 c/lado', rest:45, muscles:'Oblicuos, recto abdominal', tip:'Codo al lado opuesto, giro controlado', anim:'run', emoji:'🚲' },
          { name:'Burpees', sets:3, reps:'10', rest:60, muscles:'Full body, cardio', tip:'Plancha - salto - arriba. Sin parar', anim:'jump', emoji:'🔥' },
          { name:'Plancha lateral', sets:3, reps:'30 seg', rest:30, muscles:'Oblicuos', tip:'Cadera arriba, cuerpo en línea', anim:'plank', emoji:'↔️' }
        ]},
        { day: 'Jueves', focus: 'Full Body', icon: '💥', exercises: [
          { name:'Burpees con flexión', sets:3, reps:'10', rest:75, muscles:'Full body', tip:'Añade flexión al bajar antes de saltar', anim:'jump', emoji:'🔥' },
          { name:'Sentadilla con salto', sets:3, reps:'15', rest:60, muscles:'Piernas, cardio', tip:'Baja a sentadilla, salta explosivo, aterriza suave', anim:'jump', emoji:'💥' },
          { name:'Flexiones con palmada', sets:3, reps:'8', rest:75, muscles:'Pecho, explosividad', tip:'Empuja fuerte para palmada en el aire', anim:'pushup', emoji:'👏' },
          { name:'Mountain climbers', sets:3, reps:'30 seg', rest:30, muscles:'Core, cardio', tip:'Caderas abajo, ritmo rápido', anim:'run', emoji:'⛰️' },
          { name:'Sentadillas árabes asistidas', sets:3, reps:'8 c/lado', rest:90, muscles:'Cuádriceps unilateral', tip:'Agárrate a algo para equilibrio al principio', anim:'squat', emoji:'🦵' }
        ]},
        { day: 'Viernes', focus: 'Upper Body + Core', icon: '💪', exercises: [
          { name:'Flexiones con pausa', sets:4, reps:'10', rest:75, muscles:'Pecho, fuerza', tip:'2 seg abajo, 1 seg pausa, empuja arriba', anim:'pushup', emoji:'⏸️' },
          { name:'Remo con toalla/correa', sets:3, reps:'12', rest:60, muscles:'Espalda, bíceps', tip:'Sujeta toalla en puerta, inclínate atrás y tira', anim:'row', emoji:'🏊' },
          { name:'Curl de bíceps con mochila', sets:3, reps:'15', rest:60, muscles:'Bíceps', tip:'Llena mochila con libros o botellas de agua', anim:'curl', emoji:'🎒' },
          { name:'V-ups', sets:3, reps:'12', rest:60, muscles:'Core completo', tip:'Sube piernas y torso a la vez formando V', anim:'squat', emoji:'✌️' },
          { name:'Fondos entre sillas', sets:3, reps:'12', rest:60, muscles:'Tríceps', tip:'2 sillas resistentes, baja hasta 90° en codos', anim:'squat', emoji:'🪑' }
        ]},
        { day: 'Sábado', focus: 'HIIT 20 min', icon: '🔥', exercises: [
          { name:'Jumping jacks', sets:4, reps:'30 seg', rest:15, muscles:'Cardio, full body', tip:'20 seg ON / 10 seg OFF (Tabata)', anim:'jump', emoji:'⭐' },
          { name:'Burpees', sets:4, reps:'30 seg', rest:15, muscles:'Full body', tip:'Máximos que puedas en 30 segundos', anim:'jump', emoji:'🔥' },
          { name:'Sentadillas con salto', sets:4, reps:'30 seg', rest:15, muscles:'Piernas explosivas', tip:'Salto vertical, no de lado', anim:'jump', emoji:'💥' },
          { name:'Mountain climbers rápidos', sets:4, reps:'30 seg', rest:15, muscles:'Core, cardio', tip:'Máxima velocidad manteniendo postura', anim:'run', emoji:'⛰️' },
          { name:'Flexiones rápidas', sets:4, reps:'30 seg', rest:15, muscles:'Pecho, tríceps', tip:'Ritmo rápido, no importa la profundidad', anim:'pushup', emoji:'💪' }
        ]},
        { day: 'Domingo', focus: 'Descanso activo', icon: '🧘', isRest: true, restTip: 'Estira todos los grupos musculares 30 segundos cada uno. Yoga suave o caminata.' }
      ]
    }
  },

  getDayIndex() {
    return new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  },

  getTodayWorkout(user) {
    const plan = this.WORKOUTS[user.equipment] || this.WORKOUTS.home;
    return plan.weekly[this.getDayIndex()];
  },

  getTodayMeals(user) {
    const diet = this.DIETS[user.diet] || this.DIETS.mediterranean;
    return diet.days[this.getDayIndex()];
  },

  calculateTDEE(user) {
    const w = parseFloat(user.currentWeight), h = parseFloat(user.height), a = parseInt(user.age);
    const bmr = user.gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    const mults = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 };
    const tdee = bmr * (mults[user.activity] || 1.55);
    return Math.round(tdee - 500);
  },

  getDietColor(diet) {
    return this.DIETS[diet]?.color || '#7CB518';
  },

  // ===== CORRER / ANDAR (entorno outdoor) =====
  RUN_MET: { run: 9.8, walk: 3.8 },

  // Calcula ritmo (min/km), velocidad (km/h) y calorías (MET × peso × horas)
  calcRunSession(type, km, minutes, weight) {
    km = parseFloat(km); minutes = parseFloat(minutes); weight = parseFloat(weight) || 70;
    const pace = km > 0 ? minutes / km : 0;
    const kmh = minutes > 0 ? km / (minutes / 60) : 0;
    const met = this.RUN_MET[type] || this.RUN_MET.run;
    const kcal = Math.round(met * weight * (minutes / 60));
    return { pace, kmh, kcal };
  },

  // Inicio del rango: 'day' (hoy 00:00), 'week' (lunes), 'month' (día 1)
  runRangeStart(range) {
    const now = new Date();
    if (range === 'week') {
      const idx = now.getDay() === 0 ? 6 : now.getDay() - 1;
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - idx);
    }
    if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  },

  runFilter(log, range) {
    const from = this.runRangeStart(range);
    return (log || []).filter(s => new Date(s.date) >= from);
  },

  runTotals(sessions) {
    const km = sessions.reduce((a, s) => a + (s.km || 0), 0);
    const minutes = sessions.reduce((a, s) => a + (s.minutes || 0), 0);
    const kcal = sessions.reduce((a, s) => a + (s.kcal || 0), 0);
    return { count: sessions.length, km, minutes, kcal, pace: km > 0 ? minutes / km : 0 };
  },

  // Clave del lunes de la semana de una fecha (para agrupar por semana)
  _mondayKey(d) {
    const x = new Date(d);
    const idx = x.getDay() === 0 ? 6 : x.getDay() - 1;
    return new Date(x.getFullYear(), x.getMonth(), x.getDate() - idx).toDateString();
  },

  // Récords reconstruibles SIEMPRE desde el log (defensivo)
  runRecords(log) {
    log = log || [];
    if (!log.length) return { longestKm: 0, bestPace: 0, streak: 0, bestWeekKm: 0 };
    const longestKm = Math.max(...log.map(s => s.km || 0));
    const paces = log.filter(s => (s.km || 0) >= 0.5 && s.pace > 0).map(s => s.pace);
    const bestPace = paces.length ? Math.min(...paces) : 0;
    const weeks = {};
    log.forEach(s => { const k = this._mondayKey(s.date); weeks[k] = (weeks[k] || 0) + (s.km || 0); });
    const bestWeekKm = Math.max(...Object.values(weeks));
    // Racha: días seguidos con actividad terminando hoy (o ayer si hoy aún sin sesión)
    const days = new Set(log.map(s => new Date(s.date).toDateString()));
    let streak = 0;
    const cursor = new Date();
    if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
    while (days.has(cursor.toDateString())) { streak++; cursor.setDate(cursor.getDate() - 1); }
    return { longestKm, bestPace, streak, bestWeekKm };
  }
};
