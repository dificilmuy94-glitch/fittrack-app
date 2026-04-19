export type Ingredient = {
  amount?: string;
  unit?: string;
  name: string;
};

export type MealOption = {
  label: string;
  ingredients: Ingredient[];
};

export type Meal = {
  id: string;
  name: string;
  description?: string;
  options: MealOption[];
};

export type NutritionPlan = {
  clientName: string;
  observations?: string;
  meals: Meal[];
  professional: string;
};

export const NUTRITION_PLAN: NutritionPlan = {
  clientName: 'QUIQUE 120.40',
  observations:
    'Algunas observaciones:\n- Intenta que el pan siempre sea sin gluten. Te recomendamos el Pan Trigo Sarraceno de Leon the Baker.',
  professional: 'NUTRIENS',
  meals: [
    {
      id: 'combo-tonico',
      name: 'Combo tónico',
      description:
        'Combo tónico de glucosa sanguínea\n*Mezcla todos los ingredientes con medio vaso de agua caliente',
      options: [
        {
          label: 'Preparación',
          ingredients: [
            { amount: '150', unit: 'g', name: 'Agua (Embotellada)' },
            { amount: '1', unit: 'g', name: 'Canela' },
            { name: 'Stevia - Hacendado' },
            { amount: '20', unit: 'g', name: 'Vinagre de Manzana - Ybarra' },
            { amount: '20', unit: 'g', name: 'Colágeno hidrolizado' },
          ],
        },
      ],
    },
    {
      id: 'desayuno',
      name: 'Desayuno',
      description:
        'OP. 1) TOSTADA CON HUEVO Y PAVO\nOP. 2) BOL DE QUESO FRESCO 0% CON FRUTOS ROJOS Y PLÁTANO\nOP. 3) TORTITA DE AVENA (Topping: yogur de coco con canela y frambuesas)',
      options: [
        {
          label: 'Opción 1',
          ingredients: [
            { amount: '80', unit: 'g', name: 'Pan Trigo Sarraceno - Leon the Baker' },
            { amount: '60', unit: 'g', name: 'Huevo' },
            { amount: '80', unit: 'g', name: 'Pechuga de Pavo' },
            { name: 'Tomates' },
          ],
        },
        {
          label: 'Opción 2',
          ingredients: [
            { amount: '70', unit: 'g', name: 'Queso Fresco Desnatado 0% - Hacendado' },
            { amount: '60', unit: 'g', name: 'Frutos Rojos Congelados - Hacendado' },
            { amount: '20', unit: 'g', name: 'Crema de cacahuete' },
            { amount: '30', unit: 'g', name: 'Proteína WHEY/ISO/HYDRO' },
          ],
        },
        {
          label: 'Opción 3',
          ingredients: [
            { amount: '30', unit: 'g', name: 'Harina de avena de sabores' },
            { amount: '90', unit: 'g', name: 'Clara de Huevo' },
            { amount: '20', unit: 'g', name: 'Proteína WHEY/ISO/HYDRO' },
            { amount: '100', unit: 'g', name: 'Yogur - Alpro' },
            { name: 'Canela' },
            { amount: '60', unit: 'g', name: 'Frambuesas' },
          ],
        },
      ],
    },
    {
      id: 'comida',
      name: 'Comida',
      description:
        '1) FAJITAS DE POLLO\n2) GNOCCHI CON CARNE DE POLLO PICADA\n3) CHULETA DE PAVO AL AJILLO CON PATATAS\n4) POLLO ASADO CON ARROZ Y ENSALADA\n5) ENSALADA DE GARBANZOS',
      options: [
        {
          label: 'Opción 1',
          ingredients: [
            { amount: '5', unit: 'und', name: 'Tortilla sin gluten o de maíz' },
            { amount: '180', unit: 'g', name: 'Pechuga de pollo, cruda, sin piel' },
            { name: 'Pimiento Rojo' },
            { name: 'Pimientos Verdes' },
            { name: 'Cebollas' },
            { name: 'Salsa Mejicana - Old El Paso' },
          ],
        },
        {
          label: 'Opción 2',
          ingredients: [
            { amount: '150', unit: 'g', name: 'Gnocchi de patata' },
            { name: 'Espárragos' },
            { name: 'Crema de verduras casera' },
            { amount: '10', unit: 'g', name: 'Aceite de oliva virgen extra' },
            { amount: '1', unit: 'cápsula', name: 'Vitamina D3+K2' },
          ],
        },
        {
          label: 'Opción 3',
          ingredients: [
            { amount: '180', unit: 'g', name: 'Chuleta de Pavo al Ajillo - Hacendado' },
            { amount: '250', unit: 'g', name: 'Patatas Cocidas' },
            { name: 'Sofrito de verduras' },
            { amount: '10', unit: 'g', name: 'Aceite de Oliva Extra Virgen' },
            { amount: '1', unit: 'cápsula', name: 'Vitamina D3+K2' },
          ],
        },
        {
          label: 'Opción 4',
          ingredients: [
            { amount: '160', unit: 'g', name: 'Pollo Asado' },
            { name: 'Cebollas' },
            { name: 'Tomates' },
            { amount: '5', unit: 'g', name: 'Aceite de oliva virgen extra' },
            { amount: '50', unit: 'g', name: 'Arroz Blanco Crudo' },
            { name: 'Ensalada Mixta' },
            { amount: '1', unit: 'cápsula', name: 'Vitamina D3+K2' },
          ],
        },
        {
          label: 'Opción 5',
          ingredients: [
            { amount: '5', unit: 'g', name: 'Aceite de Oliva Extra Virgen' },
            { amount: '1', unit: 'cápsula', name: 'Vitamina D3+K2' },
            { amount: '120', unit: 'g', name: 'Garbanzos Cocidos' },
            { name: 'Pepino' },
            { name: 'Pimientos Verdes' },
            { name: 'Pimiento Rojo' },
          ],
        },
      ],
    },
    {
      id: 'snack',
      name: 'Snack',
      description: 'OPCIONAL *Tómalo solo si tienes hambre',
      options: [
        {
          label: 'Opción 1',
          ingredients: [
            { amount: '20', unit: 'g', name: 'Pan - Wasa' },
            { amount: '60', unit: 'g', name: 'Pechuga de Pavo' },
          ],
        },
        {
          label: 'Opción 2',
          ingredients: [
            { amount: '100', unit: 'g', name: 'Frambuesas' },
            { amount: '100', unit: 'g', name: 'Gelatina + Proteínas - Hacendado' },
          ],
        },
        {
          label: 'Opción 3',
          ingredients: [
            { amount: '125', unit: 'g', name: 'Yogur Natural sin Lactosa 0% - Hacendado' },
          ],
        },
      ],
    },
    {
      id: 'entreno',
      name: 'Entreno',
      description: 'ENTRENO\n- Pre-entreno',
      options: [
        {
          label: 'Pre-entreno',
          ingredients: [
            { amount: '1', unit: 'cazo', name: 'Pre entreno' },
            { amount: '20', unit: 'g', name: 'EAA + Hydration' },
            { amount: '40', unit: 'g', name: 'Proteína WHEY/ISO/HYDRO' },
            { amount: '150', unit: 'g', name: 'Bebida vegetal 0%' },
          ],
        },
      ],
    },
    {
      id: 'cena',
      name: 'Cena',
      description:
        'OPCIÓN 1: ATÚN A LA PLANCHA CON SALSA DE SOJA Y ENSALADA\nOPCIÓN 2: SOLOMILLO DE PAVO CON PISTO DE VERDURAS\nOPCIÓN 3: TORTILLA DE ATÚN CON ALCACHOFAS (*puedes ir cambiando las verduras o sustituir el atún por salmón al natural, 60g de pavo, 50g de jamón serrano...)\nOPCIÓN 4: PULPO "A LA GALLEGA" CON CALABACÍN (en vez de patata, corta el calabacín en láminas, añade el pulpo con pimentón encima y calienta al microondas)\nOPCIÓN 5: MIGAS DE COLIFLOR CON LOMO\n*LOS SÁBADOS HACES CENA LIBRE',
      options: [
        {
          label: 'Opción 1',
          ingredients: [
            { amount: '150', unit: 'g', name: 'Pescado azul (salmón, atún, sardinas, salmonetes...)' },
            { name: 'Ensalada de Lechuga y Tomate' },
            { amount: '5', unit: 'g', name: 'Aceite de Oliva' },
            { amount: '1', unit: 'cápsula', name: 'Magnesio' },
            { amount: '1', unit: 'g', name: 'Omega 3' },
          ],
        },
        {
          label: 'Opción 2',
          ingredients: [
            { amount: '180', unit: 'g', name: 'Solomillo de Pavo - Hacendado' },
            { name: 'Pisto' },
            { amount: '10', unit: 'g', name: 'Aceite de Oliva' },
            { amount: '1', unit: 'cápsula', name: 'Magnesio' },
            { amount: '1', unit: 'capsula', name: 'Omega 3' },
          ],
        },
        {
          label: 'Opción 3',
          ingredients: [
            { amount: '1', unit: 'und', name: 'Huevo' },
            { amount: '120', unit: 'g', name: 'Clara de Huevo' },
            { amount: '60', unit: 'g', name: 'Atún al natural' },
            { name: 'Corazones de Alcachofa - Hacendado' },
            { amount: '5', unit: 'g', name: 'Aceite de Oliva' },
            { amount: '1', unit: 'cápsula', name: 'Magnesio' },
            { amount: '1', unit: 'capsula', name: 'Omega 3' },
          ],
        },
        {
          label: 'Opción 4',
          ingredients: [
            { amount: '190', unit: 'g', name: 'Pulpo' },
            { name: 'Calabacín' },
            { name: 'Pimentón' },
            { amount: '5', unit: 'g', name: 'Aceite de Oliva' },
            { amount: '1', unit: 'cápsula', name: 'Magnesio' },
            { amount: '1', unit: 'capsula', name: 'Omega 3' },
          ],
        },
        {
          label: 'Opción 5',
          ingredients: [
            { name: 'Migas de Coliflor - Hacendado' },
            { amount: '180', unit: 'g', name: 'Lomo de Cerdo' },
            { amount: '5', unit: 'g', name: 'Aceite de Oliva' },
            { amount: '1', unit: 'cápsula', name: 'Magnesio' },
            { amount: '1', unit: 'capsula', name: 'Omega 3' },
          ],
        },
      ],
    },
    {
      id: 'pre-cama',
      name: 'Pre-cama',
      description: '',
      options: [
        {
          label: 'Opción 1',
          ingredients: [
            { amount: '125', unit: 'g', name: 'Yogur Natural sin Lactosa 0% - Hacendado' },
            { amount: '20', unit: 'g', name: 'Caseína' },
            { amount: '50', unit: 'g', name: 'Frambuesas' },
          ],
        },
        {
          label: 'Opción 2',
          ingredients: [
            { amount: '100', unit: 'g', name: 'Gelatina + Proteínas - Hacendado' },
            { amount: '120', unit: 'g', name: 'Fresas' },
            { amount: '20', unit: 'g', name: 'Chocolate Negro 85% - Hacendado' },
          ],
        },
      ],
    },
  ],
};
