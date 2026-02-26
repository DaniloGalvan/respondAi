export interface Question {
  id: number
  statement: string
  alternatives: string[]
  correctIndex: number
  explanation: string
}

export const MOCK_QUIZ: Question[] = [
  {
    id: 1,
    statement: "Qual foi o principal motivo que levou Portugal a iniciar as Grandes Navegacoes no seculo XV?",
    alternatives: [
      "A busca por novas rotas comerciais para as Indias",
      "A necessidade de fugir de guerras na Europa",
      "O desejo de espalhar o idioma portugues pelo mundo",
      "A vontade de conquistar territorios na America do Norte",
    ],
    correctIndex: 0,
    explanation:
      "Portugal buscava novas rotas comerciais para as Indias, pois o comercio de especiarias era extremamente lucrativo e os caminhos terrestres estavam dominados por intermediarios.",
  },
  {
    id: 2,
    statement: "Qual e a formula para calcular a area de um triangulo?",
    alternatives: [
      "A = lado x lado",
      "A = (base x altura) / 2",
      "A = 2 x pi x raio",
      "A = base x altura",
    ],
    correctIndex: 1,
    explanation:
      "A area de um triangulo e calculada multiplicando a base pela altura e dividindo o resultado por 2: A = (b x h) / 2.",
  },
  {
    id: 3,
    statement: "Qual e o maior planeta do Sistema Solar?",
    alternatives: ["Saturno", "Terra", "Jupiter", "Netuno"],
    correctIndex: 2,
    explanation:
      "Jupiter e o maior planeta do Sistema Solar, com um diametro de aproximadamente 139.820 km, sendo mais de 11 vezes maior que a Terra.",
  },
  {
    id: 4,
    statement: "Em que ano foi proclamada a Republica do Brasil?",
    alternatives: ["1822", "1889", "1500", "1930"],
    correctIndex: 1,
    explanation:
      "A Republica do Brasil foi proclamada em 15 de novembro de 1889, pelo Marechal Deodoro da Fonseca, encerrando o periodo do Imperio.",
  },
  {
    id: 5,
    statement: "Qual e a funcao das mitocondrias nas celulas?",
    alternatives: [
      "Armazenar informacao genetica",
      "Produzir energia (ATP) para a celula",
      "Realizar a fotossintese",
      "Controlar a entrada e saida de substancias",
    ],
    correctIndex: 1,
    explanation:
      "As mitocondrias sao responsaveis pela respiracao celular, processo que converte glicose e oxigenio em ATP (energia) para as funcoes da celula.",
  },
  {
    id: 6,
    statement: "Qual bioma brasileiro e considerado o mais biodiverso do planeta?",
    alternatives: ["Cerrado", "Caatinga", "Amazonia", "Mata Atlantica"],
    correctIndex: 2,
    explanation:
      "A Floresta Amazonica e o bioma mais biodiverso do planeta, abrigando cerca de 10% de todas as especies conhecidas no mundo.",
  },
  {
    id: 7,
    statement: "Quem escreveu a obra 'Dom Casmurro'?",
    alternatives: [
      "Jose de Alencar",
      "Machado de Assis",
      "Clarice Lispector",
      "Graciliano Ramos",
    ],
    correctIndex: 1,
    explanation:
      "Machado de Assis escreveu 'Dom Casmurro', publicado em 1899, uma das obras mais importantes da literatura brasileira.",
  },
  {
    id: 8,
    statement: "Qual e o resultado da expressao 3^2 + 4^2?",
    alternatives: ["7", "25", "49", "12"],
    correctIndex: 1,
    explanation:
      "3 ao quadrado e 9, e 4 ao quadrado e 16. A soma 9 + 16 = 25. Esse e tambem um exemplo do Teorema de Pitagoras (3, 4, 5).",
  },
  {
    id: 9,
    statement: "Qual processo e responsavel pela transformacao de agua liquida em vapor?",
    alternatives: ["Condensacao", "Solidificacao", "Evaporacao", "Fusao"],
    correctIndex: 2,
    explanation:
      "A evaporacao e o processo no qual a agua no estado liquido se transforma em vapor d'agua (estado gasoso) ao receber calor.",
  },
  {
    id: 10,
    statement: "Qual era a principal atividade economica no Brasil Colonial durante o seculo XVII?",
    alternatives: [
      "Mineracao de ouro",
      "Producao de acucar",
      "Extracao de pau-brasil",
      "Cultivo de cafe",
    ],
    correctIndex: 1,
    explanation:
      "No seculo XVII, a producao de acucar nos engenhos do Nordeste era a principal atividade economica do Brasil Colonial, baseada no trabalho escravo.",
  },
]
