# Caderneta Infantil (Kids Vaccine) - Cyrrus Saúde Digital

Este é um projeto desenvolvido para um desafio técnico voltado à criação de uma plataforma digital para acompanhamento da saúde infantil, com foco especial no gerenciamento do histórico e jornada de vacinação das crianças, substituindo parte da dependência da caderneta de papel física.

A aplicação foi construída utilizando **Ionic Framework com Angular** (Standalone Components) e estilizada com **Tailwind CSS v4** + **PostCSS**, seguindo à risca as regras de negócio, paleta de cores obrigatória e os cenários de uso propostos.

---

## 📸 Demonstração Visual (Screenshots)

Aqui estão representadas as principais telas da aplicação:

### 1. Painel Principal (Dashboard)
*Visualização geral da situação vacinal da criança ativa, métricas e alertas imediatos de atraso.*
![Painel Principal](https://placehold.co/800x450/ABC270/473C33?text=Painel+Principal+-+Dashboard)

### 2. Caderneta de Vacinação Completa (Linha do Tempo)
*Listagem de todas as vacinas do PNI com filtros rápidos por status (Todas, Aplicadas, Atrasadas e Agendadas).*
![Caderneta Completa](https://placehold.co/800x450/FEC868/473C33?text=Caderneta+Completa+-+Timeline)

### 3. Campanhas Ativas e Matching de Idade
*Campanhas recomendadas com detecção inteligente com base na idade atual do perfil selecionado.*
![Campanhas de Vacinação](https://placehold.co/800x450/FDA769/473C33?text=Campanhas+Ativas)

### 4. Gestão Multicrianças (Perfis Familiares)
*Gestão de múltiplos dependentes com dados físicos customizados e histórico vacinal totalmente isolado.*
![Gestão Multicrianças](https://placehold.co/800x450/FBF9F6/473C33?text=Gest%C3%A3o+de+Perfis+Infantis)

---

## 🎨 Design System & Identidade Visual

Conforme especificado nos requisitos, a aplicação adota obrigatoriamente a paleta de cores definida para a identidade visual do projeto:

| Cor | Código Hexadecimal | Aplicação no Sistema |
| --- | --- | --- |
| **Verde** | `#ABC270` | Doses aplicadas, botões de ação positiva, progresso vacinal completo. |
| **Amarelo** | `#FEC868` | Campanhas ativas recomendadas e destaques. |
| **Laranja** | `#FDA769` | Vacinas agendadas (próximas doses) e alertas médios. |
| **Escuro** | `#473C33` | Textos principais, títulos, contrastes fortes e estrutura de menu. |

*   **Tipografia:** Utiliza as fontes do Google Fonts **Inter** (para textos legíveis e dados técnicos) e **Fredoka** (para títulos amigáveis e infantis).
*   **Responsividade:** Interface 100% responsiva (Mobile-First adaptado). Em dispositivos móveis e tablets, a navegação se consolida em uma barra ergonômica inferior. Em telas desktop, exibe-se um menu superior limpo com grids de informações laterais de campanhas.

---

## 🚀 Arquitetura e Estrutura do Código

A aplicação utiliza as melhores e mais modernas práticas do ecossistema Angular:

1.  **Reatividade com Angular Signals:**
    *   Todo o estado da aplicação (criança ativa, lista de registros de vacina, filtros de pesquisa) é controlado de forma reativa através de `signal` e `computed`.
    *   Não há necessidade de gerenciadores de estado pesados externos, garantindo renderizações focadas e excelente performance no dispositivo móvel.
2.  **Serviço Centralizado (Singleton):**
    *   [VaccineService](file:///home/alan/workspace/vacina/kids-vaccine/src/app/core/services/vaccine.service.ts) gerencia as operações de CRUD infantil, as regras de negócio de datas e cálculo de doses atrasadas, e persiste os registros localmente (extensível para Firestore/Firebase).
3.  **Standalone Components & Clean Routes:**
    *   Módulos clássicos foram removidos em favor de componentes independentes e carregamento sob demanda (*lazy loading*), reduzindo o tamanho inicial do bundle JavaScript.

---

## 🛠️ Tecnologias Utilizadas

*   **Framework Core:** [Ionic Framework 8 (com Angular 20+)](https://ionicframework.com/)
*   **Engine Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Processador CSS:** PostCSS (com `@tailwindcss/postcss`)
*   **Ícones:** [Angular Material Icons](https://fonts.google.com/icons)
*   **Gerenciador de Dependências:** NPM

---

## 🎯 Mapeamento dos Cenários do Desafio

*   **Cenário 1 (Vacinas Realizadas x Atenção):** A barra de progresso circular exibe a porcentagem exata de doses concluídas da criança selecionada. Próximas doses aparecem no painel principal listadas cronologicamente por idade.
*   **Cenário 2 (Vacina Atrasada / Pendência Urgente):** O app compara a data atual com a idade da criança. Se o tempo da dose expirou e a mesma não foi assinada, ela entra na lista de destaque de alertas urgentes no Dashboard.
*   **Cenário 3 (Campanhas Recomendadas):** O app analisa a data de nascimento do perfil ativo e cruza com a faixa etária das campanhas em vigor, adicionando a tag *"Recomendada para [Nome]"* nas campanhas ativas.
*   **Cenário 4 (Multicrianças sem confusão):** É possível cadastrar múltiplos filhos (como os perfis de simulação inclusos: Sofia - 2 meses, Arthur - 15 meses e Gabriel - 4 anos e meio). A troca de perfil atualiza instantaneamente a caderneta e os alertas de forma isolada.

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
*   Node.js (LTS recomendado)
*   NPM

### Passo a Passo

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento local:
   ```bash
   npm start
   ```

3. Abra o navegador em `http://localhost:4200` para interagir com o applet.

4. Para gerar a build de produção:
   ```bash
   npm run build
   ```