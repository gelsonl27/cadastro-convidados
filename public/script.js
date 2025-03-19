// public/script.js
document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos do DOM
    const formCadastro = document.getElementById('form-cadastro');
    const tabelaConvidados = document.getElementById('tabela-convidados').getElementsByTagName('tbody')[0];
    const registroSucesso = document.getElementById('registro-sucesso');
    const modalDetalhes = document.getElementById('modal-detalhes');
    const detalhesConvidado = document.getElementById('detalhes-convidado');
    const fecharBtn = document.getElementsByClassName('fechar')[0];
    const fecharModalBtn = document.getElementById('fechar-modal');
    
    // Carregar lista de convidados ao iniciar
    carregarConvidados();
    
    // Event listeners
    formCadastro.addEventListener('submit', cadastrarConvidado);
    fecharBtn.addEventListener('click', fecharModal);
    fecharModalBtn.addEventListener('click', fecharModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === modalDetalhes) {
            fecharModal();
        }
    });
    
    // Função para carregar convidados
    function carregarConvidados() {
        fetch('http://localhost:3000/api/convidados')
            .then(response => response.json())
            .then(convidados => {
                atualizarTabela(convidados);
            })
            .catch(error => {
                console.error('Erro ao carregar convidados:', error);
                alert('Erro ao carregar a lista de convidados. Por favor, tente novamente.');
            });
    }
    
    // Função para cadastrar convidado
    function cadastrarConvidado(e) {
        e.preventDefault();
        
        const dadosConvidado = {
            nomeMorador: document.getElementById('nome-morador').value,
            numeroSalao: document.getElementById('numero-salao').value,
            nomeConvidado: document.getElementById('nome-convidado').value,
            rgConvidado: document.getElementById('rg-convidado').value,
            placaVeiculo: document.getElementById('placa-veiculo').value,
            anoVeiculo: document.getElementById('ano-veiculo').value,
            modeloVeiculo: document.getElementById('modelo-veiculo').value,
            corVeiculo: document.getElementById('cor-veiculo').value,
            dataEvento: document.getElementById('data-evento').value
        };
        
        
        fetch('http://localhost:3000/api/convidados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosConvidado)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                formCadastro.reset();
                
                // Mostrar mensagem de sucesso
                registroSucesso.style.display = 'block';
                setTimeout(() => {
                    registroSucesso.style.display = 'none';
                }, 3000);
                
                // Recarregar lista de convidados
                carregarConvidados();
                
                // Abrir modal com detalhes do convidado cadastrado
                mostrarDetalhesConvidado(data.convidado);
            } else {
                alert('Erro ao cadastrar convidado: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Erro ao cadastrar convidado:', error);
            alert('Erro ao cadastrar convidado. Por favor, tente novamente.');
        });
    }

    
    // Função para atualizar a tabela de convidados
    function atualizarTabela(convidados) {
        tabelaConvidados.innerHTML = '';
        
        if (convidados.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7" style="text-align: center;">Nenhum convidado cadastrado</td>';
            tabelaConvidados.appendChild(tr);
            return;
        }
        
        convidados.forEach(convidado => {
            const tr = document.createElement('tr');
            
            // Informações do veículo formatadas
            const infoVeiculo = convidado.placa_veiculo ? 
                `${convidado.placa_veiculo}` : 
                'Não informado';
            
            tr.innerHTML = `
                <td>${convidado.nome_morador}</td>
                <td>${convidado.numero_salao}</td>
                <td>${convidado.nome_convidado}</td>
                <td>${convidado.rg}</td>
                <td>${formatarData(convidado.data_evento)}</td>
                <td>${infoVeiculo}</td>
                <td>
                    <button class="btn-detalhes" data-id="${convidado.id}">Detalhes</button>
                    <button class="btn-remover" data-id="${convidado.id}">Remover</button>
                </td>
            `;
            
            tabelaConvidados.appendChild(tr);
        });
        
        // Adicionar event listeners aos botões
        document.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja remover este convidado?')) {
                    removerConvidado(id);
                }
            });
        });
        
        document.querySelectorAll('.btn-detalhes').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const convidado = convidados.find(c => c.id == id);
                mostrarDetalhesConvidado(convidado);
            });
        });
    }
    
    // Função para remover convidado
    function removerConvidado(id) {
        fetch(`http://localhost:3000/api/convidados/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                carregarConvidados();
            } else {
                alert('Erro ao remover convidado: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Erro ao remover convidado:', error);
            alert('Erro ao remover convidado. Por favor, tente novamente.');
        });
    }
    
    // Função para mostrar detalhes do convidado em um modal
    function mostrarDetalhesConvidado(convidado) {
        // Criar o conteúdo HTML com os detalhes
        let detalhesHTML = `
            <div class="detalhe-item">
                <span class="detalhe-label">Data de Cadastro:</span>
                <span class="detalhe-valor">${formatarDataHora(convidado.data_cadastro)}</span>
            </div>
            
            <div class="detalhe-item">
                <span class="detalhe-label">Morador Responsável:</span>
                <span class="detalhe-valor">${convidado.nome_morador}</span>
            </div>
            
            <div class="detalhe-item">
                <span class="detalhe-label">Salão Reservado:</span>
                <span class="detalhe-valor">${convidado.numero_salao}</span>
            </div>
            
            <div class="detalhe-item">
                <span class="detalhe-label">Nome do Convidado:</span>
                <span class="detalhe-valor">${convidado.nome_convidado}</span>
            </div>
            
            <div class="detalhe-item">
                <span class="detalhe-label">RG:</span>
                <span class="detalhe-valor">${convidado.rg}</span>
            </div>
            
            <div class="detalhe-item">
                <span class="detalhe-label">Data do Evento:</span>
                <span class="detalhe-valor">${formatarData(convidado.data_evento)}</span>
            </div>
            
            <div class="detalhe-item">
                <span class="detalhe-label">Informações do Veículo:</span>
                <div class="detalhe-valor">
        `;
        
        if (convidado.placa_veiculo) {
            detalhesHTML += `<p><strong>Placa:</strong> ${convidado.placa_veiculo}</p>`;
        }
        
        if (convidado.modelo_veiculo) {
            detalhesHTML += `<p><strong>Modelo:</strong> ${convidado.modelo_veiculo}</p>`;
        }
        
        if (convidado.ano_veiculo) {
            detalhesHTML += `<p><strong>Ano:</strong> ${convidado.ano_veiculo}</p>`;
        }
        
        if (convidado.cor_veiculo) {
            detalhesHTML += `<p><strong>Cor:</strong> ${convidado.cor_veiculo}</p>`;
        }
        
        if (!convidado.placa_veiculo && !convidado.modelo_veiculo && 
            !convidado.ano_veiculo && !convidado.cor_veiculo) {
            detalhesHTML += `<p>Nenhuma informação de veículo cadastrada</p>`;
        }
        
        detalhesHTML += `
                </div>
            </div>
        `;
        
        // Inserir o HTML no modal
        detalhesConvidado.innerHTML = detalhesHTML;
        
        // Exibir o modal
        modalDetalhes.style.display = 'block';
    }
    
    // Função para fechar o modal
    function fecharModal() {
        modalDetalhes.style.display = 'none';
    }
    
    // Função para formatar data
    function formatarData(dataString) {
        if (!dataString) return 'Data não informada';
        
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }
    
    // Função para formatar data e hora
    function formatarDataHora(dataString) {
        if (!dataString) return 'Data não informada';
        
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
    }
});