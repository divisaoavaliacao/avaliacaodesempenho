document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('evalForm');
    const radiosModalidade = document.querySelectorAll('input[name="modalidade"]');
    const blockMediadores = document.getElementById('blockMediadores');
    const rowPrintMediadores = document.getElementById('rowPrintMediadores');
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');

    // Seleciona todos os campos de notas
    const scoreInputs = document.querySelectorAll('.score-input');

    scoreInputs.forEach(input => {
        // Assegura atributos para aceitar somente números inteiros de 0 a 10
        input.setAttribute('type', 'number');
        input.setAttribute('min', '0');
        input.setAttribute('max', '10');
        input.setAttribute('step', '1');
        input.setAttribute('inputmode', 'numeric');

        // Bloqueia vírgula, ponto, sinal negativo e expoentes durante a digitação
        input.addEventListener('keydown', (e) => {
            if (['.', ',', '-', 'e', 'E', '+'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Limpeza instantânea durante digitação / colagem
        input.addEventListener('input', () => {
            // Remove tudo que não for número inteiro
            let cleanVal = input.value.replace(/[^0-9]/g, '');

            if (cleanVal !== '') {
                let val = parseInt(cleanVal, 10);
                if (val > 10) val = 10;
                if (val < 0) val = 0;
                input.value = val;
            } else {
                input.value = '';
            }
            calculateScores();
        });

        // Validação ao sair do campo (blur)
        input.addEventListener('blur', () => {
            if (input.value === '' || isNaN(parseInt(input.value, 10))) {
                input.value = '0';
            } else {
                let val = parseInt(input.value, 10);
                if (val > 10) input.value = '10';
                if (val < 0) input.value = '0';
                input.value = val;
            }
            calculateScores();
        });
    });

    function updateModalidadeUI() {
        const checkedModalidade = document.querySelector('input[name="modalidade"]:checked');
        const isAuto = checkedModalidade ? checkedModalidade.value === 'auto' : true;

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
        const validInputs = inputs.filter(i => i.value !== '' && !isNaN(parseInt(i.value, 10)));
        if (validInputs.length === 0) return 0;
        const sum = validInputs.reduce((acc, curr) => acc + parseInt(curr.value, 10), 0);
        return sum / validInputs.length;
    }

    function calculateScores() {
        const checkedModalidade = document.querySelector('input[name="modalidade"]:checked');
        const isAuto = checkedModalidade ? checkedModalidade.value === 'auto' : true;

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

        // Atualização dos elementos na tela
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

    function validateAllScoresFilled(isAuto) {
        const requiredInputs = document.querySelectorAll('.score-input');
        for (let input of requiredInputs) {
            if (!isAuto && input.classList.contains('input-mediadores')) {
                continue;
            }
            if (input.value === '' || isNaN(parseInt(input.value, 10))) {
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

        const titleText = block.querySelector('h4') ? block.querySelector('h4').innerText : '';
        const trTitle = document.createElement('tr');
        trTitle.innerHTML = `

${titleText}`;
tbody.appendChild(trTitle);

    const items = block.querySelectorAll('.question-item');
    items.forEach(item => {
        const questionText = item.querySelector('label') ? item.querySelector('label').innerText : '';
        const inputVal = item.querySelector('input') ? item.querySelector('input').value : '0';
        const trItem = document.createElement('tr');
        trItem.innerHTML = `

${questionText}

${inputVal !== '' ? parseInt(inputVal, 10) : '0'}
`;
tbody.appendChild(trItem);
});
});
}

function prepareReportData() {
const scores = calculateScores();
const dataHoje = new Date().toLocaleDateString('pt-BR');

const nomeServidor = document.getElementById('nomeServidor').value || '';
const nomeChefia = document.getElementById('nomeChefia').value || '';

const pModalidadeBadge = document.getElementById('pModalidadeBadge');
if (pModalidadeBadge) {
    pModalidadeBadge.innerText = scores.isAuto ? 'AUTOAVALIAÇÃO' : 'AVALIAÇÃO DA CHEFIA IMEDIATA';
}

const setInnerText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
};

// 1. Dados de Identificação
setInnerText('pNomeServidor', nomeServidor);
setInnerText('pSiape', document.getElementById('siape').value || '');
setInnerText('pCargoServidor', document.getElementById('cargoServidor').value || '');
setInnerText('pPeriodo', document.getElementById('periodoAvaliacao').value || '');
setInnerText('pOrgaoOrigem', document.getElementById('orgaoOrigem')?.value || 'UFFS');
setInnerText('pOrgaoDestino', document.getElementById('orgaoDestino').value || '');
setInnerText('pNomeChefia', nomeChefia);
setInnerText('pCargoChefia', document.getElementById('cargoChefia').value || '');

// 2. Tabela Detalhada de Notas
generateDetailedNotesTable(scores.isAuto);

// 3. Resumo Ponderado das Dimensões
setInnerText('pMediaConhecimentos', scores.avgConhecimentos.toFixed(1));
setInnerText('pPondConhecimentos', scores.pontuacaoConhecimentos.toFixed(2));

setInnerText('pMediaHabilidades', scores.avgHabilidades.toFixed(1));
setInnerText('pPondHabilidades', scores.pontuacaoHabilidades.toFixed(2));

setInnerText('pMediaMetas', scores.avgMetas.toFixed(1));
setInnerText('pPondMetas', scores.pontuacaoMetas.toFixed(2));

setInnerText('pMediaComportamentos', scores.avgComportamentos.toFixed(1));
setInnerText('pPondComportamentos', scores.pontuacaoComportamentos.toFixed(2));

// Exibir/Ocultar linha de Mediadores na Tabela de Resumo
const rowMediadores = document.getElementById('rowPrintMediadores');
if (rowMediadores) {
    if (scores.isAuto) {
        rowMediadores.style.display = 'table-row';
        setInnerText('pMediaMediadores', getAverage('input-mediadores').toFixed(1));
        setInnerText('pPondMediadores', 'N/A');
    } else {
        rowMediadores.style.display = 'none';
    }
}

setInnerText('pTotalObtido', `\({scores.totalPontuacao.toFixed(2)} /\){scores.isAuto ? '4.25' : '5.75'}`);
setInnerText('pObservacoes', document.getElementById('observacoes').value || 'Sem observações.');

// Assinatura
const sigContainer = document.getElementById('pSignaturesContainer');
if (sigContainer) {
    const assinadoPor = scores.isAuto ? nomeServidor : nomeChefia;
    const papel = scores.isAuto ? 'Servidor(a) Avaliado(a)' : 'Chefia Imediata (Avaliador)';

    sigContainer.innerHTML = `

${assinadoPor}

${papel}

Data: ${dataHoje}

    `;
}

return scores;

}

function formatFileName(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
}

if (btnDownloadPDF) {
    btnDownloadPDF.addEventListener('click', async () => {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!validateAllScoresFilled(isAuto)) {
            alert('Por favor, preencha todas as notas da avaliação com números inteiros de 0 a 10.');
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

// Inicialização da interface e cálculo inicial
updateModalidadeUI();

});
