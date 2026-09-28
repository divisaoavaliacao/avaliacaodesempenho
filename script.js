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
            // Remove qualquer caractere não numérico
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
            blockMediadores.style.display = 'block';
            if (rowPrintMediadores) rowPrintMediadores.style.display = 'table-row';
            document.getElementById('lblScoreMax').innerText = '(Máximo: 4.25)';
        } else {
            blockMediadores.style.display = 'none';
            if (rowPrintMediadores) rowPrintMediadores.style.display = 'none';
            document.getElementById('lblScoreMax').innerText = '(Máximo: 5.75)';
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

        const pondConhecimentos = avgConhecimentos * factorConhecimentos;
        const pondHabilidades = avgHabilidades * factorHabilidades;
        const pondMetas = avgMetas * factorMetas;
        const pondComportamentos = avgComportamentos * factorComportamentos;

        const totalPonderado = pondConhecimentos + pondHabilidades + pondMetas + pondComportamentos;

        document.getElementById('lblScoreConhecimentos').innerText = `\({pondConhecimentos.toFixed(2)} pts (Média:\){avgConhecimentos.toFixed(1)})`;
        document.getElementById('lblScoreHabilidades').innerText = `\({pondHabilidades.toFixed(2)} pts (Média:\){avgHabilidades.toFixed(1)})`;
        document.getElementById('lblScoreMetas').innerText = `\({pondMetas.toFixed(2)} pts (Média:\){avgMetas.toFixed(1)})`;
        document.getElementById('lblScoreComportamentos').innerText = `\({pondComportamentos.toFixed(2)} pts (Média:\){avgComportamentos.toFixed(1)})`;
        document.getElementById('lblScoreTotal').innerText = totalPonderado.toFixed(2);

        return {
            isAuto, avgConhecimentos, avgHabilidades, avgMetas, avgComportamentos,
            pondConhecimentos, pondHabilidades, pondMetas, pondComportamentos, totalPonderado
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
        tbody.innerHTML = '';

        const dimBlocks = document.querySelectorAll('.dimensao-block');
        dimBlocks.forEach(block => {
            if (!isAuto && block.id === 'blockMediadores') return;

            const title = block.querySelector('h4').innerText;
            const trTitle = document.createElement('tr');
            trTitle.innerHTML = `
