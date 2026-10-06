import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // LÓGICA DA PÁGINA DE CADASTRO
    // ==========================================
    const form = document.getElementById('desaparecido-form')
    if (form) {
        const loadingOverlay = document.getElementById('loading-overlay')
        const successMessage = document.getElementById('success-message')

        form.addEventListener('submit', async (e) => {
            e.preventDefault()
            if (loadingOverlay) loadingOverlay.style.display = 'flex'

            try {
const fotoInput = document.getElementById('imagem')
let fotoUrl = ''


                // Faz o upload da foto para o Supabase Storage se o usuário selecionou uma imagem
                if (fotoInput && fotoInput.files.length > 0) {
                    const file = fotoInput.files[0]
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Date.now()}.${fileExt}`
                    const filePath = `${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('fotos')
                        .upload(filePath, file)

                    if (uploadError) throw uploadError

                    // Pega a URL pública da imagem salva no Bucket
                    const { data: publicData } = supabase.storage
                        .from('fotos')
                        .getPublicUrl(filePath)

                    fotoUrl = publicData.publicUrl
                }

                // Monta o objeto com os dados do formulário
                const novoDesaparecido = {
                    nome: document.getElementById('nome').value,
                    idade: parseInt(document.getElementById('idade').value),
                    local: document.getElementById('local').value,
                    data_desaparecimento: document.getElementById('data').value,
                    foto_url: fotoUrl, // Salva o link público da foto
                    ultimo_contato: document.getElementById('ultimo-contato').value,
                    parentesco: document.getElementById('parentesco').value,
                    caracteristicas_fisicas: document.getElementById('caracteristicas-fisicas').value,
                    roupas: document.getElementById('roupas').value,
                    telefone_contato: document.getElementById('telefone-contato').value,
                    descricao: document.getElementById('descricao').value
                }

                // Insere os dados na tabela 'desaparecidos'
                const { error: insertError } = await supabase
                    .from('desaparecidos')
                    .insert([novoDesaparecido])

                if (insertError) throw insertError

                form.style.display = 'none'
                if (successMessage) successMessage.style.display = 'block'

            } catch (erro) {
                console.error('Erro ao cadastrar:', erro)
                alert('Ocorreu um erro ao realizar o cadastro. Tente novamente.')
            } finally {
                if (loadingOverlay) loadingOverlay.style.display = 'none'
            }
        })

        document.getElementById('verListaBtn')?.addEventListener('click', () => {
            window.location.href = 'lista.html'
        })
    }

    // ==========================================
    // LÓGICA DA PÁGINA DE LISTAGEM
    // ==========================================
    const listaContainer = document.getElementById('desaparecidos-list')
    if (listaContainer) {
        carregarDesaparecidos()

        window.searchDesaparecidos = function() {
            const termo = document.getElementById('searchInput').value
            carregarDesaparecidos(termo)
        }
    }
})

// Função para buscar e exibir os dados na lista
async function carregarDesaparecidos(filtro = '') {
    const listaContainer = document.getElementById('desaparecidos-list')
    if (!listaContainer) return

    listaContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Carregando desaparecidos...</p>'

    let query = supabase.from('desaparecidos').select('*').order('created_at', { ascending: false })

    if (filtro.trim() !== '') {
        query = query.or(`nome.ilike.%${filtro}%,descricao.ilike.%${filtro}%`)
    }

    const { data: desaparecidos, error } = await query

    if (error) {
        console.error('Erro ao buscar lista:', error)
        listaContainer.innerHTML = '<p>Erro ao carregar os dados.</p>'
        return
    }

    listaContainer.innerHTML = ''

    if (desaparecidos.length === 0) {
        listaContainer.innerHTML = '<p>Nenhum registro encontrado.</p>'
        return
    }

    desaparecidos.forEach(item => {
        const card = document.createElement('div')
        card.className = 'card-desaparecido'
        
        // Se houver foto cadastrada, usa ela. Senão, usa a imagem padrão 'WEBFINDER.jpg'
        const fotoSrc = (item.foto_url && item.foto_url.trim() !== '') ? item.foto_url : 'WEBFINDER.jpg'

        card.innerHTML = `
            <img src="${fotoSrc}" alt="Foto de ${item.nome}" style="width: 100%; height: 200px; object-fit: cover;">
            <div style="padding: 15px;">
                <h3>${item.nome}</h3>
                <p><strong>Idade:</strong> ${item.idade} anos</p>
                <p><strong>Local:</strong> ${item.local}</p>
                <button class="detalhes-btn" style="margin-top: 10px; padding: 8px 12px; cursor: pointer;">Ver Detalhes</button>
            </div>
        `

        card.querySelector('.detalhes-btn').addEventListener('click', () => {
            abrirModalDetalhes(item)
        })

        listaContainer.appendChild(card)
    })
}

// Função para abrir o Modal de Detalhes Centralizado e com a Foto correta
function abrirModalDetalhes(item) {
    const modal = document.getElementById('desaparecidoModal')
    if (!modal) return

    // Puxa a foto exata cadastrada, ou usa a padrão caso esteja vazia
    const fotoModalSrc = (item.foto_url && item.foto_url.trim() !== '') ? item.foto_url : 'WEBFINDER.jpg'

    document.getElementById('modalFoto').src = fotoModalSrc
    document.getElementById('modalNome').textContent = item.nome || 'Não informado'
    document.getElementById('modalIdade').textContent = item.idade ? `${item.idade} anos` : 'Não informada'
    document.getElementById('modalLocal').textContent = item.local || 'Não informado'
    document.getElementById('modalData').textContent = item.data_desaparecimento ? new Date(item.data_desaparecimento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'
    document.getElementById('modalUltimoContato').textContent = item.ultimo_contato || 'Não informado'
    document.getElementById('modalParentesco').textContent = item.parentesco || 'Não informado'
    document.getElementById('modalCaracteristicas').textContent = item.caracteristicas_fisicas || 'Não informado'
    document.getElementById('modalRoupas').textContent = item.roupas || 'Não informado'
    document.getElementById('modalTelefone').textContent = item.telefone_contato || 'Não informado'
    document.getElementById('modalDescricao').textContent = item.descricao || 'Não informado'

    // Exibe o modal centralizado na tela
modal.style.display = 'flex';

    const closeBtn = modal.querySelector('.close-btn')
    if (closeBtn) {
        closeBtn.onclick = () => { modal.style.display = 'none' }
    }

    // Fecha ao clicar fora da caixa do modal
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'
        }
    }
}
