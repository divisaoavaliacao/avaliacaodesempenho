JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('evalForm');
    const radiosModalidade = document.querySelectorAll('input[name="modalidade"]');
    const blockMediadores = document.getElementById('blockMediadores');
    const rowPrintMediadores = document.getElementById('rowPrintMediadores');
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');

    // Configura o step = 1 e os limites de 0 a 10 em todos os campos de nota
    const scoreInputs = document.querySelectorAll('.score-input');
    scoreInputs.forEach(input => {
        input.setAttribute('type', 'number');
        input.setAttribute('min', '0');
        input.setAttribute('max', '10');
        input.setAttribute('step', '1');
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('pattern', '[0-9]*');

        // Bloqueia teclas de ponto, vírgula, hífen e notação científica (e/E)
        input.addEventListener('keydown', (e) => {
            if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });

        // Higieniza caso o usuário cole ou tente digitar valores decimais/fora do limite
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '');

            if (input.value !== '') {
                let val = parseInt(input.value, 10);
                if (val > 10) input.value = 10;
                if (val < 0) input.value = 0;
            }
            calculateScores();
        });
    });

    function updateModalidadeUI() {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';
        if (isAuto) {
            if (blockMediadores) blockMediadores.style.display = 'block';
            if (rowPrintMediadores) rowPrintMediadores.style.display = 'table-row';
            const lblMax = document.getElementById('lblScoreMax');
            if (lblMax) lblMax.innerText = '(Máximo: 4.25)';
        } else {
            if (blockMediadores) blockMediadores.style.display = 'none';
            if (rowPrintMediadores) rowPrintMediadores.style.display = 'none';
            const lblMax = document.getElementById('lblScoreMax');
            if (lblMax) lblMax.innerText = '(Máximo: 5.75)';
        }
        calculateScores();
    }

    radiosModalidade.forEach(radio => radio.addEventListener('change', updateModalidadeUI));

    function getAverage(className) {
        const inputs = Array.from(document.querySelectorAll(`.${className}`));
        const validInputs = inputs.filter(i => i.value !== '' && !isNaN(parseFloat(i.value)));
        if (validInputs.length === 0) return 0;
        const sum = validInputs.reduce((acc, curr) => acc + parseFloat(curr.value), 0);
        return sum / validInputs.length;
    }

    function calculateScores() {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';

        const avgConhecimentos = getAverage('input-conhecimentos');
        const avgHabilidades = getAverage('input-habilidades');
        const avgMetas = getAverage('input-metas');
        const avgComportamentos = getAverage('input-comportamentos');

        const factorConhecimentos = isAuto ? 0.10 : 0.15;
        const factorHabilidades = isAuto ? 0.10 : 0.15;
        const factorMetas = isAuto ? 0.10 : 0.15;
        const factorComportamentos = 0.125;

        // Cálculo dos Pontos
        const pontuacaoConhecimentos = avgConhecimentos * factorConhecimentos;
        const pontuacaoHabilidades = avgHabilidades * factorHabilidades;
        const pontuacaoMetas = avgMetas * factorMetas;
        const pontuacaoComportamentos = avgComportamentos * factorComportamentos;

        const totalPontuacao = pontuacaoConhecimentos + pontuacaoHabilidades + pontuacaoMetas + pontuacaoComportamentos;

        // Atualização da Tela Principal
        const elemConh = document.getElementById('lblScoreConhecimentos');
        const elemHab = document.getElementById('lblScoreHabilidades');
        const elemMetas = document.getElementById('lblScoreMetas');
        const elemComp = document.getElementById('lblScoreComportamentos');
        const elemTotal = document.getElementById('lblScoreTotal');

        if (elemConh) elemConh.innerText = `\({pontuacaoConhecimentos.toFixed(2)} pts (Média:\){avgConhecimentos.toFixed(1)})`;
        if (elemHab) elemHab.innerText = `\({pontuacaoHabilidades.toFixed(2)} pts (Média:\){avgHabilidades.toFixed(1)})`;
        if (elemMetas) elemMetas.innerText = `\({pontuacaoMetas.toFixed(2)} pts (Média:\){avgMetas.toFixed(1)})`;
        if (elemComp) elemComp.innerText = `\({pontuacaoComportamentos.toFixed(2)} pts (Média:\){avgComportamentos.toFixed(1)})`;
        if (elemTotal) elemTotal.innerText = totalPontuacao.toFixed(2);

        return {
            isAuto, avgConhecimentos, avgHabilidades, avgMetas, avgComportamentos,
            pontuacaoConhecimentos, pontuacaoHabilidades, pontuacaoMetas, pontuacaoComportamentos, totalPontuacao
        };
    }

    // Verifica se todos os campos visíveis possuem nota antes de gerar o PDF
    function validateAllScoresFilled(isAuto) {
        const requiredInputs = document.querySelectorAll('.score-input');
        for (let input of requiredInputs) {
            // Se for avaliação da chefia e o campo for de mediadores, ignora
            if (!isAuto && input.classList.contains('input-mediadores')) {
                continue;
            }
            if (input.value === '' || isNaN(parseFloat(input.value))) {
                return false;
            }
        }
        return true;
    }

    function generateDetailedNotesTable(isAuto) {
        const tbody = document.getElementById('pTableDetailedNotes');
        if (!tbody) return;
        tbody.innerHTML = '';

        const dimBlocks = document.querySelectorAll('.dimensao-block');
        dimBlocks.forEach(block => {
            if (!isAuto && block.id === 'blockMediadores') return;

            const title = block.querySelector('h4').innerText;
            const trTitle = document.createElement('tr');
            trTitle.innerHTML = `

${title}`;
tbody.appendChild(trTitle);

        const items = block.querySelectorAll('.question-item');
        items.forEach(item => {
            const questionText = item.querySelector('label').innerText;
            const inputVal = item.querySelector('input').value;
            const trItem = document.createElement('tr');
            trItem.innerHTML = `

${questionText}

${inputVal !== '' ? parseInt(inputVal, 10) : '-'}
`;
tbody.appendChild(trItem);
});
});
}

function prepareReportData() {
    const scores = calculateScores();
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    const nomeServidor = document.getElementById('nomeServidor').value || 'Servidor(a)';
    const nomeChefia = document.getElementById('nomeChefia').value || 'Chefia Imediata';

    // Preenchimento dos dados de identificação
    const pModalidadeBadge = document.getElementById('pModalidadeBadge');
    if (pModalidadeBadge) pModalidadeBadge.innerText = scores.isAuto ? 'AUTOAVALIAÇÃO' : 'AVALIAÇÃO DA CHEFIA IMEDIATA';

    const pNomeServidor = document.getElementById('pNomeServidor');
    if (pNomeServidor) pNomeServidor.innerText = nomeServidor;

    const pSiape = document.getElementById('pSiape');
    if (pSiape) pSiape.innerText = document.getElementById('siape').value || 'Não Informado';

    const pCargoServidor = document.getElementById('pCargoServidor');
    if (pCargoServidor) pCargoServidor.innerText = document.getElementById('cargoServidor').value || 'Não Informado';

    const pPeriodo = document.getElementById('pPeriodo');
    if (pPeriodo) pPeriodo.innerText = document.getElementById('periodoAvaliacao').value || 'Não Informado';

    const pOrgaoDestino = document.getElementById('pOrgaoDestino');
    if (pOrgaoDestino) pOrgaoDestino.innerText = document.getElementById('orgaoDestino').value || 'Não Informado';

    const pNomeChefia = document.getElementById('pNomeChefia');
    if (pNomeChefia) pNomeChefia.innerText = nomeChefia;

    const pCargoChefia = document.getElementById('pCargoChefia');
    if (pCargoChefia) pCargoChefia.innerText = document.getElementById('cargoChefia').value || 'Não Informado';

    generateDetailedNotesTable(scores.isAuto);

    // Preenchimento das Médias e Pontuações (Com verificação defensiva de elementos)
    const setInnerText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    setInnerText('pMediaConhecimentos', scores.avgConhecimentos.toFixed(1));
    setInnerText('pPontuacaoConhecimentos', scores.pontuacaoConhecimentos.toFixed(2));

    setInnerText('pMediaHabilidades', scores.avgHabilidades.toFixed(1));
    setInnerText('pPontuacaoHabilidades', scores.pontuacaoHabilidades.toFixed(2));

    setInnerText('pMediaMetas', scores.avgMetas.toFixed(1));
    setInnerText('pPontuacaoMetas', scores.pontuacaoMetas.toFixed(2));

    setInnerText('pMediaComportamentos', scores.avgComportamentos.toFixed(1));
    setInnerText('pPontuacaoComportamentos', scores.pontuacaoComportamentos.toFixed(2));

    if (scores.isAuto) {
        setInnerText('pMediaMediadores', getAverage('input-mediadores').toFixed(1));
    }

    setInnerText('pTotalObtido', `\({scores.totalPontuacao.toFixed(2)} /\){scores.isAuto ? '4.25' : '5.75'}`);
    setInnerText('pObservacoes', document.getElementById('observacoes').value || 'Sem observações.');

    // Assinatura
    const sigContainer = document.getElementById('pSignaturesContainer');
    if (sigContainer) {
        if (scores.isAuto) {
            sigContainer.innerHTML = `

${nomeServidor}

Servidor(a) Avaliado(a)

Data: ${dataHoje}

`;

} else {
sigContainer.innerHTML = `

${nomeChefia}

Chefia Imediata (Avaliador)

Data: ${dataHoje}

            `;
        }
    }

    return scores;
}

function formatFileName(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
}

if (btnDownloadPDF) {
    btnDownloadPDF.addEventListener('click', async () => {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';

        // 1. Validação dos campos obrigatórios
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 2. Validação se TODAS as notas foram atribuídas
        if (!validateAllScoresFilled(isAuto)) {
            alert('Por favor, preencha todas as notas da avaliação antes de gerar o relatório PDF.');
            return;
        }

        prepareReportData();

        const printArea = document.getElementById('printArea');
        const nomeServidor = document.getElementById('nomeServidor').value || 'servidor';
        const nomeChefia = document.getElementById('nomeChefia').value || 'chefia';

        let filenamePDF = isAuto 
            ? `autoavaliacao_${formatFileName(nomeServidor)}.pdf`
            : `avaliacao_\({formatFileName(nomeChefia)}_\){formatFileName(nomeServidor)}.pdf`;

        const clone = printArea.cloneNode(true);
        clone.id = 'pdfTempContainer';
        clone.style.display = 'block';
        clone.style.width = '700px';
        clone.style.margin = '0 auto';
        clone.style.backgroundColor = '#ffffff';

        document.body.appendChild(clone);

        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     filenamePDF,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['css', 'legacy'] }
        };

        try {
            await html2pdf().set(opt).from(clone).save();
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            alert('Ocorreu um erro ao gerar o PDF. Verifique os dados e tente novamente.');
        } finally {
            const temp = document.getElementById('pdfTempContainer');
            if (temp) {
                document.body.removeChild(temp);
            }
        }
    });
}

updateModalidadeUI();

});


*Lembre-se apenas de conferir no seu `index.html` se os campos de resultado da tabela do relatório usam os IDs atualizados (ex: `id="pPontuacaoConhecimentos"`, `id="pPontuacaoHabilidades"`, `id="pPontuacaoMetas"`, `id="pPontuacaoComportamentos"`).*
