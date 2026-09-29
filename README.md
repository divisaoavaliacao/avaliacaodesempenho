# Avaliação de Desempenho — UFFS

Versão atualizada a partir da planilha de referência `Formulários de Avaliação (autoavaliação_chefia).xlsx`.

## Fórmulas oficiais reproduzidas

### Médias das dimensões

A planilha calcula a média simples dos itens:

- Conhecimentos: soma das 4 notas / 4
- Habilidades: soma das 5 notas / 5
- Metas: soma das 3 notas / 3
- Comportamentos/Atitudes: soma das 12 notas / 12
- Mediadores: soma das 4 notas / 4, somente para autoavaliação e sem interferência na nota.

### Pesos

Cada uma das quatro dimensões principais representa **25% da nota final**.

Para Conhecimentos, Habilidades e Metas:
- Autoavaliação: 40%
- Avaliação da chefia: 60%

Para Comportamentos e Atitudes:
- Autoavaliação: 50%
- Avaliação da chefia: 50%

### Limites

- Autoavaliação: máximo **4,25**
- Avaliação da chefia: máximo **5,75**
- Nota final consolidada: máximo **10,00**

Exemplo com nota 10 em todas as dimensões:
- Auto: 1,00 + 1,00 + 1,00 + 1,25 = **4,25**
- Chefia: 1,50 + 1,50 + 1,50 + 1,25 = **5,75**
- Final: **10,00**

## O que foi corrigido

A versão anterior tratava a pontuação como se cada dimensão tivesse um peso fixo próprio e apresentava máximo incorreto. O código agora reproduz a estrutura da aba `Pesos_Nota Avaliações`.

A aplicação:
- calcula as médias simples;
- calcula a contribuição da modalidade selecionada;
- diferencia automaticamente autoavaliação e chefia;
- mantém os mediadores somente na autoavaliação;
- preenche o PDF com médias e pontuações;
- gera documento para assinatura;
- oferece impressão como alternativa ao PDF via biblioteca externa.

## Estrutura

- `index.html`
- `style.css`
- `script.js`
- `logo-uffs.png`

## GitHub Pages

Envie os arquivos para um repositório e habilite GitHub Pages em `Settings > Pages`, usando a branch principal e `/root`.

## Observação

O formulário calcula a modalidade selecionada. A **nota final consolidada** depende das duas avaliações, conforme a aba `Pesos_Nota Avaliações` da planilha. Portanto, a soma final de 10,00 só pode ser formada quando houver a pontuação da autoavaliação e da chefia.

### Mediadores de Desempenho

Os Mediadores de Desempenho são exibidos **somente quando a modalidade selecionada é Autoavaliação**. Ao selecionar **Avaliação da Chefia Imediata**, o bloco desaparece da tela, fica desabilitado e não participa da validação nem dos cálculos.

## Geração do PDF — versão 4

O botão **Gerar PDF para assinatura** tenta usar `html2pdf.js`. Se a biblioteca não estiver disponível — por exemplo, quando o HTML é aberto sem internet — o sistema automaticamente abre a versão de impressão do documento. Nessa tela, selecione **Salvar como PDF**.

Assim, a indisponibilidade da CDN não impede a emissão do documento.

