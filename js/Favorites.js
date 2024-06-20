import { GithubUser } from "./GithubUser.js"

// Classe que vai conter a lógica dos dados e como os dados serão estruturados
export class Favorites {

    // Construtor da classe Favorites
    constructor(root) {
        // Seleciona o elemento root no DOM
        this.root = document.querySelector(root)
        // Carrega os dados do localStorage
        this.load()
    }

    // Método para carregar os dados do localStorage
    load() {
        // Recupera os dados armazenados ou inicializa com uma lista vazia
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    // Método para salvar os dados no localStorage
    save() {
        // Converte os dados em string JSON e salva no localStorage
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    // Método assíncrono para adicionar um usuário
    async add(username) {
        try {
            // Verifica se o usuário já está na lista
            const userExists = this.entries.find(entry => entry.login === username)

            // Se o usuário já existe, lança um erro
            if(userExists){
                throw new Error('Usuário já cadastrado')
            }

            // Busca o usuário na API do GitHub
            const user = await GithubUser.search(username)

            // Se o usuário não for encontrado, lança um erro
            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            // Adiciona o usuário no início da lista
            this.entries = [user, ...this.entries]
            // Atualiza a interface
            this.update()
            // Salva a lista atualizada no localStorage
            this.save()

        } catch(error) {
            // Exibe uma mensagem de erro
            alert(error.message)
        }
    }

    // Método para deletar um usuário
    delete(user) {
        // Filtra a lista removendo o usuário especificado
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
        // Atualiza a lista de entradas
        this.entries = filteredEntries
        // Atualiza a interface
        this.update()
        // Salva a lista atualizada no localStorage
        this.save()
    }
}

// Classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
    // Construtor da classe FavoritesView
    constructor(root) {
        // Chama o construtor da classe Favorites
        super(root)
        // Seleciona o corpo da tabela
        this.tbody = this.root.querySelector('table tbody')
        // Atualiza a interface
        this.update()
        // Configura o evento de adicionar
        this.onadd()
    }

    // Método para configurar o evento de adicionar usuário
    onadd() {
        // Seleciona o botão de adicionar
        const addButton = this.root.querySelector('.search button')
        // Define o evento de clique no botão
        addButton.onclick = () => {
            // Obtém o valor do campo de entrada
            const { value } = this.root.querySelector('.search input')
            // Adiciona o usuário
            this.add(value)
        }
    }

    // Método para atualizar a interface
    update() {
        // Remove todas as linhas da tabela
        this.removeAllTr()
        
        // Itera sobre cada entrada de usuário
        this.entries.forEach(user => {
            // Cria uma nova linha para o usuário
            const row = this.createRow()
            
            // Configura os dados do usuário na linha
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            // Configura o evento de clique no botão de remover
            row.querySelector('.remove').onclick = () => {
                // Confirmação de exclusão
                const isOk = confirm('Tem certeza que deseja deletar essa linha?')
                // Se confirmado, remove o usuário
                if(isOk) {
                    this.delete(user)
                }
            }

            // Adiciona a linha na tabela
            this.tbody.append(row)
        })
    }

    // Método para criar uma nova linha na tabela
    createRow() {
        // Cria um elemento de linha (tr)
        const tr = document.createElement('tr')
        // Define o conteúdo HTML da linha
        tr.innerHTML = `
        <td class="user">
           <img src="https://github.com/maykbrito.png" alt="Imagem de maykbrito">
           <a href="https://github.com/maykbrito" target="_blank">
             <p>Mayk Brito</p>
             <span>maykbrito</span>
           </a>
         </td>
         <td class="repositories">
           76
         </td>
         <td class="followers">
           9589
         </td>
         <td>
           <button class="remove">&times;</button>
         </td>
        `
        // Retorna a linha criada
        return tr
    }

    // Método para remover todas as linhas da tabela
    removeAllTr() {
        // Seleciona todas as linhas na tabela e remove cada uma
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        });
    }
}
