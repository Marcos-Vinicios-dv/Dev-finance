const Modal = {
    open() {
        // Selector serve para pegar uma classe css e com classList eu encontro 
        document.querySelector('.modal-overlay').classList.add('active');

    },
    close() {
        // PESQUISAR A FUNÇÃO TOGGLE CLASSLIST
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get() {
        // com o JSON.parse convertemos de volta em array ou objeto
        return JSON.parse(localStorage.getItem("dev.finance:transactions")) || [];

    },
    set(transactions) {

        // para armazenarmos no localStorage um array inteiro precisamos comverte-lo
        // em string usando JSON.stringfy()
        localStorage.setItem("dev.finance:transactions", JSON.stringify(transactions));

    }
}

// primeira coisa a se fazer, CRIAR AS FUNCIONALIDADES

//remover das entradas o valor das saídas
//assim eu terei o total

//objetos com letra maiuscula
const Transaction = {
    // refatorando o codigo
    all: Storage.get(),
    add(transaction) {

        Transaction.all.push(transaction);

        App.reload();

    },
    remove(index) {

        Transaction.all.splice(index, 1);

        App.reload();

    },
    incomes() {

        let income = 0;
        //pepgar todas as transações
        // para cada transação
        Transaction.all.forEach((transaction) => {
            // se ela for maior que zero
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        // retornar variable
        return income;
    },
    expenses() {

        let expense = 0;
        //pepgar todas as transações
        // para cada transação
        Transaction.all.forEach((transaction) => {
            // se ela for menor que zero
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        // retornar variabl
        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
};

// Substituir os dados do HTML com os dados do JS

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        // createElement cria uma tag html no js
        const tr = document.createElement('tr')
        // nele podemos usar um método para inserir um html nele
        tr.innerHTML = DOM.inneHTMLTransaction(transaction, index)
        // em seguida chamamos a função que esta dentro do objeto DOM

        tr.dataset.index = index;

        // com o container de mudanças selecionado vamos de
        // vamos alterar seu conteúdo usando o método appendChild
        DOM.transactionsContainer.appendChild(tr);
        // e introduzir no nosso container o elemnto/tag html que criamos acima
    },
    inneHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `

            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img src="./assets/minus.svg" alt="Remover Transação" onclick="Transaction.remove(${index})" />
            </td>

        `

        return html;
    },
    updateBalance() {
        // usando o getElementById pegamos qualquer elemento do HTML com
        // id especificado, e com o innerHTML inserimos o valor que 
        // queremos no lugar do que ja tinha
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },
    clearTransactions() {

        DOM.transactionsContainer.innerHTML = '';

    },
}

const Utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value);
    },
    formatDate(date) {
        const splitted = date.split("-")

        return `${splitted[2]}/${splitted[1]}/${splitted[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value;

        // dentro do replace e provavelmente de outros métodos podemos usar
        // uma expressão regular " /qualquer valor(que se repita ou não)/g "
        // com esse "g(de global)" o replace sera executado para a string inteira
        // value = String(value).replace(/0/g, "test")

        // expressão regular para encontrar tudo que não é numero
        // value = String(value).replace(/\D/g, "test")
    },
}

const Form = {
    // como no css eu pego o id e o elemento
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // agora eu quero apenas os valores não o elemento todo
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    validateFields() {

        const { description, amount, date } = Form.getValues();
        // o trim serve para fazer uma limpeza nos espaços vazios
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor preencha todos os campos")
        }

    },
    formatValues() {

        // aqui não usamos o const pois vamos alterar esses valores
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return { description, amount, date };

    },
    clearFields() {

        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";

    },
    submit(event) {
        event.preventDefault();// estou dizendo para não executar o evento padrã

        try {

            // verificar se todas as infomações foram preenchidas
            Form.validateFields();

            // formatar os ddados para salvar
            const transaction = Form.formatValues();

            // salvar 
            Transaction.add(transaction);

            // apagar os dados do formulario
            Form.clearFields();

            // fechar modal
            Modal.close();

        } catch (error) {
            alert(error.message);
        }

    }
}

const App = {
    init() {

        // o método forEach aplica uma função para cada elemetno do array/elemtno
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance();

        Storage.set(Transaction.all)

    },
    reload() {

        DOM.clearTransactions();

        App.init();

    }
}

App.init();