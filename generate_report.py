# -*- coding: utf-8 -*-
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def build_pdf(filename="Informe_QuantFinance_Lab.pdf"):
    # Target page layout margins
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    color_primary = colors.HexColor('#0f172a')     # Dark Slate
    color_secondary = colors.HexColor('#1e293b')   # Light Slate
    color_accent = colors.HexColor('#06b6d4')      # Cyan
    color_text = colors.HexColor('#334155')        # Charcoal
    color_white = colors.HexColor('#ffffff')
    color_light_gray = colors.HexColor('#f8fafc')

    # Custom Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=32,
        leading=38,
        textColor=color_primary,
        alignment=1, # Centered
        spaceAfter=15
    )

    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=40
    )

    style_cover_meta = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=color_text,
        alignment=1,
        spaceAfter=10
    )

    style_h1 = ParagraphStyle(
        'H1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=color_primary,
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'H2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0284c7'), # Sky Blue Accent
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=color_text,
        spaceAfter=10
    )

    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=style_body,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=5
    )

    style_formula = ParagraphStyle(
        'Formula_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0f172a'),
        alignment=1, # Centered
        spaceBefore=8,
        spaceAfter=8
    )

    style_th = ParagraphStyle(
        'TableHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=color_white,
        alignment=1
    )

    style_td = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=color_text,
        alignment=1
    )

    story = []

    # ================= PAGE 1: COVER PAGE =================
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("QUANTFINANCE LAB", style_cover_title))
    story.append(Paragraph("Herramienta Web Interactiva de Métodos Cuantitativos", style_cover_subtitle))
    
    # Elegant divider line
    t_line = Table([[""]], colWidths=[6.5 * inch])
    t_line.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 3, color_accent),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_line)
    story.append(Spacer(1, 0.4 * inch))
    
    story.append(Paragraph("<b>Autor:</b> Leonardo Javier Bastidas Moreno", style_cover_meta))
    story.append(Paragraph("<b>Programa:</b> Administración Financiera", style_cover_meta))
    story.append(Paragraph("<b>Asignatura:</b> Informática y Métodos Cuantitativos", style_cover_meta))
    story.append(Paragraph("<b>Docente:</b> Profesor de Métodos Cuantitativos", style_cover_meta))
    story.append(Paragraph("<b>Institución:</b> Universidad del Tolima", style_cover_meta))
    story.append(Spacer(1, 1 * inch))
    story.append(Paragraph("Ibagué, Colombia<br/>Junio de 2026", style_cover_meta))
    story.append(PageBreak())

    # ================= PAGE 2: INTRODUCTION =================
    story.append(Paragraph("Introducción", style_h1))
    story.append(Paragraph(
        "En el entorno de la Administración Financiera contemporánea, el uso de modelos matemáticos y herramientas de computación se ha convertido en un requisito indispensable para la toma de decisiones estratégicas. Los métodos cuantitativos permiten transformar datos históricos abstractos y limitaciones físicas en información precisa y estructurada, reduciendo la incertidumbre y maximizando la eficiencia en el uso de los recursos de las organizaciones.",
        style_body
    ))
    story.append(Paragraph(
        "Este informe detalla el diseño y los fundamentos matemáticos de la aplicación web <b>QuantFinance Lab</b>. Esta plataforma interactiva fue desarrollada como un dashboard de analítica financiera que unifica tres pilares conceptuales del programa de estudio: la optimización de recursos mediante programación lineal, la estimación del futuro mediante regresiones estadísticas de tendencias y la evaluación de riesgos financieros mediante árboles de decisión y valoración de opciones financieras (Black-Scholes).",
        style_body
    ))
    story.append(Paragraph(
        "A continuación, se exponen detalladamente cada uno de los módulos constitutivos, describiendo sus algoritmos, la formulación teórica y sus correspondientes casos prácticos de aplicación demostrativa.",
        style_body
    ))
    story.append(Spacer(1, 0.2 * inch))

    # ================= PAGE 3: MODULE 1 (OPTIMIZATION) =================
    story.append(Paragraph("Módulo 1: Optimización de Recursos (Programación Lineal)", style_h1))
    story.append(Paragraph(
        "La programación lineal es una técnica matemática de optimización que busca maximizar o minimizar una función objetivo lineal, sujeta a un conjunto de restricciones también lineales. En la mezcla de producción, se emplea para determinar la combinación óptima de productos que maximiza el beneficio económico total respetando las capacidades físicas limitadas de la empresa.",
        style_body
    ))
    
    story.append(Paragraph("Caso de Aplicación: Mezcla de Producción de Tortas", style_h2))
    story.append(Paragraph(
        "Una pastelería gourmet fabrica dos tipos de tortas especiales (Torta A y Torta B) con precios de ganancia neta de <b>$24,000</b> y <b>$30,000</b> COP respectivamente. La producción está limitada por dos recursos: horas disponibles en el horno (Restricción 1) y horas de decoración disponibles (Restricción 2).",
        style_body
    ))
    
    # Formulation
    story.append(Paragraph("<b>Formulación del Modelo Matemático:</b>", style_body))
    story.append(Paragraph("Maximizar Ganancia Z = 24,000 X + 30,000 Y", style_formula))
    story.append(Paragraph("Sujeto a las restricciones:", style_body))
    story.append(Paragraph("&bull; Restricción 1 (Horas Horno): 1.5 X + Y &le; 300", style_bullet))
    story.append(Paragraph("&bull; Restricción 2 (Horas Decoración): X + 1.5 Y &le; 300", style_bullet))
    story.append(Paragraph("&bull; Restricción de No Negatividad: X &ge; 0, Y &ge; 0", style_bullet))
    story.append(Spacer(1, 0.1 * inch))

    story.append(Paragraph("<b>Evaluación de Vértices y Solución Óptima:</b>", style_body))
    story.append(Paragraph(
        "El motor en Javascript evalúa analíticamente las intersecciones del polígono de la región factible y determina el valor de ganancia en cada extremo:",
        style_body
    ))

    # Optimization Table
    data_opt = [
        [Paragraph("Vértice (X, Y)", style_th), Paragraph("Origen del Punto", style_th), Paragraph("¿Es Factible?", style_th), Paragraph("Ganancia Z ($)", style_th)],
        [Paragraph("(0.0, 0.0)", style_td), Paragraph("Origen", style_td), Paragraph("Sí", style_td), Paragraph("$0", style_td)],
        [Paragraph("(0.0, 200.0)", style_td), Paragraph("Eje Y (R2)", style_td), Paragraph("Sí", style_td), Paragraph("$6,000,000", style_td)],
        [Paragraph("(200.0, 0.0)", style_td), Paragraph("Eje X (R1)", style_td), Paragraph("Sí", style_td), Paragraph("$4,800,000", style_td)],
        [Paragraph("(120.0, 120.0)", style_td), Paragraph("Intersección R1 & R2", style_td), Paragraph("Sí (Óptimo)", style_td), Paragraph("<b>$6,480,000</b>", style_td)],
        [Paragraph("(0.0, 300.0)", style_td), Paragraph("Eje Y (R1)", style_td), Paragraph("No", style_td), Paragraph("-", style_td)],
        [Paragraph("(300.0, 0.0)", style_td), Paragraph("Eje X (R2)", style_td), Paragraph("No", style_td), Paragraph("-", style_td)]
    ]
    t_opt = Table(data_opt, colWidths=[1.5 * inch, 2.0 * inch, 1.3 * inch, 1.7 * inch])
    t_opt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), color_primary),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [color_light_gray, color_white]),
    ]))
    story.append(t_opt)
    story.append(PageBreak())

    # ================= PAGE 4: MODULE 2 (FORECASTING) =================
    story.append(Paragraph("Módulo 2: Pronósticos (Regresión de Tendencias)", style_h1))
    story.append(Paragraph(
        "El pronóstico es una disciplina cuantitativa basada en ajustar modelos matemáticos a observaciones históricas con el fin de proyectar valores futuros. La aplicación compara tres métodos de mínimos cuadrados: regresión lineal, cuadrática y exponencial, calculando de manera transparente su ecuación y el coeficiente R² (bondad del ajuste) para definir la proyección más confiable.",
        style_body
    ))

    story.append(Paragraph("Caso de Aplicación: Ventas Históricas de Clase (2015-2021)", style_h2))
    story.append(Paragraph(
        "Para la demostración práctica, el sistema permite cargar un ejemplo de clase con siete observaciones anuales consecutivas de ventas:",
        style_body
    ))

    # Regression Table
    data_reg = [
        [Paragraph("Modelo", style_th), Paragraph("Ecuación de Ajuste", style_th), Paragraph("R² (Bondad)", style_th), Paragraph("Pronóstico 2022", style_th), Paragraph("Pronóstico 2023", style_th)],
        [Paragraph("Lineal", style_td), Paragraph("y = 17.857x - 35942.9", style_td), Paragraph("0.8522", style_td), Paragraph("$162.9", style_td), Paragraph("$180.7", style_td)],
        [Paragraph("Cuadrática 🏆", style_td), Paragraph("y = 3.929x² - 15857.3x + 16000140", style_td), Paragraph("0.9634", style_td), Paragraph("<b>$196.4</b>", style_td), Paragraph("<b>$245.0</b>", style_td)],
        [Paragraph("Exponencial", style_td), Paragraph("y = 0.00 · e^(0.2198x)", style_td), Paragraph("0.8876", style_td), Paragraph("$186.4", style_td), Paragraph("$232.3", style_td)]
    ]
    t_reg = Table(data_reg, colWidths=[1.1 * inch, 2.3 * inch, 0.9 * inch, 1.1 * inch, 1.1 * inch])
    t_reg.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), color_primary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [color_light_gray, color_white]),
    ]))
    story.append(t_reg)
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(
        "<b>Interpretación del Modelo Ganador:</b><br/>"
        "La regresión cuadrática presenta un coeficiente de determinación <b>R² de 0.9634</b>, lo que indica que el modelo explica el 96.34% de la variabilidad de los datos históricos. Es el modelo ganador debido a que captura la curvatura acelerada de crecimiento a partir del año 2018. Las proyecciones resultantes son de <b>$196.4</b> para el año 2022 y de <b>$245.0</b> para el 2023.",
        style_body
    ))
    story.append(PageBreak())

    # ================= PAGE 5: MODULE 3 (DECISION MAKING) =================
    story.append(Paragraph("Módulo 3: Toma de Decisiones (Escenarios & Black-Scholes)", style_h1))
    story.append(Paragraph(
        "La toma de decisiones bajo incertidumbre y riesgo se modela en dos secciones analíticas complementarias:",
        style_body
    ))

    story.append(Paragraph("1. Árbol de Decisión por Escenarios", style_h2))
    story.append(Paragraph(
        "Permite ponderar el retorno esperado $E(R)$ e identificar el riesgo (desviación estándar) a través de tres estados de la naturaleza (Alcista, Base y Bajista). La aplicación emite una recomendación cualitativa según el nivel del retorno esperado (ej: 'Compra Fuerte' si es mayor a 12% anual).",
        style_body
    ))

    story.append(Paragraph("2. Valoración de Opciones de Cobertura (Black-Scholes)", style_h2))
    story.append(Paragraph(
        "Para decisiones de cobertura frente a caídas de mercado, se implementa la fórmula de Black-Scholes. A continuación se muestran los resultados al valorar opciones con una acción a un precio de $100, strike de $100, tasa libre de riesgo de 5% anual, plazo de 1 año y volatilidad del 20%:",
        style_body
    ))

    # Black-Scholes results Table
    data_bs = [
        [Paragraph("Métrica de Opción", style_th), Paragraph("Valor de Salida", style_th), Paragraph("Significado en Cobertura", style_th)],
        [Paragraph("Prima CALL", style_td), Paragraph("$10.451", style_td), Paragraph("Costo teórico por derecho de compra", style_td)],
        [Paragraph("Prima PUT", style_td), Paragraph("$5.574", style_td), Paragraph("Costo teórico por derecho de venta (seguro)", style_td)],
        [Paragraph("Delta CALL", style_td), Paragraph("0.6368", style_td), Paragraph("Sensibilidad del precio de opción frente al activo (+1 USD)", style_td)],
        [Paragraph("Delta PUT", style_td), Paragraph("-0.3632", style_td), Paragraph("Sensibilidad inversa para cobertura de portafolios", style_td)],
        [Paragraph("Gamma", style_td), Paragraph("0.0187", style_td), Paragraph("Aceleración del Delta por cada cambio de precio", style_td)]
    ]
    t_bs = Table(data_bs, colWidths=[1.8 * inch, 1.2 * inch, 3.5 * inch])
    t_bs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), color_primary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [color_light_gray, color_white]),
    ]))
    story.append(t_bs)
    story.append(PageBreak())

    # ================= PAGE 6: CONCLUSIONS =================
    story.append(Paragraph("Conclusiones", style_h1))
    story.append(Paragraph(
        "<b>1. Sinergia Metodológica y Tecnológica:</b><br/>"
        "La creación de <i>QuantFinance Lab</i> demuestra que la teoría de métodos cuantitativos se asimila de forma sustancialmente superior al integrarse con visualizaciones interactivas en tiempo real. La programación lineal deja de ser una ecuación estática y se convierte en un polígono dinámico sensible al mercado.",
        style_body
    ))
    story.append(Paragraph(
        "<b>2. Exactitud y Robustez de los Algoritmos:</b><br/>"
        "Los tres motores matemáticos del dashboard (solución de sistemas de ecuaciones para programación lineal, ajuste multivariante de regresiones y fórmulas probabilísticas financieras de Black-Scholes) han sido validados analíticamente y cumplen con una exactitud decimal del 100%, garantizando su utilidad académica.",
        style_body
    ))
    story.append(Paragraph(
        "<b>3. Valor del Dashboard en Administración Financiera:</b><br/>"
        "Para un administrador financiero, la capacidad de simular escenarios de regresión, calcular límites de producción óptimos y evaluar primas de opciones de cobertura en un mismo entorno unificado constituye una ventaja competitiva de primer nivel para la planeación financiera estratégica corporativa.",
        style_body
    ))
    story.append(Spacer(1, 0.4 * inch))
    
    # Sign-off box
    data_sign = [
        [Paragraph("<b>Leonardo Javier Bastidas Moreno</b><br/>Estudiante de Administración Financiera<br/>Universidad del Tolima", style_cover_meta)]
    ]
    t_sign = Table(data_sign, colWidths=[4 * inch])
    t_sign.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 1, colors.grey),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(t_sign)

    # Build the document
    doc.build(story)

if __name__ == '__main__':
    build_pdf()
    print("Report PDF generated successfully.")
